import superjson from "superjson";
import { db } from "../helpers/db";
import { getServerUserSession } from "../helpers/getServerUserSession";
import { NotAuthenticatedError } from "../helpers/getSetServerSession";
export async function handle(request: Request) {
 try {
  await getServerUserSession(request);
  const internships = await db.selectFrom("internships").selectAll().orderBy("createdAt","desc").limit(100).execute();
  return new Response(superjson.stringify({ internships }), { headers: { "Content-Type":"application/json" } });
   10	 } catch (error) {
   11	  const unauthenticated = error instanceof NotAuthenticatedError;
   12	  return new Response(superjson.stringify({ error: unauthenticated ? "Not authenticated" : "Unable to load internships" }), { status: unauthenticated ? 401 : 500, headers: { "Content-Type":"application/json" } });
   13	 }
   14	}