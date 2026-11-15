// SINGLE SOURCE OF TRUTH for realtime channel names. Import this on BOTH the
// publish side (backend) and the subscribe side (frontend/backend) so names can
// never drift
//
// Convention: "<topic>:<id>" (and ":<sub>" for sub-topics). Using this shape
// lets your _realtime/token grants use a segment wildcard like "room:*" to cover
// every room. Keep each channel aligned with its React Query key, e.g.
//   channels.room(id)   <->   queryKey ["room", id]
export const channels = {
   10	  room: (id: string | number) => "room:" + id,
   11	  user: (userId: string) => "user:" + userId,
   12	  marketplace: () => "marketplace",
   13	  // Presence channel — subscribers get a live roster (who's online). The reserved
   14	  // "__presence:" prefix is what opts the channel into presence tracking on the
   15	  // server; read it with useRealtimePresence(channels.presence(roomId)). Grant it
   16	  // in _realtime/token like any channel (e.g. "__presence:*" or "__presence:" + room).
   17	  // NOTE: a "__presence:" channel broadcasts its member roster (every subscriber's
   18	  // userId) to all its subscribers — only name a channel this way when you want
   19	  // that. Plain channels never expose who's connected.
   20	  presence: (id: string | number) => "__presence:" + id,
   21	  // Asymmetric presence — a large set of subjects watched by a few observers, where
   22	  // subjects receive NO presence traffic (unlike the symmetric __presence: above,
   23	  // where every subscriber gets the firehose). Paired by id:
   24	  //   presenceIn(id) — a subject announces "I'm present in <id>" (announce-only;
   25	  //                    receives nothing). Mount with useRealtimePresenceAnnounce.
   26	  //   presenceOf(id) — an observer watches who's present in <id> (snapshot + live
   27	  //                    join/leave; invisible to the roster). Read with
   28	  //                    useRealtimePresence(channels.presenceOf(id)).
   29	  // Grant presenceIn(...) to subjects and presenceOf(...) ONLY to observers in
   30	  // _realtime/token — never grant presenceOf to a subject (it would let them read the
   31	  // roster). Good fit: a support agent watching every customer online in a queue.
   32	  presenceIn: (id: string | number) => "__presence_in:" + id,
   33	  presenceOf: (id: string | number) => "__presence_of:" + id,
   34	  // Batched observer — the same roster as presenceOf(id), but after the snapshot
   35	  // the server sends at most one update about every 30 seconds (net joins/leaves +
   36	  // a fresh count), only when something changed. Use it when "good enough" is
   37	  // fine: an "N online" badge, online dots in a list. A presenceOf(id) grant in
   38	  // _realtime/token also covers presenceBatchOf(id). Read with
   39	  // useRealtimePresence / useRealtimePresenceCount(channels.presenceBatchOf(id)).
   40	  presenceBatchOf: (id: string | number) => "__presence_batch_of:" + id,
   41	  // Control channel for cancelling/steering a queueTask run (signal-only, no query):
   42	  taskControl: (jobId: string) => "task:" + jobId + ":control",
   43	  // Server -> client token/data stream for a queueTask run:
   44	  stream: (jobId: string) => "stream:" + jobId,
   45	};
   46