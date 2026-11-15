import superjson from "superjson";
import { ZodError } from "zod";
import { schema } from "./notifications_POST.schema";
import { db } from "../helpers/db";
import { getServerUserSession } from "../helpers/getServerUserSession";
import { NotAuthenticatedError } from "../helpers/getSetServerSession";
const json = (body: unknown, status = 200) => new Response(superjson.stringify(body), { status, headers: { "Content-Type": "application/json" } });
export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);
    const body = schema.parse(superjson.parse(await request.text()));
    if (body.action === "readAll") await db.updateTable("notifications").set({ isRead: true }).where("userId", "=", String(user.id)).execute();
    else {
      if (!body.id) return json({ error: "Notification ID is required." }, 400);
      await db.updateTable("notifications").set({ isRead: true }).where("id", "=", String(body.id)).where("userId", "=", String(user.id)).execute();
    }
    return json({ success: true });
  } catch (error) {
    if (error instanceof NotAuthenticatedError) return json({ error: "Not authenticated" }, 401);
    if (error instanceof ZodError || error instanceof SyntaxError || error instanceof TypeError) return json({ error: "Please check the notification action." }, 400);
    return json({ error: "Could not update notifications. Please try again later." }, 500);
  }
}