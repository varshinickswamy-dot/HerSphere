import superjson from "superjson";
import { ZodError } from "zod";
import { schema } from "./recruiter_POST.schema";
import { db } from "../helpers/db";
import { getServerUserSession } from "../helpers/getServerUserSession";
import { NotAuthenticatedError } from "../helpers/getSetServerSession";
import { publishUserEvent } from "../helpers/realtimePublish";
import { publish } from "@floot/realtime";
import { channels } from "../helpers/realtimeChannels";

const json = (body: unknown, status = 200) => new Response(superjson.stringify(body), {
  status,
  headers: { "Content-Type": "application/json" },
});

export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);
    if (user.role !== "recruiter" && user.role !== "company" && user.role !== "user") {
      return json({ error: "Recruiter or company access required." }, 403);
    }
    const b = schema.parse(superjson.parse(await request.text()));

    if (b.action === "profile") {
      const existing = await db.selectFrom("companyProfiles").select("id")
        .where("userId", "=", String(user.id)).executeTakeFirst();
      if (!existing) {
        return json({ error: "Company accounts must be created through company registration. Personal accounts cannot promote themselves to recruiter access." }, 403);
      }
      const result = await db.updateTable("companyProfiles").set({
        companyName: b.companyName?.trim() || "My Company",
        industry: b.industry || null,
        description: b.description || null,
        website: b.website || null,
        location: b.location || null,
        updatedAt: new Date(),
      }).where("userId", "=", String(user.id)).returningAll().executeTakeFirstOrThrow();
      return json({ result });
    }

    if (b.action === "job") {
      const company = await db.selectFrom("companyProfiles").select("id")
        .where("userId", "=", String(user.id)).executeTakeFirst();
      if (!company) return json({ error: "Create a company profile before posting a job." }, 403);
      const result = await db.insertInto("recruiterJobs").values({
        companyId: company.id,
        title: b.title || "Untitled role",
        description: b.jobDescription || null,
        location: b.location || null,
        workMode: b.workMode || "Hybrid",
        employmentType: b.employmentType || "Full-time",
        experience: b.experience || null,
        salaryRange: b.salaryRange || null,
        skills: b.skills || [],
        deadline: b.deadline ? new Date(b.deadline) : null,
        eligibility: b.eligibility || null,
        educationRequirement: b.educationRequirement || null,
        minimumCgpa: b.minimumCgpa ? Number(b.minimumCgpa) : null,
        graduationYears: b.graduationYears || null,
        benefits: b.benefits || null,
        applicationUrl: b.applicationUrl || null,
      }).returningAll().executeTakeFirstOrThrow();
      await publish(channels.marketplace(), { type: "opportunity.created", opportunity: result });
      return json({ result });
    }

    const allowedStatuses = ["received", "reviewing", "shortlisted", "interview", "selected", "rejected", "offer", "hired"];
    if (!b.applicationId || !b.status || !allowedStatuses.includes(b.status)) {
      return json({ error: "Choose a valid application status." }, 400);
    }
    if (b.status === "interview" && (!b.interviewAt || new Date(b.interviewAt).getTime() <= Date.now())) {
      return json({ error: "Choose a future date and time for the interview." }, 400);
    }
    if (b.status === "interview" && b.interviewMode === "online" && !b.meetingUrl) {
      return json({ error: "Add the online meeting link before sending the invitation." }, 400);
    }
    const result = await db.updateTable("recruiterApplications")
      .set({ status: b.status, notes: b.notes || null, updatedAt: new Date() })
      .where("id", "=", String(b.applicationId))
      .where("recruiterJobId", "in", db.selectFrom("recruiterJobs").select("id")
        .where("companyId", "in", db.selectFrom("companyProfiles").select("id")
          .where("userId", "=", String(user.id))))
      .returningAll().executeTakeFirstOrThrow();
    const candidate = await db.selectFrom("recruiterApplications")
      .innerJoin("recruiterJobs", "recruiterJobs.id", "recruiterApplications.recruiterJobId")
      .select(["recruiterApplications.studentUserId", "recruiterJobs.title"])
      .where("recruiterApplications.id", "=", String(b.applicationId)).executeTakeFirst();
    if (candidate) {
      if (b.status === "interview" && b.interviewAt) {
        const when = new Date(b.interviewAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" });
        const mode = b.interviewMode === "in_person" ? "In person" : b.interviewMode === "phone" ? "Phone" : "Online";
        const invitation = "Interview invitation for " + candidate.title + "\n\nDate and time: " + when + " (IST)\nFormat: " + mode +
          (b.meetingUrl ? "\nMeeting / location link: " + b.meetingUrl : "") +
          (b.notes ? "\nAdditional notes: " + b.notes : "") +
          "\n\nPlease reply to this message if you need to discuss the schedule.";
        await db.insertInto("messages").values({
          senderUserId: String(user.id), recipientUserId: String(candidate.studentUserId),
          subject: "Interview invitation — " + candidate.title, body: invitation,
          recruiterJobId: null, createdAt: new Date(), readAt: null,
        }).execute();
      }
      await publishUserEvent(candidate.studentUserId, "application.status_changed", {
        applicationId: b.applicationId, status: b.status, jobTitle: candidate.title,
      });
      await db.insertInto("notifications").values({
        userId: String(candidate.studentUserId),
        title: "Application status updated",
        message: b.status === "interview" && b.interviewAt
          ? "You have an interview invitation for " + candidate.title + ". Check your HerSphere messages for details."
          : "Your application for " + candidate.title + " is now " + b.status + ".",
        type: "application", link: "/applications", isRead: false,
      }).execute();
    }
    return json({ result });
  } catch (error) {
    if (error instanceof NotAuthenticatedError) return json({ error: "Not authenticated" }, 401);
    if (error instanceof ZodError || error instanceof SyntaxError || error instanceof TypeError) {
      return json({ error: "Please check the recruiter action details and try again." }, 400);
    }
    return json({ error: "Recruiter action failed. Please try again later." }, 500);
  }
}
