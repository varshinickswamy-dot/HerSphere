// Reconnecting Floot Realtime client (browser). Connects to the wss endpoint
// returned by the _realtime/token response (cross-origin is fine — the token
// rides the query string), refreshes its token, auto-reconnects with
// exponential backoff + jitter, heartbeats under API Gateway's 10-min idle
// timeout, and re-subscribes on reconnect. Messages are at-most-once — use
// onReconnect() to refetch any state that may have changed while disconnected.

import { postRealtimeToken } from "../endpoints/_realtime/token_POST.schema";
import { postRealtimeSend } from "../endpoints/_realtime/send_POST.schema";