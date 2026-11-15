import superjson from "superjson";
import { db } from "../helpers/db";
import { getServerUserSession } from "../helpers/getServerUserSession";
import { NotAuthenticatedError } from "../helpers/getSetServerSession";

export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);
    const [roadmap, gaps] = await Promise.all([
      db.selectFrom("careerRoadmaps").selectAll()
        .where("userId", "=", String(user.id))
        .orderBy("updatedAt", "desc").executeTakeFirst(),
      db.selectFrom("skillAssessments").selectAll()
        .where("userId", "=", String(user.id))
        .orderBy("updatedAt", "desc").executeTakeFirst(),
    ]);

    return new Response(superjson.stringify({ roadmap, gaps }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const unauthorized = error instanceof NotAuthenticatedError;
    return new Response(superjson.stringify({
      error: unauthorized ? "Not authenticated" : "Unable to load roadmap",
    }), {
      status: unauthorized ? 401 : 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
