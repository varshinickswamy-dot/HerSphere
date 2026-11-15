import superjson from "superjson";
import { db } from "../helpers/db";
import { getServerUserSession } from "../helpers/getServerUserSession";
import { NotAuthenticatedError } from "../helpers/getSetServerSession";

export async function handle(request: Request) {
  try {
    await getServerUserSession(request);
    const mentors = await db
      .selectFrom("mentors")
      .selectAll()
      .where("available", "=", true)
      .orderBy("createdAt", "desc")
      .limit(100)
      .execute();
    return new Response(superjson.stringify({ mentors }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const unauthorized = error instanceof NotAuthenticatedError;
    return new Response(
      superjson.stringify({
        error: unauthorized ? "Not authenticated" : "Unable to load mentor profiles",
      }),
      {
        status: unauthorized ? 401 : 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
