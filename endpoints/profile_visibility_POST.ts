import superjson from "superjson";
import { z } from "zod";
import { db } from "../helpers/db";
import { getServerUserSession } from "../helpers/getServerUserSession";
import { NotAuthenticatedError } from "../helpers/getSetServerSession";
const schema = z.object({ isPublic: z.boolean() });
export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);
    if (user.role !== "student" && user.role !== "user") return new Response(superjson.stringify({ error: "Student account required." }), { status: 403, headers: { "Content-Type": "application/json" } });
    const input = schema.parse(superjson.parse(await request.text()));
    await db.insertInto("studentProfileVisibility").values({ userId: String(user.id), isPublic: input.isPublic })
      .onConflict(oc => oc.column("userId").doUpdateSet({ isPublic: input.isPublic, updatedAt: new Date() })).execute();
    return new Response(superjson.stringify({ success: true, isPublic: input.isPublic }), { headers: { "Content-Type": "application/json" } });
  } catch (error) {
    const unauthorized = error instanceof NotAuthenticatedError;
    const invalid = error instanceof z.ZodError;
    return new Response(superjson.stringify({ error: unauthorized ? "Not authenticated" : invalid ? "Invalid privacy setting" : "Could not save privacy setting" }), { status: unauthorized ? 401 : invalid ? 400 : 500, headers: { "Content-Type": "application/json" } });
  }
}