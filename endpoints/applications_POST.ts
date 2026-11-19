import superjson from "superjson";
import { ZodError } from "zod";
import { schema } from "./applications_POST.schema";
import { db } from "../helpers/db";
import { getServerUserSession } from "../helpers/getServerUserSession";
import { NotAuthenticatedError } from "../helpers/getSetServerSession";
import { publishUserEvent } from "../helpers/realtimePublish";

export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);
    if (user.role !== "student" && user.role !== "user") {
      return new Response(superjson.stringify({ error: "Student access is required to manage personal applications." }), {
        status: 403, headers: { "Content-Type": "application/json" },
      });
    }
    const body = schema.parse(superjson.parse(await request.text()));

    if (body.action === "save") {
      if (body.recruiterJobId) {
        const job = await db.selectFrom("recruiterJobs")
          .innerJoin("companyProfiles", "companyProfiles.id", "recruiterJobs.companyId")
          .select(["recruiterJobs.id", "recruiterJobs.title", "companyProfiles.userId as companyUserId"])
          .where("recruiterJobs.id", "=", String(body.recruiterJobId)).executeTakeFirstOrThrow();
        const existing = await db.selectFrom("recruiterApplications").select("id")
          .where("recruiterJobId", "=", String(body.recruiterJobId))
          .where("studentUserId", "=", String(user.id)).executeTakeFirst();
        if (existing) return new Response(superjson.stringify({ application: existing, alreadyApplied: true }), {
          headers: { "Content-Type": "application/json" },
        });
        const application = await db.insertInto("recruiterApplications").values({
          recruiterJobId: job.id, studentUserId: String(user.id), status: "received", notes: null,
        }).returningAll().executeTakeFirstOrThrow();
        await publishUserEvent(user.id, "application.created", { application });
        await publishUserEvent(job.companyUserId, "application.received", { application });
        await db.insertInto("notifications").values({
          userId: String(job.companyUserId), title: "New candidate application",
          message: "A student applied for " + job.title + ".", type: "application",
          link: "/recruiter", isRead: false,
        }).execute();
        return new Response(superjson.stringify({ application }), { headers: { "Content-Type": "application/json" } });
      }
      if (!body.jobId && !body.internshipId) return new Response(
        superjson.stringify({ error: "Opportunity id required" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
      const existing = await db.selectFrom("applications").selectAll()
        .where("userId", "=", String(user.id))
        .where((eb) => body.jobId ? eb("jobId", "=", String(body.jobId)) : eb("internshipId", "=", String(body.internshipId)))
        .executeTakeFirst();
      if (existing) return new Response(superjson.stringify({ application: existing, alreadyApplied: true }), {
        headers: { "Content-Type": "application/json" },
      });
      const application = await db.insertInto("applications").values({
        userId: String(user.id), jobId: body.jobId ? String(body.jobId) : null,
        internshipId: body.internshipId ? String(body.internshipId) : null,
        status: "saved", notes: null, appliedAt: null,
      }).returningAll().executeTakeFirstOrThrow();
      await publishUserEvent(user.id, "application.updated", { application });
      return new Response(superjson.stringify({ application }), { headers: { "Content-Type": "application/json" } });
    }

    const application = await db.updateTable("applications").set({
      status: body.status, notes: body.notes ?? null,
      appliedAt: body.status === "applied" ? new Date() : undefined, updatedAt: new Date(),
    }).where("id", "=", body.id).where("userId", "=", String(user.id))
      .returningAll().executeTakeFirstOrThrow();
    return new Response(superjson.stringify({ application }), { headers: { "Content-Type": "application/json" } });
  } catch (error) {
    const unauthorized = error instanceof NotAuthenticatedError;
    const invalidInput = error instanceof ZodError || error instanceof SyntaxError;
    return new Response(superjson.stringify({
      error: unauthorized ? "Not authenticated" : invalidInput
        ? "Please check the application details and try again" : "Could not save or update application",
    }), {
      status: unauthorized ? 401 : invalidInput ? 400 : 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
