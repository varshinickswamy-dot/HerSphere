import superjson from "superjson";
import { db } from "../helpers/db";
import { getServerUserSession } from "../helpers/getServerUserSession";
import { NotAuthenticatedError } from "../helpers/getSetServerSession";

export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);
    const query = new URL(request.url).searchParams.get("q")?.trim() ?? "";

    // Do not expose a directory of user email addresses on an empty search.
    // Require a useful query and let PostgreSQL filter before returning rows.
    if (query.length < 2) {
      return new Response(superjson.stringify({ contacts: [] }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    const search = `%${query.slice(0, 80)}%`;
    const rows = await db
      .selectFrom("users")
      .select(["id", "displayName", "email", "role"])
      .where("id", "!=", Number(user.id))
      .where((eb) =>
        eb.or([
          eb("displayName", "ilike", search),
          eb("email", "ilike", search),
        ])
      )
      .orderBy("displayName")
      .limit(10)
      .execute();

    const contacts = rows.map((row) => ({ ...row, id: String(row.id) }));
    return new Response(superjson.stringify({ contacts }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const unauthorized = error instanceof NotAuthenticatedError;
    return new Response(
      superjson.stringify({
        error: unauthorized ? "Not authenticated" : "Could not load contacts",
      }),
      {
        status: unauthorized ? 401 : 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}