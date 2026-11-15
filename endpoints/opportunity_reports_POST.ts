import superjson from "superjson";
import { ZodError } from "zod";
import { schema } from "./opportunity_reports_POST.schema";
import { db } from "../helpers/db";
import { getServerUserSession } from "../helpers/getServerUserSession";
import { NotAuthenticatedError } from "../helpers/getSetServerSession";
const json = (body: unknown, status = 200) => new Response(superjson.stringify(body), { status, headers: { "Content-Type": "application/json" } });
export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);
    const body = schema.parse(superjson.parse(await request.text()));
    await db.insertInto("opportunityReports").values({ opportunityType: body.opportunityType, opportunityId: String(body.opportunityId), reporterUserId: String(user.id), reason: body.reason, details: body.details || null, status: "open" }).execute();
    return json({ ok: true });
  } catch (error) {
    if (error instanceof NotAuthenticatedError) return json({ error: "Not authenticated" }, 401);
    if (error instanceof ZodError || error instanceof SyntaxError || error instanceof TypeError) return json({ error: "Please check the opportunity report details." }, 400);
    return json({ error: "Could not report opportunity. Please try again later." }, 500);
  }
}