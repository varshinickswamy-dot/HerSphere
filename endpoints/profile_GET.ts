import { getServerUserSession } from "../helpers/getServerUserSession";
import { db } from "../helpers/db";
import superjson from "superjson";
import { NotAuthenticatedError } from "../helpers/getSetServerSession";
export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);
    const profile = await db.selectFrom("studentProfiles").selectAll().where("userId","=",String(user.id)).executeTakeFirst();
    return new Response(superjson.stringify({ profile: profile ?? null }), { headers: {"Content-Type":"application/json"} });
  } catch (error) {
    const isUnauthenticated = error instanceof NotAuthenticatedError;
    return new Response(
      superjson.stringify({ error: isUnauthenticated ? "Not authenticated" : "Profile could not be loaded" }),
      { status: isUnauthenticated ? 401 : 500, headers: {"Content-Type":"application/json"} }
    );
  }
}
