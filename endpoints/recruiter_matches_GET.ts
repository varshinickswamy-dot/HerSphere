import superjson from "superjson";
import { db } from "../helpers/db";
import { getServerUserSession } from "../helpers/getServerUserSession";
import { NotAuthenticatedError } from "../helpers/getSetServerSession";

const json = (body: unknown, status = 200) => new Response(superjson.stringify(body), {
  status,
  headers: { "Content-Type": "application/json" },
});
const normalize = (value: unknown) => String(value || "").toLowerCase().trim();
const words = (value: unknown) => normalize(value).split(/[^a-z0-9+#.]+/).filter((word) => word.length > 1);

export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);
    const company = await db.selectFrom("companyProfiles").select("id")
      .where("userId", "=", String(user.id)).executeTakeFirst();
    if (!company) return json({ error: "Recruiter/company access required." }, 403);

    const jobId = new URL(request.url).searchParams.get("jobId") || "";
    if (!/^\d+$/.test(jobId)) return json({ error: "Choose a valid job." }, 400);
    const job = await db.selectFrom("recruiterJobs").selectAll()
      .where("id", "=", jobId).where("companyId", "=", String(company.id)).executeTakeFirst();
    if (!job) return json({ error: "Job not found." }, 404);

    const candidates = await db.selectFrom("studentProfiles as p")
      .innerJoin("users as u", "u.id", "p.userId")
      .select(["u.id", "u.displayName", "u.email", "u.avatarUrl", "p.college", "p.degree", "p.branch",
        "p.graduationYear", "p.cgpa", "p.skills", "p.preferredRole", "p.preferredLocation", "p.location", "p.profileCompletion"])
      .orderBy("p.updatedAt", "desc").limit(300).execute();

    const requiredSkills = Array.from(new Set((job.skills || []).map(normalize).filter(Boolean)));
    const roleTerms = words(job.title + " " + (job.description || "")).filter((term) => term.length > 2);
    const matches = candidates.map((candidate) => {
      const candidateSkills = (candidate.skills || []).map(normalize);
      const resumeText = [candidate.preferredRole, candidate.degree, candidate.branch, candidate.college]
        .map(normalize).join(" ");
      const matchedSkills = requiredSkills.filter((skill) => candidateSkills.some((item) => item === skill || item.includes(skill) || skill.includes(item)));
      const missingSkills = requiredSkills.filter((skill) => !matchedSkills.includes(skill));
      const skillScore = requiredSkills.length ? matchedSkills.length / requiredSkills.length * 55 : 0;
      const roleScore = roleTerms.length ? Math.min(20, roleTerms.filter((term) => resumeText.includes(term) || candidateSkills.some((s) => s.includes(term))).length / Math.min(roleTerms.length, 5) * 20) : 10;
      const locationText = normalize(job.location);
      const candidateLocation = normalize(candidate.preferredLocation || candidate.location);
      const locationScore = !locationText || /remote|anywhere/i.test(locationText) || !candidateLocation || candidateLocation.includes(locationText) || locationText.includes(candidateLocation) ? 10 : 0;
      const hasCgpa = candidate.cgpa !== null && candidate.cgpa !== undefined && candidate.cgpa !== "";
      const cgpa = hasCgpa ? Number(candidate.cgpa) : null;
      const cgpaScore = job.minimumCgpa == null ? 10 : cgpa === null ? 5 : cgpa >= Number(job.minimumCgpa) ? 10 : 0;
      const completionScore = Math.min(5, Math.max(0, Number(candidate.profileCompletion || 0) / 20));
      const score = Math.round(Math.min(100, skillScore + roleScore + locationScore + cgpaScore + completionScore));
      const cgpaStatus = job.minimumCgpa == null ? "not_required" : cgpa === null ? "not_provided" : cgpa >= Number(job.minimumCgpa) ? "meets" : "below";
      const yearStatus = !job.graduationYears ? "not_required" : !candidate.graduationYear ? "not_provided" : job.graduationYears.split(/[,;\s]+/).includes(String(candidate.graduationYear)) ? "meets" : "below";
      const eligible = cgpaStatus !== "below" && yearStatus !== "below";
      const needsReview = cgpaStatus === "not_provided" || yearStatus === "not_provided";
      return { ...candidate, matchScore: score, matchedSkills, missingSkills, eligible, needsReview, cgpaStatus, yearStatus,
        matchExplanation: `${matchedSkills.length} of ${requiredSkills.length} required skills matched; ${eligible ? needsReview ? "some eligibility details need verification" : "recorded eligibility criteria are met" : "one or more recorded eligibility criteria are not met"}.` };
    }).sort((a, b) => Number(b.eligible) - Number(a.eligible) || Number(a.needsReview) - Number(b.needsReview) || b.matchScore - a.matchScore);

    return json({ job, matches, total: matches.length });
  } catch (error) {
    if (error instanceof NotAuthenticatedError) return json({ error: "Not authenticated." }, 401);
    return json({ error: "Could not generate candidate matches." }, 500);
  }
}