import superjson from "superjson";
import { db } from "../helpers/db";
import { getServerUserSession } from "../helpers/getServerUserSession";
import { NotAuthenticatedError } from "../helpers/getSetServerSession";

export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);
    const uid = String(user.id);
    const profile = await db.selectFrom("studentProfiles").selectAll().where("userId", "=", uid).executeTakeFirst();
    const applications = await db.selectFrom("applications").selectAll().where("userId", "=", uid).execute();
    const recruiterApplications = await db.selectFrom("recruiterApplications").selectAll().where("studentUserId", "=", uid).execute();
    const resumes = await db.selectFrom("resumes").select(["id", "title", "atsScore", "updatedAt"]).where("userId", "=", uid).orderBy("updatedAt", "desc").limit(3).execute();
    const interviews = await db.selectFrom("mockInterviews").select(["id", "targetRole", "overallScore", "status", "updatedAt"]).where("userId", "=", uid).orderBy("updatedAt", "desc").limit(3).execute();
    const assessment = await db.selectFrom("skillAssessments").selectAll().where("userId", "=", uid).orderBy("updatedAt", "desc").executeTakeFirst();
    const unread = await db.selectFrom("notifications").select("id").where("userId", "=", uid).where("isRead", "=", false).execute();
    const saved = applications.filter(a => a.status === "saved").length;
    const applied = applications.filter(a => a.status === "applied").length + recruiterApplications.filter(a => a.status !== "received").length;
    const interviewsCount = applications.filter(a => a.status === "interview").length + recruiterApplications.filter(a => a.status === "interview").length;
    const offers = applications.filter(a => a.status === "offer").length + recruiterApplications.filter(a => a.status === "selected").length;
    const readiness = assessment?.readinessScore ?? Math.min(100, Math.round((Number(profile?.profileCompletion || 0) * 0.45) + (resumes[0]?.atsScore || 0) * 0.25 + (interviews[0]?.overallScore || 0) * 0.3));
    return new Response(superjson.stringify({
      user: { displayName: user.displayName, email: user.email },
      profile,
      stats: {
        profileCompletion: Number(profile?.profileCompletion || 0),
        readiness: Number(readiness || 0),
        applications: applications.length + recruiterApplications.length,
        applied,
        interviews: interviewsCount,
        offers,
        saved,
        unread: Number(unread.length),
        skills: (profile?.skills || []).length,
      },
      resumes,
      interviews,
      assessment,
      recentApplications: applications.slice(-5).reverse(),
    }), { headers: { "Content-Type": "application/json" } });
  } catch (error) {
    // Keep the response generic and avoid logging user-linked dashboard data.
    const isUnauthenticated = error instanceof NotAuthenticatedError;
    return new Response(superjson.stringify({ error: isUnauthenticated ? "Not authenticated" : "Unable to load dashboard" }), {
      status: isUnauthenticated ? 401 : 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
