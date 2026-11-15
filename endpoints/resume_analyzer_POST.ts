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
    const resume = await db.selectFrom("resumes").selectAll()
      .where("userId", "=", String(user.id)).orderBy("updatedAt", "desc").executeTakeFirst();
    if (!resume) return json({ error: "Create your resume first" }, 404);

    const skills = Array.isArray(resume.skills) ? resume.skills : [];
    const feedback = Array.isArray(resume.atsFeedback) ? resume.atsFeedback : [];
    const checks = [
      { label: "Contact information", ok: Boolean(resume.email && resume.phone) },
      { label: "Professional summary", ok: Boolean(resume.summary && resume.summary.length >= 80) },
      { label: "Technical skills", ok: skills.length >= 6 },
      { label: "Projects", ok: Array.isArray(resume.projects) && resume.projects.length >= 2 },
      { label: "Experience", ok: Array.isArray(resume.experience) && resume.experience.length > 0 },
      { label: "ATS keyword coverage", ok: Number(resume.atsScore || 0) >= 60 },
    ];
    return json({ resume, checks, feedback });
  } catch (error) {
    if (error instanceof NotAuthenticatedError) return json({ error: "Not authenticated" }, 401);
    return json({ error: "Resume analysis is temporarily unavailable. Please try again." }, 500);
  }
}