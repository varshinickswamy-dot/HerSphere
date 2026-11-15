import superjson from "superjson";
import { ZodError } from "zod";
import { schema } from "./community_POST.schema";
import { db } from "../helpers/db";
import { getServerUserSession } from "../helpers/getServerUserSession";
import { NotAuthenticatedError } from "../helpers/getSetServerSession";
const json = (body: unknown, status = 200) => new Response(superjson.stringify(body), { status, headers: { "Content-Type": "application/json" } });
export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);
    const body = schema.parse(superjson.parse(await request.text()));
    let result: unknown;
    if (body.action === "post") {
      if (!body.content?.trim()) return json({ error: "Post content is required." }, 400);
      result = await db.insertInto("communityPosts").values({ userId: String(user.id), content: body.content }).returningAll().executeTakeFirstOrThrow();
    } else if (body.action === "comment") {
      if (!body.postId || !body.content?.trim()) return json({ error: "A post and comment are required." }, 400);
      const post = await db.selectFrom("communityPosts").select("id").where("id", "=", String(body.postId)).executeTakeFirst();
      if (!post) return json({ error: "The post could not be found." }, 404);
      result = await db.insertInto("communityComments").values({ postId: String(body.postId), userId: String(user.id), content: body.content }).returningAll().executeTakeFirstOrThrow();
    } else {
      if (!body.mentorId) return json({ error: "Choose a mentor first." }, 400);
      const mentor = await db.selectFrom("mentors").select("id").where("id", "=", String(body.mentorId)).where("available", "=", true).executeTakeFirst();
      if (!mentor) return json({ error: "This mentor is not currently available." }, 404);
      result = await db.insertInto("mentorshipRequests").values({ mentorId: String(body.mentorId), studentUserId: String(user.id), message: body.message || null, status: "pending" }).onConflict(oc => oc.columns(["mentorId", "studentUserId"]).doUpdateSet({ message: body.message || null, status: "pending", updatedAt: new Date() })).returningAll().executeTakeFirstOrThrow();
    }
    return json({ result });
  } catch (error) {
    if (error instanceof NotAuthenticatedError) return json({ error: "Not authenticated" }, 401);
    if (error instanceof ZodError || error instanceof SyntaxError || error instanceof TypeError) return json({ error: "Please check the community action details and try again." }, 400);
    return json({ error: "Community action failed. Please try again later." }, 500);
  }
}