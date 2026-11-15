import superjson from "superjson";
import { ZodError } from "zod";
import { schema } from "./job_alerts_POST.schema";
import { db } from "../helpers/db";
import { getServerUserSession } from "../helpers/getServerUserSession";
import { NotAuthenticatedError } from "../helpers/getSetServerSession";
const json = (body: unknown, status = 200) => new Response(superjson.stringify(body), { status, headers: { "Content-Type": "application/json" } });
export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);
    const body = schema.parse(superjson.parse(await request.text()));
    const userId = String(user.id);
    if (body.action === "delete") {
      if (!body.id) return json({ error: "Alert ID is required." }, 400);
      await db.deleteFrom("jobAlerts").where("id", "=", body.id).where("userId", "=", userId).execute();
      return json({ ok: true });
    }
    if (body.action === "toggle" || body.action === "update") {
      if (!body.id) return json({ error: "Alert ID is required." }, 400);
      const current = await db.selectFrom("jobAlerts").selectAll().where("id", "=", body.id).where("userId", "=", userId).executeTakeFirst();
      if (!current) return json({ error: "Job alert not found." }, 404);
      const values: Record<string, unknown> = { updatedAt: new Date() };
      if (body.action === "toggle") values.isActive = !current.isActive;
      else {
        if (body.name !== undefined) values.name = body.name;
        if (body.keywords !== undefined) values.keywords = body.keywords || null;
        if (body.location !== undefined) values.location = body.location || null;
        if (body.workMode !== undefined) values.workMode = body.workMode || null;
        if (body.experience !== undefined) values.experience = body.experience || null;
        if (body.employmentType !== undefined) values.employmentType = body.employmentType || null;
        if (body.salaryMin !== undefined) values.salaryMin = body.salaryMin ? Number(body.salaryMin) : null;
        if (body.frequency !== undefined) values.frequency = body.frequency || "daily";
        if (body.isActive !== undefined) values.isActive = body.isActive;
        if (typeof values.name === "string" && !values.name.trim()) return json({ error: "Alert name is required." }, 400);
        if (typeof values.salaryMin === "number" && (!Number.isFinite(values.salaryMin) || values.salaryMin < 0)) return json({ error: "Enter a valid minimum salary." }, 400);
      }
      const alert = await db.updateTable("jobAlerts").set(values as any).where("id", "=", body.id).where("userId", "=", userId).returningAll().executeTakeFirstOrThrow();
      return json({ alert, ok: true });
    }
    if (!body.name?.trim()) return json({ error: "Alert name is required." }, 400);
    if (body.salaryMin && (!Number.isFinite(Number(body.salaryMin)) || Number(body.salaryMin) < 0)) return json({ error: "Enter a valid minimum salary." }, 400);
    const alert = await db.insertInto("jobAlerts").values({ userId, name: body.name.trim(), keywords: body.keywords || null, location: body.location || null, workMode: body.workMode || null, experience: body.experience || null, employmentType: body.employmentType || null, salaryMin: body.salaryMin ? Number(body.salaryMin) : null, frequency: body.frequency || "daily", isActive: true, lastNotifiedAt: null, createdAt: new Date(), updatedAt: new Date() }).returningAll().executeTakeFirstOrThrow();
    return json({ alert, ok: true });
  } catch (error) {
    if (error instanceof NotAuthenticatedError) return json({ error: "Not authenticated" }, 401);
    if (error instanceof ZodError || error instanceof SyntaxError || error instanceof TypeError) return json({ error: "Please check the job alert details and try again." }, 400);
    return json({ error: "Could not update job alert. Please try again later." }, 500);
  }
}