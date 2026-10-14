import { createToken } from "@floot/realtime";
import superjson from "superjson";
import { getServerUserSession } from "../../helpers/getServerUserSession";
import { channels } from "../../helpers/realtimeChannels";

const json = (data: unknown, status = 200) =>
  new Response(superjson.stringify(data), { status, headers: { "Content-Type": "application/json" } });

export async function handle(request: Request) {