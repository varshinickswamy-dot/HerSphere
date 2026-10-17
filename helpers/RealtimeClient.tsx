// Reconnecting Floot Realtime client (browser). Connects to the wss endpoint
// returned by the _realtime/token response (cross-origin is fine — the token
// rides the query string), refreshes its token, auto-reconnects with
// exponential backoff + jitter, heartbeats under API Gateway's 10-min idle
// timeout, and re-subscribes on reconnect. Messages are at-most-once — use
// onReconnect() to refetch any state that may have changed while disconnected.

import { postRealtimeToken } from "../endpoints/_realtime/token_POST.schema";
import { postRealtimeSend } from "../endpoints/_realtime/send_POST.schema";
   10	import { postRealtimeLastseen } from "../endpoints/_realtime/lastseen_POST.schema";
   11	
   12	export type RealtimeStatus = "connecting" | "connected" | "disconnected";
   13	type Handler = (data: any) => void;
   14	// The current roster of a presence channel. count is the server's number on a
   15	// batched channel (presenceBatchOf) and members.length everywhere else.
   16	export type PresenceRoster = { members: string[]; count: number };
   17	
   18	export class RealtimeClient {
   19	  private ws: WebSocket | null = null;
   20	  private channels = new Map<string, Set<Handler>>();
   21	  // Presence handlers are tracked separately from data handlers but share the
   22	  // same underlying channel subscription. They receive the whole roster, which
   23	  // the client keeps per channel, so a second component watching the same
   24	  // channel gets it at once instead of waiting for (or re-requesting) a snapshot.
   25	  private presenceChannels = new Map<string, Set<Handler>>();
   26	  private rosters = new Map<string, Set<string>>();
   27	  private rosterCounts = new Map<string, number>();
   28	  private status: RealtimeStatus = "disconnected";
   29	  private statusListeners = new Set<(s: RealtimeStatus) => void>();
   30	  private reconnectListeners = new Set<() => void>();
   31	  private delay = 500;
   32	  private readonly maxDelay = 15000;
   33	  // Idle-based keepalive: only ping when nothing has been sent or received for
   34	  // idlePingAfterMs (just under API Gateway's 10-min idle close). A connection
   35	  // with real traffic never pings — its own traffic already resets the idle
   36	  // timer — so busy connections don't send (or get billed for) redundant pings.
   37	  private readonly idlePingAfterMs = 8 * 60 * 1000;
   38	  private readonly idleCheckMs = 60 * 1000;
   39	  private lastActivity = Date.now();
   40	  private closedByUser = false;
   41	  private hasConnectedOnce = false;
   42	  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
   43	  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
   44	  private async fetchToken(): Promise<{ token: string; wssEndpoint: string }> {
   45	    const res = await postRealtimeToken();
   46	    if ("error" in res) throw new Error(res.error);
   47	    return { token: res.token, wssEndpoint: res.wssEndpoint };
   48	  }
   49	
   50	  async connect(): Promise<void> {
   51	    this.closedByUser = false;
   52	    if (typeof document !== "undefined") {
   53	      document.addEventListener("visibilitychange", this.onVisibility);
   54	    }
   55	    await this.open();
   56	  }
   57	
   58	  private setStatus(s: RealtimeStatus) {
   59	    if (this.status === s) return;
   60	    this.status = s;
   61	    this.statusListeners.forEach((cb) => {
   62	      try { cb(s); } catch {}
   63	    });
   64	  }
   65	
   66	  private async open(): Promise<void> {
   67	    if (this.closedByUser) return;
   68	    // Tear down any previous socket BEFORE opening a new one. open() can be
   69	    // called out-of-band (onVisibility) while an old socket is still CLOSING;
   70	    // detach its handlers so its stale onclose/onerror (which mutate shared
   71	    // state) can't fire against the new socket — killing its heartbeat or
   72	    // spawning a duplicate connection.
   73	    if (this.ws) {
   74	      try {
   75	        this.ws.onopen = null;
   76	        this.ws.onmessage = null;
   77	        this.ws.onerror = null;
   78	        this.ws.onclose = null;
   79	        this.ws.close();
   80	      } catch {}
   81	      this.ws = null;
   82	    }
   83	    this.setStatus("connecting");
   84	    let creds: { token: string; wssEndpoint: string };
   85	    try {
   86	      creds = await this.fetchToken();
   87	    } catch {
   88	      // No live socket and the token fetch failed — reflect "disconnected" (not
   89	      // "connecting") so onVisibility's connecting-guard doesn't mistake this for
   90	      // a connect in flight and skip an immediate reconnect on foreground.
   91	      this.setStatus("disconnected");
   92	      this.scheduleReconnect();
   93	      return;
   94	    }
   95	    // Connect directly to the realtime API endpoint (the token endpoint returns
   96	    // it). The token rides the query string, so this works cross-origin — no
   97	    // same-origin proxy needed.
   98	    const sep = creds.wssEndpoint.indexOf("?") === -1 ? "?" : "&";
   99	    const ws = new WebSocket(creds.wssEndpoint + sep + "token=" + encodeURIComponent(creds.token));
  100	    this.ws = ws;
  101	    ws.onopen = () => {
  102	      this.delay = 500;
  103	      this.lastActivity = Date.now();
  104	      this.setStatus("connected");
  105	      // Re-subscribe every active channel (data + presence) on (re)connect. A
  106	      // presence re-subscribe also makes the server re-send a fresh roster
  107	      // snapshot, so useRealtimePresence resyncs automatically after a drop.
  108	      for (const channel of this.activeChannels()) {
  109	        this.sendRaw({ action: "subscribe", channel });
  110	      }
  111	      this.startHeartbeat();
  112	      // Fire onReconnect only on a RE-connect, not the first connect — so a
  113	      // useRealtimeReconnect(refetch) handler doesn't double-fetch on mount.
  114	      if (this.hasConnectedOnce) {
  115	        this.reconnectListeners.forEach((cb) => {
  116	          try { cb(); } catch {}
  117	        });
  118	      }
  119	      this.hasConnectedOnce = true;
  120	    };
  121	    ws.onmessage = (ev) => {
  122	      this.lastActivity = Date.now();
  123	      let parsed: any;
  124	      try {
  125	        parsed = JSON.parse(typeof ev.data === "string" ? ev.data : "");
  126	      } catch {
  127	        return;
  128	      }
  129	      if (!parsed || typeof parsed !== "object") return;
  130	      // Presence rides a top-level "presence" field (snapshot/join/leave/digest);
  131	      // app messages ride "data". Route them separately so an app payload can
  132	      // never be mistaken for a presence event (or vice-versa).
  133	      if (parsed.presence) {
  134	        this.applyPresence(parsed.channel, parsed.presence);
  135	        return;
  136	      }
  137	      const handlers = this.channels.get(parsed.channel);
  138	      if (handlers) {
  139	        handlers.forEach((h) => {
  140	          try { h(parsed.data); } catch {}
  141	        });
  142	      }
  143	    };
  144	    ws.onclose = () => {
  145	      this.stopHeartbeat();
  146	      if (!this.closedByUser) {
  147	        this.setStatus("disconnected");
  148	        this.scheduleReconnect();
  149	      }
  150	    };
  151	    ws.onerror = () => {
  152	      try { ws.close(); } catch {}
  153	    };
  154	  }
  155	
  156	  private scheduleReconnect() {
  157	    if (this.closedByUser) return;
  158	    const jitter = Math.floor(this.delay * 0.3 * Math.random());
  159	    const wait = Math.min(this.maxDelay, this.delay) + jitter;
  160	    this.delay = Math.min(this.maxDelay, this.delay * 2);
  161	    this.reconnectTimer = setTimeout(() => {
  162	      this.reconnectTimer = null;
  163	      this.open();
  164	    }, wait);
  165	  }
  166	
  167	  // Background tabs throttle our keepalive + reconnect timers, so a hidden tab
  168	  // can idle-close and then sit disconnected. When it's foregrounded again,
  169	  // reconnect NOW instead of waiting for a throttled backoff timer.
  170	  private onVisibility = () => {
  171	    if (this.closedByUser) return;
  172	    if (typeof document !== "undefined" && document.visibilityState !== "visible") return;
  173	    if (this.status === "connecting") return; // a connect is already in flight
  174	    if (this.ws && this.ws.readyState === WebSocket.OPEN) return; // already healthy
  175	    if (this.reconnectTimer) {
  176	      clearTimeout(this.reconnectTimer);
  177	      this.reconnectTimer = null;
  178	    }
  179	    this.delay = 500;
  180	    this.open();
  181	  };
  182	
  183	  private startHeartbeat() {
  184	    this.stopHeartbeat();
  185	    this.heartbeatTimer = setInterval(() => {
  186	      // Only ping if the connection has been idle long enough to risk API
  187	      // Gateway's 10-min timeout; active traffic keeps it alive for free.
  188	      if (Date.now() - this.lastActivity >= this.idlePingAfterMs) {
  189	        this.sendRaw({ action: "ping" });
  190	      }
  191	    }, this.idleCheckMs);
  192	  }
  193	  private stopHeartbeat() {
  194	    if (this.heartbeatTimer) {
  195	      clearInterval(this.heartbeatTimer);
  196	      this.heartbeatTimer = null;
  197	    }
  198	  }
  199	
  200	  private sendRaw(obj: unknown) {
  201	    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
  202	      try { this.ws.send(JSON.stringify(obj)); this.lastActivity = Date.now(); } catch {}
  203	    }
  204	  }
  205	
  206	  // A channel is "active" (subscribed on the socket) if it has EITHER data or
  207	  // presence handlers — so the subscribe/unsubscribe frame is sent once for both.
  208	  private isChannelActive(channel: string): boolean {
  209	    return this.channels.has(channel) || this.presenceChannels.has(channel);
  210	  }
  211	  private activeChannels(): Set<string> {
  212	    const active = new Set<string>();
  213	    for (const c of this.channels.keys()) active.add(c);
  214	    for (const c of this.presenceChannels.keys()) active.add(c);
  215	    return active;
  216	  }
  217	
  218	  // Shared subscribe/unsubscribe-frame refcounting for the data and presence
  219	  // handler maps. A channel stays subscribed on the socket while EITHER map has a
  220	  // handler for it (isChannelActive), so the subscribe/unsubscribe frame is sent
  221	  // exactly once across both — and the logic lives in ONE place.
  222	  private subscribeOn(
  223	    map: Map<string, Set<Handler>>,
  224	    channel: string,
  225	    handler: Handler,
  226	  ): () => void {
  227	    const wasActive = this.isChannelActive(channel);
  228	    let set = map.get(channel);
  229	    if (!set) {
  230	      set = new Set();
  231	      map.set(channel, set);
  232	    }
  233	    set.add(handler);
  234	    if (!wasActive) this.sendRaw({ action: "subscribe", channel });
  235	    return () => {
  236	      const s = map.get(channel);
  237	      if (s) {
  238	        s.delete(handler);
  239	        if (s.size === 0) map.delete(channel);
  240	      }
  241	      if (!this.isChannelActive(channel)) this.sendRaw({ action: "unsubscribe", channel });
  242	    };
  243	  }
  244	
  245	  /** Subscribe to a channel's data messages. Returns an unsubscribe function. */
  246	  subscribe(channel: string, handler: Handler): () => void {
  247	    return this.subscribeOn(this.channels, channel, handler);
  248	  }
  249	
  250	  /**
  251	   * Watch a presence channel's roster. The handler gets the whole roster each
  252	   * time it changes, and right away if it is already known. Returns an
  253	   * unsubscribe function. Used by useRealtimePresence; shares the underlying
  254	   * channel subscription with any data subscribers on the same channel.
  255	   */
  256	  subscribePresence(
  257	    channel: string,
  258	    handler: (roster: PresenceRoster) => void,
  259	  ): () => void {
  260	    const unsub = this.subscribeOn(this.presenceChannels, channel, handler);
  261	    const current = this.getPresence(channel);
  262	    if (current) {
  263	      try { handler(current); } catch {}
  264	    }
  265	    return () => {
  266	      unsub();
  267	      if (!this.presenceChannels.has(channel)) {
  268	        this.rosters.delete(channel);
  269	        this.rosterCounts.delete(channel);
  270	      }
  271	    };
  272	  }
  273	
  274	  /** The last known roster of a presence channel, or null before its snapshot. */
  275	  getPresence(channel: string): PresenceRoster | null {
  276	    const members = this.rosters.get(channel);
  277	    if (!members) return null;
  278	    return {
  279	      members: Array.from(members),
  280	      count: this.rosterCounts.get(channel) ?? members.size,
  281	    };
  282	  }
  283	
  284	  // Server presence events: "snapshot" (the full roster, on every (re)subscribe),
  285	  // "join" / "leave" (live channels, one per change) and "digest" (batched
  286	  // channels: net joined/left + a fresh count, about every 30s when something
  287	  // changed; resync means "too many changes, fetch a snapshot").
  288	  private applyPresence(channel: string, p: any) {
  289	    if (!p || typeof p !== "object") return;
  290	    const isId = (x: unknown): x is string => typeof x === "string";
  291	    let roster = this.rosters.get(channel);
  292	    if (p.type === "snapshot" && Array.isArray(p.members)) {
  293	      roster = new Set(p.members.filter(isId));
  294	    } else if (!roster) {
  295	      return; // a change before the snapshot — the snapshot already includes it
  296	    } else if (p.type === "join" && isId(p.userId)) {
  297	      roster.add(p.userId);
  298	    } else if (p.type === "leave" && isId(p.userId)) {
  299	      roster.delete(p.userId);
  300	    } else if (p.type === "digest") {
  301	      if (p.resync) {
  302	        this.sendRaw({ action: "subscribe", channel }); // server re-sends a snapshot
  303	      } else {
  304	        for (const id of Array.isArray(p.joined) ? p.joined.filter(isId) : []) roster.add(id);
  305	        for (const id of Array.isArray(p.left) ? p.left.filter(isId) : []) roster.delete(id);
  306	      }
  307	    } else {
  308	      return;
  309	    }
  310	    this.rosters.set(channel, roster);
  311	    if (typeof p.count === "number") this.rosterCounts.set(channel, p.count);
  312	    else this.rosterCounts.delete(channel);
  313	    const current = this.getPresence(channel);
  314	    const handlers = this.presenceChannels.get(channel);
  315	    if (current && handlers) {
  316	      handlers.forEach((h) => {
  317	        try { h(current); } catch {}
  318	      });
  319	    }
  320	  }
  321	
  322	  /**
  323	   * Send a message up to the backend. In v1 this rides plain HTTP (your
  324	   * `_realtime/send` endpoint authorizes the end-user and publishes
  325	   * server-side); the WebSocket itself is receive-only from the browser.
  326	   */
  327	  async send(channel: string, data: unknown): Promise<void> {
  328	    await postRealtimeSend({ channel, data });
  329	  }
  330	
  331	  /**
  332	   * Look up last-seen timestamps (unix seconds) for a BOUNDED set of userIds on a
  333	   * presence channel — the offline people you're rendering. Returns
  334	   * { userId: ts }; an absent userId means online now, or last seen a long time
  335	   * ago. Cache the result (e.g. a React Query with a long staleTime) — last-seen
  336	   * changes slowly, so don't refetch it on every render.
  337	   */
  338	  async lastSeen(channel: string, userIds: string[]): Promise<Record<string, number>> {
  339	    const res = await postRealtimeLastseen({ channel, userIds });
  340	    return "lastSeen" in res ? res.lastSeen : {};
  341	  }
  342	
  343	  onStatus(cb: (s: RealtimeStatus) => void): () => void {
  344	    this.statusListeners.add(cb);
  345	    return () => this.statusListeners.delete(cb);
  346	  }
  347	  /** Fires after every (re)connect — refetch state that may have changed. */
  348	  onReconnect(cb: () => void): () => void {
  349	    this.reconnectListeners.add(cb);
  350	    return () => this.reconnectListeners.delete(cb);
  351	  }
  352	  getStatus(): RealtimeStatus {
  353	    return this.status;
  354	  }
  355	  close() {
  356	    this.closedByUser = true;
  357	    if (this.reconnectTimer) {
  358	      clearTimeout(this.reconnectTimer);
  359	      this.reconnectTimer = null;
  360	    }
  361	    if (typeof document !== "undefined") {
  362	      document.removeEventListener("visibilitychange", this.onVisibility);
  363	    }
  364	    this.stopHeartbeat();
  365	    if (this.ws) {
  366	      try { this.ws.close(); } catch {}
  367	    }
  368	  }
  369	}
  370