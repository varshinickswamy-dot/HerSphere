import superjson from "superjson";
import { db } from "../helpers/db";
import { getServerUserSession } from "../helpers/getServerUserSession";
import { NotAuthenticatedError } from "../helpers/getSetServerSession";

export async function handle(request: Request) {
  try {
    await getServerUserSession(request);
    const scholarships = await db
      .selectFrom("scholarships")
      .selectAll()
      .orderBy("deadline", "asc")
      .limit(100)
      .execute();
    return new Response(superjson.stringify({ scholarships }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const unauthorized = error instanceof NotAuthenticatedError;
    return new Response(
      superjson.stringify({
        error: unauthorized ? "Not authenticated" : "Unable to load scholarships",
      }),
      {
        status: unauthorized ? 401 : 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
