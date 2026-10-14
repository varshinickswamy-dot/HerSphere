import superjson from "superjson";
import { db } from "../helpers/db";
import { getServerUserSession } from "../helpers/getServerUserSession";
import { NotAuthenticatedError } from "../helpers/getSetServerSession";
export async function handle(request: Request) {
 try {
  await getServerUserSession(request);
  const internships = await db.selectFrom("internships").selectAll().orderBy("createdAt","desc").limit(100).execute();
  return new Response(superjson.stringify({ internships }), { headers: { "Content-Type":"application/json" } });