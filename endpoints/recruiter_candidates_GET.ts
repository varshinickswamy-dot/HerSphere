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
    const minCgpa = Number(params.get("minCgpa") || 0);
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

