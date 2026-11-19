import superjson from "superjson";
import { db } from "../helpers/db";
import { getServerUserSession } from "../helpers/getServerUserSession";
import { NotAuthenticatedError } from "../helpers/getSetServerSession";
import { z, ZodError } from "zod";

const inputSchema = z.object({ jobDescription: z.string().max(12000).optional().default("") });

function resumeText(resume: any) {
  return [resume.title, resume.headline, resume.summary, resume.skills, resume.education, resume.experience,
    resume.projects, resume.certifications].flatMap((value) => Array.isArray(value) ? value.map((item) =>
      typeof item === "string" ? item : Object.values(item || {}).join(" ")) : [value || ""]).join("\n").slice(0, 16000);
}

function keywordFallback(resume: any, jobDescription: string) {
  const text = resumeText(resume).toLowerCase();
  const terms = [...new Set((jobDescription.toLowerCase().match(/[a-z][a-z0-9+#.]{2,}/g) || [])
    .filter((word) => !new Set(["the", "and", "for", "with", "you", "your", "are", "will", "our", "this", "that", "from", "have", "has", "who", "can", "not", "all", "job", "role", "work", "team", "years", "year", "ability", "skills", "experience", "responsibilities", "requirements", "candidate", "must", "should", "their", "they", "about", "into", "using", "used", "such", "etc"]).has(word)))].slice(0, 80);
  const matchedSkills = terms.filter((term) => text.includes(term));
  const missingSkills = terms.filter((term) => !text.includes(term));
  const overallScore = terms.length ? Math.round(matchedSkills.length / terms.length * 100) : 0;
  return { mode: "keyword-fallback" as const, overallScore, matchedSkills: matchedSkills.slice(0, 20), missingSkills: missingSkills.slice(0, 20),
    suggestions: ["Add evidence for the most important requirements you genuinely meet.", "Use measurable outcomes in project and experience bullets.", "Do not add skills or experience you cannot substantiate."],
    disclaimer: "Basic keyword overlap only. It does not understand context or certify ATS compatibility." };
}

const json = (body: unknown, status = 200) => new Response(superjson.stringify(body), {
  status,
  headers: { "Content-Type": "application/json" },
});

export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);
    const input = inputSchema.parse(await request.json().catch(() => ({})));
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
    let jobMatch: any = null;
    if (input.jobDescription.trim()) {
      const fallback = keywordFallback(resume, input.jobDescription);
      const key = (process.env as Record<string, string | undefined>).OPENAI_API_KEY;
      if (key) {
        try {
          const model = (process.env as Record<string, string | undefined>).OPENAI_MODEL || "gpt-4.1-mini";
          const response = await fetch("https://api.openai.com/v1/responses", {
            method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
            body: JSON.stringify({ model, max_output_tokens: 1200, input: `Compare this resume with the job description. Only credit evidence explicitly present in the resume. Do not invent skills or experience. Return JSON only: {"overallScore": number 0-100, "matchedSkills": string[], "missingSkills": string[], "suggestions": string[]}. Keep lists concise and actionable. The score is an approximate relevance estimate, not an ATS guarantee.\nRESUME:\n${resumeText(resume)}\nJOB DESCRIPTION:\n${input.jobDescription}` }),
          });
          if (response.ok) {
            const payload: any = await response.json();
            const raw = payload?.output_text || payload?.output?.flatMap((item: any) => item?.content || []).find((item: any) => item?.text)?.text;
            const parsed = typeof raw === "string" ? JSON.parse(raw.replace(/^```(?:json)?\\s*|\\s*```$/g, "")) : null;
            if (parsed && Array.isArray(parsed.matchedSkills) && Array.isArray(parsed.missingSkills) && Array.isArray(parsed.suggestions)) {
              jobMatch = { mode: "ai", overallScore: Math.max(0, Math.min(100, Math.round(Number(parsed.overallScore) || 0))),
                matchedSkills: parsed.matchedSkills.slice(0, 20).map(String), missingSkills: parsed.missingSkills.slice(0, 20).map(String),
                suggestions: parsed.suggestions.slice(0, 8).map(String), disclaimer: "AI-assisted estimate based only on the resume and job description supplied. It is not a certified ATS result or hiring prediction." };
            }
          }
        } catch { /* A clearly labelled keyword fallback remains available. */ }
      }
      jobMatch ||= fallback;
    }
    return json({ resume, checks, feedback, jobMatch });
  } catch (error) {
    if (error instanceof NotAuthenticatedError) return json({ error: "Not authenticated" }, 401);
    if (error instanceof ZodError) return json({ error: "Job description is too long or invalid." }, 400);
    return json({ error: "Resume analysis is temporarily unavailable. Please try again." }, 500);
  }
}
