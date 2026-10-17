import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  RealtimeClient,
   10	  RealtimeStatus,
   11	  type PresenceRoster,
   12	} from "../helpers/RealtimeClient";
   13	import {
   14	  useQuery,
   15	  useQueryClient,
   16	  type QueryKey,
   17	  type UseQueryOptions,
   18	  type UseQueryResult,
   19	} from "@tanstack/react-query";
   20	
   21	const RealtimeContext = createContext<RealtimeClient | null>(null);
   22	
   23	export const FlootRealtimeProvider: React.FC<{ children: React.ReactNode }> = ({
   24	  children,
   25	}) => {
   26	  const clientRef = useRef<RealtimeClient | null>(null);
   27	  if (clientRef.current === null) {
   28	    clientRef.current = new RealtimeClient();
   29	  }
   30	  useEffect(() => {
   31	    const client = clientRef.current!;
   32	    client.connect();
   33	    return () => client.close();
   34	  }, []);
   35	  return (
   36	    <RealtimeContext.Provider value={clientRef.current}>
   37	      {children}
   38	    </RealtimeContext.Provider>
   39	  );
   40	};
   41	
   42	export function useRealtimeClient(): RealtimeClient {
   43	  const client = useContext(RealtimeContext);
   44	  if (!client) {
   45	    throw new Error("useRealtimeClient must be used within <FlootRealtimeProvider>");
   46	  }
   47	  return client;
   48	}
   49	
   50	/** Subscribe a component to a channel for its lifetime. */
   51	export function useRealtimeChannel(
   52	  channel: string | null,
   53	  onMessage: (data: any) => void,
   54	) {
   55	  const client = useRealtimeClient();
   56	  const handlerRef = useRef(onMessage);
   57	  handlerRef.current = onMessage;
   58	  useEffect(() => {
   59	    if (!channel) return;
   60	    const unsub = client.subscribe(channel, (data) => handlerRef.current(data));
   61	    return unsub;
   62	  }, [client, channel]);
   63	}
   64	
   65	/** Re-run a callback after every (re)connect — refetch state lost while down. */
   66	export function useRealtimeReconnect(onReconnect: () => void) {
   67	  const client = useRealtimeClient();
   68	  const cbRef = useRef(onReconnect);
   69	  cbRef.current = onReconnect;
   70	  useEffect(() => client.onReconnect(() => cbRef.current()), [client]);
   71	}
   72	
   73	export function useRealtimeConnectionStatus(): RealtimeStatus {
   74	  const client = useRealtimeClient();
   75	  const [status, setStatus] = useState<RealtimeStatus>(client.getStatus());
   76	  useEffect(() => client.onStatus(setStatus), [client]);
   77	  return status;
   78	}
   79	
   80	const NO_MEMBERS: string[] = [];
   81	
   82	function usePresenceRoster(channel: string | null): PresenceRoster | null {
   83	  const client = useRealtimeClient();
   84	  const [roster, setRoster] = useState<PresenceRoster | null>(null);
   85	  useEffect(() => {
   86	    setRoster(null); // reset when the channel changes
   87	    if (!channel) return;
   88	    return client.subscribePresence(channel, setRoster);
   89	  }, [client, channel]);
   90	  return roster;
   91	}
   92	
   93	/**
   94	 * Presence roster for a channel — the userIds currently online. Pass a
   95	 * channels.presence(id) channel (the "__presence:" prefix is what enables presence
   96	 * on the server), an observer channel channels.presenceOf(id), or its batched
   97	 * form channels.presenceBatchOf(id); grant it in _realtime/token like any other
   98	 * channel. The server sends a full snapshot on (re)subscribe, then either every
   99	 * join/leave as it happens (presence / presenceOf) or one net update about every
  100	 * 30 seconds (presenceBatchOf). No polling; resyncs automatically on reconnect.
  101	 * Each member's userId is whatever your token endpoint set as the connection's
  102	 * userId — map it to a name/avatar from your own data.
  103	 *
  104	 *   const online = useRealtimePresence(channels.presence(roomId));
  105	 *   // -> ["u_alice", "u_bob"]
  106	 */
  107	export function useRealtimePresence(channel: string | null): string[] {
  108	  return usePresenceRoster(channel)?.members ?? NO_MEMBERS;
  109	}
  110	
  111	/**
  112	 * How many are online on a presence channel. On channels.presenceBatchOf(id) this
  113	 * is the server's count, refreshed with each update; elsewhere it is the roster's
  114	 * size. 0 until the first snapshot arrives.
  115	 *
  116	 *   const visitors = useRealtimePresenceCount(channels.presenceBatchOf("visitors"));
  117	 */
  118	export function useRealtimePresenceCount(channel: string | null): number {
  119	  return usePresenceRoster(channel)?.count ?? 0;
  120	}
  121	
  122	/**
  123	 * Announce this client as present in a channel WITHOUT receiving any presence
  124	 * traffic — the subject side of asymmetric presence. Subscribe to
  125	 * channels.presenceIn(id); observers watching channels.presenceOf(id) see this
  126	 * client join and leave, but this client receives nothing (no roster, no deltas).
  127	 * Costs one membership row; presence is released on unmount or socket drop. Grant
  128	 * the presenceIn(id) channel in _realtime/token. Use this for "let staff see who's
  129	 * online" without every user paying the roster firehose.
  130	 */
  131	export function useRealtimePresenceAnnounce(channel: string | null): void {
  132	  const client = useRealtimeClient();
  133	  useEffect(() => {
  134	    if (!channel) return;
  135	    // __presence_in: channels never deliver to the subject, so this no-op handler
  136	    // only registers membership; the returned unsub releases presence.
  137	    const unsub = client.subscribe(channel, () => {});
  138	    return unsub;
  139	  }, [client, channel]);
  140	}
  141	
  142	// ── React Query integration ──────────────────────────────────────────────────
  143	// Bridge realtime messages into the React Query cache. Pair with
  144	// useQuery({ queryKey, queryFn, staleTime: Infinity }) so RQ's stale timer doesn't
  145	// ALSO refetch. Pattern for streams/chat: PATCH each message in as it arrives
  146	// (useRealtimeCache, no network), then a SINGLE reconcile fetch when the response
  147	// completes (stream done / reply finished / convo switch) — that's good +
  148	// encouraged. Just don't refetch per message.
  149	
  150	// Debounced signal -> refetch. The right tool for a bare "something changed"
  151	// message that carries no data (or when you need server-recomputed fields). For
  152	// data-carrying streams, patch with useRealtimeCache + one reconcile fetch at the
  153	// end instead — don't refetch per message.
  154	export function useRealtimeInvalidation(
  155	  channel: string | null,
  156	  queryKey: QueryKey,
  157	  debounceMs: number = 250,
  158	) {
  159	  const qc = useQueryClient();
  160	  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  161	  useRealtimeChannel(channel, () => {
  162	    if (timer.current) clearTimeout(timer.current);
  163	    timer.current = setTimeout(() => {
  164	      qc.invalidateQueries({ queryKey });
  165	    }, debounceMs);
  166	  });
  167	}
  168	
  169	// PATCH the cache with the message's data — no network. apply() merges the message
  170	// in (append a chat/stream token, merge a row, bump a count). Instant; keep apply
  171	// idempotent so a re-delivered message doesn't double-apply. For streams/chat:
  172	// patch each token, then ONE reconcile fetch (invalidateQueries) when the response
  173	// finishes — that end fetch is encouraged.
  174	export function useRealtimeCache<TData = unknown, TMsg = any>(
  175	  channel: string | null,
  176	  queryKey: QueryKey,
  177	  apply: (prev: TData | undefined, msg: TMsg) => TData,
  178	) {
  179	  const qc = useQueryClient();
  180	  const applyRef = useRef(apply);
  181	  applyRef.current = apply;
  182	  useRealtimeChannel(channel, (msg: TMsg) => {
  183	    qc.setQueryData<TData>(queryKey, (prev) => applyRef.current(prev, msg));
  184	  });
  185	}
  186	
  187	// RECONNECT -> resync. Realtime is at-most-once, so messages sent while the socket
  188	// was down are lost; invalidate queryKeys on (re)connect to catch up. Pair with
  189	// useRealtimeInvalidation / useRealtimeCache.
  190	//
  191	// Two guards make this safe at scale (don't remove them):
  192	//  - DEBOUNCE: at most one resync per minIntervalMs, so a flaky network or rapid
  193	//    tab-flicks (each a reconnect) collapse into ONE refetch instead of hammering
  194	//    the backend — this is also what keeps it under the dev "backend called too
  195	//    frequently" guard (which trips at ~20 calls to one endpoint in 5s).
  196	//  - JITTER: the refetch is delayed a random 0..jitterMs, so a fleet-wide reconnect
  197	//    (a deploy / CDN blip drops everyone at once) doesn't stampede your backend
  198	//    synchronously — each client refetches at a slightly different moment.
  199	export function useRealtimeResync(
  200	  queryKeys: QueryKey[],
  201	  opts: { minIntervalMs?: number; jitterMs?: number } = {},
  202	) {
  203	  const { minIntervalMs = 10_000, jitterMs = 3_000 } = opts;
  204	  const qc = useQueryClient();
  205	  const keysRef = useRef(queryKeys);
  206	  keysRef.current = queryKeys;
  207	  const lastAtRef = useRef(0);
  208	  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  209	  useRealtimeReconnect(() => {
  210	    const now = Date.now();
  211	    if (now - lastAtRef.current < minIntervalMs) return; // coalesce rapid reconnects
  212	    lastAtRef.current = now;
  213	    if (timerRef.current) clearTimeout(timerRef.current);
  214	    timerRef.current = setTimeout(() => {
  215	      timerRef.current = null;
  216	      for (const key of keysRef.current) qc.invalidateQueries({ queryKey: key });
  217	    }, Math.floor(Math.random() * jitterMs));
  218	  });
  219	  useEffect(
  220	    () => () => {
  221	      if (timerRef.current) clearTimeout(timerRef.current);
  222	    },
  223	    [],
  224	  );
  225	}
  226	
  227	// One call for a query kept live by a realtime channel — it bundles the useQuery and
  228	// the subscription, so you can't forget to subscribe.
  229	//
  230	// - apply:       patch the cache from each message (preferred — no network). prev is
  231	//                the loaded query data, never undefined; a message that beats the
  232	//                first fetch refetches instead, so nothing is lost.
  233	// - reconcileOn: when a message matches, refetch the authoritative state once
  234	//                (debounced). Combine them for an AI agent chat — stream token
  235	//                deltas through apply, then send { type: "done" } and reconcileOn
  236	//                the canonical copy (final formatting, persisted message/tool ids).
  237	// Omit both and every message triggers a debounced refetch.
  238	export function useRealtimeQuery<TData = unknown, TMsg = any>(
  239	  opts: {
  240	    queryKey: QueryKey;
  241	    queryFn: () => Promise<TData>;
  242	    channel: string | null;
  243	    apply?: (prev: TData, msg: TMsg) => TData;
  244	    reconcileOn?: (msg: TMsg) => boolean;
  245	  } & Omit<UseQueryOptions<TData, Error, TData>, "queryKey" | "queryFn">,
  246	): UseQueryResult<TData, Error> {
  247	  const { queryKey, queryFn, channel, apply, reconcileOn, ...rest } = opts;
  248	  const qc = useQueryClient();
  249	  const query = useQuery<TData, Error, TData>({
  250	    queryKey,
  251	    queryFn,
  252	    staleTime: Infinity, // realtime is the freshness mechanism, not RQ's stale timer
  253	    // Catch up on remount: while unmounted, this query's subscription is torn down,
  254	    // so messages sent in that window are missed. staleTime:Infinity won't refetch
  255	    // on remount, and useRealtimeResync only fires on socket reconnect (not a
  256	    // navigate-away-and-back where the socket stayed up) — so force a refetch.
  257	    refetchOnMount: "always",
  258	    ...rest,
  259	  });
  260	
  261	  const applyRef = useRef(apply);
  262	  applyRef.current = apply;
  263	  const reconcileRef = useRef(reconcileOn);
  264	  reconcileRef.current = reconcileOn;
  265	  const keyRef = useRef(queryKey);
  266	  keyRef.current = queryKey;
  267	  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  268	
  269	  const scheduleRefetch = () => {
  270	    if (debounceRef.current) clearTimeout(debounceRef.current);
  271	    debounceRef.current = setTimeout(
  272	      () => qc.invalidateQueries({ queryKey: keyRef.current }),
  273	      250,
  274	    );
  275	  };
  276	
  277	  useRealtimeChannel(channel, (msg: TMsg) => {
  278	    if (applyRef.current) {
  279	      const prev = qc.getQueryData<TData>(keyRef.current);
  280	      if (prev === undefined) {
  281	        // Message beat the initial fetch — no base state to patch. Refetch so the
  282	        // change isn't lost to the load race (rather than dropping it).
  283	        scheduleRefetch();
  284	      } else {
  285	        qc.setQueryData<TData>(keyRef.current, applyRef.current(prev, msg));
  286	      }
  287	    }
  288	    // Reconcile when reconcileOn matches; with no reconcileOn, keep the default
  289	    // (refetch per message only when there's no apply to patch with).
  290	    const wantRefetch = reconcileRef.current
  291	      ? reconcileRef.current(msg)
  292	      : !applyRef.current;
  293	    if (wantRefetch) scheduleRefetch();
  294	  });
  295	  useEffect(
  296	    () => () => {
  297	      if (debounceRef.current) clearTimeout(debounceRef.current);
  298	    },
  299	    [],
  300	  );
  301	  // Catch up on messages missed while the socket was down.
  302	  useRealtimeResync([queryKey]);
  303	  return query;
  304	}
  305