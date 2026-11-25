import superjson from "superjson";
import { db } from "../helpers/db";
import { getServerUserSession } from "../helpers/getServerUserSession";
import { NotAuthenticatedError } from "../helpers/getSetServerSession";

const json = (body: unknown, status = 200) => new Response(superjson.stringify(body), { status, headers: { "Content-Type": "application/json" } });

export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);
    const company = await db.selectFrom("companyProfiles").select("id")
      .where("userId", "=", String(user.id)).executeTakeFirst();
    if (!company) return json({ error: "Recruiter/company access required." }, 403);

    const params = new URL(request.url).searchParams;
    const q = (params.get("q") || "").trim().toLowerCase();
    const skill = (params.get("skill") || "").trim().toLowerCase();
    const location = (params.get("location") || "").trim().toLowerCase();
    const graduationYear = (params.get("graduationYear") || "").trim();
    const rawMinCgpa = params.get("minCgpa");
    const minCgpa = rawMinCgpa == null || rawMinCgpa.trim() === "" ? 0 : Number(rawMinCgpa);
    if (q.length > 100 || skill.length > 80 || location.length > 100) return json({ error: "Search filters are too long." }, 400);
    if (rawMinCgpa != null && rawMinCgpa.trim() !== "" && (!Number.isFinite(minCgpa) || minCgpa < 0 || minCgpa > 10)) {
      return json({ error: "Minimum CGPA must be a number between 0 and 10." }, 400);
    }
    if (graduationYear && !/^20\d{2}$/.test(graduationYear)) return json({ error: "Enter a valid graduation year." }, 400);
    const savedOnly = params.get("savedOnly") === "true";

    const [rows, savedRows] = await Promise.all([
      db.selectFrom("studentProfiles as p").innerJoin("users as u", "u.id", "p.userId")
        .select(["u.id", "u.displayName", "u.avatarUrl", "p.college", "p.degree", "p.branch",
          "p.graduationYear", "p.cgpa", "p.skills", "p.preferredRole", "p.preferredLocation", "p.location", "p.experienceLevel", "p.profileCompletion"])
        .orderBy("p.updatedAt", "desc").limit(200).execute(),
      db.selectFrom("recruiterSavedCandidates").select(["candidateUserId", "note"])
        .where("recruiterUserId", "=", String(user.id)).execute(),
    ]);
    const savedMap = new Map(savedRows.map(row => [String(row.candidateUserId), row.note || ""]));
    const candidates = rows.filter(candidate => {
      const haystack = [candidate.displayName, candidate.college, candidate.degree, candidate.branch,
        candidate.preferredRole, candidate.preferredLocation, candidate.location, ...(candidate.skills || [])].join(" ").toLowerCase();
      if (q && !haystack.includes(q)) return false;
      if (skill && !(candidate.skills || []).some(value => value.toLowerCase().includes(skill))) return false;
      if (location && ![candidate.location, candidate.preferredLocation].some(value => (value || "").toLowerCase().includes(location))) return false;
      if (graduationYear && String(candidate.graduationYear || "") !== graduationYear) return false;
      if (minCgpa && Number(candidate.cgpa || 0) < minCgpa) return false;
      if (savedOnly && !savedMap.has(String(candidate.id))) return false;
      return true;
    }).map(candidate => ({ ...candidate, isSaved: savedMap.has(String(candidate.id)), savedNote: savedMap.get(String(candidate.id)) || "" }));

    return json({ candidates, total: candidates.length, savedCount: savedRows.length });
  } catch (error) {
    const unauthorized = error instanceof NotAuthenticatedError;
    return json({ error: unauthorized ? "Not authenticated" : "Could not load candidates" }, unauthorized ? 401 : 500);
  }
}
   56