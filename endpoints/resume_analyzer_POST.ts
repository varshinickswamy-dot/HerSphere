import superjson from "superjson";
import { db } from "../helpers/db";
import { getServerUserSession } from "../helpers/getServerUserSession";
import { NotAuthenticatedError } from "../helpers/getSetServerSession";

const json = (body: unknown, status = 200) => new Response(superjson.stringify(body), {
  status,
  headers: { "Content-Type": "application/json" },
});
   10	
   11	export async function handle(request: Request) {
   12	  try {
   13	    const { user } = await getServerUserSession(request);
   14	    const resume = await db.selectFrom("resumes").selectAll()
   15	      .where("userId", "=", String(user.id)).orderBy("updatedAt", "desc").executeTakeFirst();
   16	    if (!resume) return json({ error: "Create your resume first" }, 404);
   17	
   18	    const skills = Array.isArray(resume.skills) ? resume.skills : [];
   19	    const feedback = Array.isArray(resume.atsFeedback) ? resume.atsFeedback : [];
   20	    const checks = [
   21	      { label: "Contact information", ok: Boolean(resume.email && resume.phone) },
   22	      { label: "Professional summary", ok: Boolean(resume.summary && resume.summary.length >= 80) },
   23	      { label: "Technical skills", ok: skills.length >= 6 },
   24	      { label: "Projects", ok: Array.isArray(resume.projects) && resume.projects.length >= 2 },
   25	      { label: "Experience", ok: Array.isArray(resume.experience) && resume.experience.length > 0 },
   26	      { label: "ATS keyword coverage", ok: Number(resume.atsScore || 0) >= 60 },
   27	    ];
   28	    return json({ resume, checks, feedback });
   29	  } catch (error) {
   30	    if (error instanceof NotAuthenticatedError) return json({ error: "Not authenticated" }, 401);
   31	    return json({ error: "Resume analysis is temporarily unavailable. Please try again." }, 500);
   32	  }
   33	}