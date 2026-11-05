import superjson from "superjson";
import { db } from "../helpers/db";
import { getServerUserSession } from "../helpers/getServerUserSession";
import { NotAuthenticatedError } from "../helpers/getSetServerSession";

export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);
    const resume = await db.selectFrom("resumes").selectAll()
      .where("userId", "=", String(user.id)).executeTakeFirst();
    return new Response(superjson.stringify({ resume: resume ?? null }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const unauthenticated = error instanceof NotAuthenticatedError;
    return new Response(superjson.stringify({ error: unauthenticated ? "Not authenticated" : "Could not load resume" }), {
      status: unauthenticated ? 401 : 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
