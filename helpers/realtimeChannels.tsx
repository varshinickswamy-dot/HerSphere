// SINGLE SOURCE OF TRUTH for realtime channel names. Import this on BOTH the
// publish side (backend) and the subscribe side (frontend/backend) so names can
// never drift
//
// Convention: "<topic>:<id>" (and ":<sub>" for sub-topics). Using this shape
// lets your _realtime/token grants use a segment wildcard like "room:*" to cover
// every room. Keep each channel aligned with its React Query key, e.g.
//   channels.room(id)   <->   queryKey ["room", id]
export const channels = {