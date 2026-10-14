import { publish } from "@floot/realtime";
import { schema } from "./send_POST.schema";
import superjson from "superjson";
import { getServerUserSession } from "../../helpers/getServerUserSession";

// The browser POSTs here and you publish server-side after authorizing the user.
//
// Security: this can publish to any of your app's channels, so authenticate the
// user and check they may publish to the channel before enabling. Ships disabled —