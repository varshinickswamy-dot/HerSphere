import superjson from "superjson";
import { ZodError } from "zod";
import { schema } from "./admin_moderation_POST.schema";
import { db } from "../helpers/db";
import { getServerUserSession } from "../helpers/getServerUserSession";
import { NotAuthenticatedError } from "../helpers/getSetServerSession";
const json = (body: unknown, status = 200) => new Response(superjson.stringify(body), { status, headers: { "Content-Type": "application/json" } });
export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);
    if (user.role !== "admin") return json({ error: "Admin access denied." }, 403);
    const body = schema.parse(superjson.parse(await request.text()));
    let entityId: string | null = null;
    let entityType = "opportunity_report";
    if (body.action === "verifyCompany" || body.action === "unverifyCompany") {
      entityId = body.companyId || null; entityType = "company";
      const result = await db.updateTable("companyProfiles").set({ isVerified: body.action === "verifyCompany", updatedAt: new Date() }).where("id", "=", String(body.companyId)).returning("id").executeTakeFirst();
      if (!result) return json({ error: "Company not found." }, 404);
    } else if (body.action === "hideJob") {
      entityId = body.jobId || null; entityType = "recruiter_job";
      const result = await db.updateTable("recruiterJobs").set({ status: "hidden", updatedAt: new Date() }).where("id", "=", String(body.jobId)).returning("id").executeTakeFirst();
      if (!result) return json({ error: "Job not found." }, 404);
    } else {
      entityId = body.reportId || null;
      const result = await db.updateTable("opportunityReports").set({ status: "resolved" }).where("id", "=", String(body.reportId)).returning("id").executeTakeFirst();
      if (!result) return json({ error: "Report not found." }, 404);
    }
    await db.insertInto("adminAuditLogs").values({ adminUserId: String(user.id), action: body.action, entityId, entityType, details: "Admin moderation action" }).execute();
    return json({ ok: true });
  } catch (error) {
    if (error instanceof NotAuthenticatedError) return json({ error: "Not authenticated" }, 401);
    if (error instanceof ZodError || error instanceof SyntaxError || error instanceof TypeError) return json({ error: "Please check the moderation action details." }, 400);
    return json({ error: "Moderation action failed. Please try again later." }, 500);
  }
}