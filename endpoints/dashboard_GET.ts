import superjson from "superjson";
import { db } from "../helpers/db";
import { getServerUserSession } from "../helpers/getServerUserSession";

export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);
    const uid = String(user.id);
    const profile = await db.selectFrom("studentProfiles").selectAll().where("userId","=",uid).executeTakeFirst();