import { lastSeen } from "@floot/realtime";
import { schema } from "./lastseen_POST.schema";
import superjson from "superjson";
import { getServerUserSession } from "../../helpers/getServerUserSession";

// The browser POSTs { channel, userIds } and gets back { lastSeen: { userId: ts } }
// for the offline users it's rendering. Fetch on demand for a bounded set and cache
// it (last-seen changes slowly). An absent userId means online now, or last seen
// beyond the retention window.