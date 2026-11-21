import superjson from "superjson";
import { db } from "../helpers/db";
import { getServerUserSession } from "../helpers/getServerUserSession";
import { NotAuthenticatedError } from "../helpers/getSetServerSession";

const json = (body: unknown, status = 200) => new Response(superjson.stringify(body), { status, headers: { "Content-Type": "application/json" } });

export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);
    const company = await db.selectFrom("companyProfiles").select("id").where("userId", "=", String(user.id)).executeTakeFirst();
    if (!company) return json({ error: "Recruiter/company access required." }, 403);
    const id = new URL(request.url).searchParams.get("candidateUserId");
    if (!id || !/^\d+$/.test(id)) return json({ error: "A valid candidate is required." }, 400);
    if (String(user.id) === id) return json({ error: "You cannot open your own recruiter candidate record." }, 403);
    const [candidate, profile, resume, applications, savedCandidate] = await Promise.all([
      db.selectFrom("users").select(["id", "displayName", "email", "avatarUrl", "role"]).where("id", "=", Number(id)).executeTakeFirst(),
      db.selectFrom("studentProfiles").select(["userId", "college", "degree", "branch", "graduationYear", "cgpa", "careerGoal", "experienceLevel", "interests", "languages", "location", "preferredLocation", "preferredRole", "profileCompletion", "skills", "role", "updatedAt"]).where("userId", "=", String(id)).executeTakeFirst(),
      db.selectFrom("resumes").selectAll().where("userId", "=", String(id)).orderBy("updatedAt", "desc").executeTakeFirst(),
      db.selectFrom("recruiterApplications as a").innerJoin("recruiterJobs as j", "j.id", "a.recruiterJobId")
        .select(["a.id", "a.status", "a.notes", "a.createdAt", "a.updatedAt", "j.id as jobId", "j.title"])
        .where("a.studentUserId", "=", String(id)).where("j.companyId", "=", String(company.id))
        .orderBy("a.updatedAt", "desc").execute(),
      db.selectFrom("recruiterSavedCandidates").select(["id", "note"])
        .where("recruiterUserId", "=", String(user.id)).where("candidateUserId", "=", String(id)).executeTakeFirst(),
    ]);
    if (!candidate || !profile || (candidate.role !== "student" && candidate.role !== "user") || profile.role !== "student") {
      return json({ error: "Candidate profile not found." }, 404);
    }
    // Contact details and the full resume are private until the candidate applies
    // to an opportunity owned by this recruiter's company.
    const hasAppliedToCompany = applications.length > 0;
    const visibleCandidate = { ...candidate, email: hasAppliedToCompany ? candidate.email : null };
    const recent = await db.selectFrom("profileViews").select("id").where("profileUserId", "=", String(id))
      .where("viewerUserId", "=", String(user.id)).where("createdAt", ">=", new Date(Date.now() - 86400000)).executeTakeFirst();
    if (!recent) {
      await db.insertInto("profileViews").values({ profileUserId: String(id), viewerUserId: String(user.id) }).execute();
      await db.insertInto("notifications").values({ userId: String(id), title: "Your profile was viewed",
        message: "A recruiter from HerSphere viewed your career profile.", type: "profile", link: "/profile", isRead: false }).execute();
    }
    return json({ candidate: visibleCandidate, profile, resume: hasAppliedToCompany ? resume : null, applications, hasAppliedToCompany, savedCandidate: savedCandidate || null });
  } catch (error) {
    if (error instanceof NotAuthenticatedError) return json({ error: "Not authenticated." }, 401);
    return json({ error: "Could not load candidate profile." }, 500);
  }
}
