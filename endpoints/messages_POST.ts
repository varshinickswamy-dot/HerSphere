import superjson from "superjson";
import { schema } from "./messages_POST.schema";
import { db } from "../helpers/db";
import { getServerUserSession } from "../helpers/getServerUserSession";
import { publish } from "@floot/realtime";
import { channels } from "../helpers/realtimeChannels";

export async function handle(request: Request) {
  try {