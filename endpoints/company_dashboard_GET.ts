import superjson from "superjson";
import { db } from "../helpers/db";
import { getServerUserSession } from "../helpers/getServerUserSession";
import { NotAuthenticatedError } from "../helpers/getSetServerSession";

const json = (body: unknown, status = 200) => new Response(superjson.stringify(body), {
  status,
  headers: { "Content-Type": "application/json" },
});

export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);
    if (user.role !== "company" && user.role !== "recruiter" && user.role !== "user") {
      return json({ error: "Company workspace access required." }, 403);
    }
    const profile = await db.selectFrom("companyProfiles").selectAll()
      .where("userId", "=", String(user.id)).executeTakeFirst();
    if (!profile) return json({ error: "Company profile not found." }, 404);

    const jobs = await db.selectFrom("recruiterJobs").selectAll()
      .where("companyId", "=", profile.id).orderBy("createdAt", "desc").execute();
    const applications = await db.selectFrom("recruiterApplications")
      .innerJoin("recruiterJobs", "recruiterJobs.id", "recruiterApplications.recruiterJobId")
      .innerJoin("users", "users.id", "recruiterApplications.studentUserId")
      .select(["recruiterApplications.id", "recruiterApplications.status", "recruiterApplications.createdAt",
        "recruiterApplications.updatedAt", "recruiterJobs.id as jobId", "recruiterJobs.title",
        "users.displayName", "users.email"])
      .where("recruiterJobs.companyId", "=", profile.id)
      .orderBy("recruiterApplications.updatedAt", "desc").limit(100).execute();

    return json({
      profile, jobs, applications,
      stats: {
        totalJobs: jobs.length,
        activeJobs: jobs.filter((job) => job.status !== "hidden" && job.status !== "closed").length,
        totalApplications: applications.length,
        shortlisted: applications.filter((application) => application.status === "shortlisted").length,
        interviews: applications.filter((application) => application.status === "interview").length,
        selected: applications.filter((application) => application.status === "selected" || application.status === "hired").length,
      },
    });
  } catch (error) {
    const unauthorized = error instanceof NotAuthenticatedError;
    return json({ error: unauthorized ? "Not authenticated" : "Could not load company dashboard" }, unauthorized ? 401 : 500);
  }
}
