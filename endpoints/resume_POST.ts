import superjson from "superjson";
import { ZodError } from "zod";
import { schema } from "./resume_POST.schema";
import { db } from "../helpers/db";
import { getServerUserSession } from "../helpers/getServerUserSession";
import { NotAuthenticatedError } from "../helpers/getSetServerSession";

export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);
    const body = schema.parse(superjson.parse(await request.text()));
    const meaningfulEntries = (entries: Array<Record<string, string>>) => entries.filter((entry) =>
      Object.values(entry).some((value) => typeof value === "string" && value.trim().length > 0));
    const education = meaningfulEntries(body.education);
    const experience = meaningfulEntries(body.experience);
    const projects = meaningfulEntries(body.projects);
    const text = [body.headline, body.summary, ...body.skills, ...education.map((entry) => Object.values(entry).join(" ")),
      ...experience.map((entry) => Object.values(entry).join(" ")),
      ...projects.map((entry) => Object.values(entry).join(" ")), ...body.certifications]
      .join(" ").toLowerCase();
    const keywords = [
      "java", "python", "javascript", "react", "node", "sql", "git", "docker", "aws",
      "machine learning", "data structures", "algorithms", "communication",
    ];
    const hits = keywords.filter((keyword) => text.includes(keyword));
    const missing = keywords.filter((keyword) => !text.includes(keyword)).slice(0, 6);
    const keywordScore = Math.round((hits.length / keywords.length) * 60);
    const sectionScore = [body.summary.trim().length >= 120, body.skills.some((skill) => skill.trim().length > 0),
      education.length > 0, experience.length > 0, projects.length > 0, body.certifications.length > 0]
      .filter(Boolean).length *  (40 / 6);
    const score = Math.min(100, Math.round(keywordScore + sectionScore));
    const feedback = [
      hits.length < 5 ? "Add more role-relevant keywords from the job description." : "Good keyword coverage for the selected content.",
      body.summary.length < 120 ? "Expand your summary with measurable impact and target role." : "Your summary has useful detail.",
      projects.length < 2 ? "Add at least two substantial projects with technologies and outcomes." : "Projects section provides useful evidence.",
      missing.length ? "Consider adding evidence for: " + missing.join(", ") + "." : "Core tracked skills are represented.",
    ];
    const resume = await db.insertInto("resumes").values({
      ...body, userId: String(user.id), atsScore: Math.min(100, score), atsFeedback: feedback,
    }).onConflict((oc) => oc.column("userId").doUpdateSet({
      ...body, atsScore: Math.min(100, score), atsFeedback: feedback, updatedAt: new Date(),
    })).returningAll().executeTakeFirstOrThrow();
    return new Response(superjson.stringify({ resume }), { headers: { "Content-Type": "application/json" } });
  } catch (error) {
    const unauthorized = error instanceof NotAuthenticatedError;
    const invalidInput = error instanceof ZodError || error instanceof SyntaxError;
    return new Response(superjson.stringify({
      error: unauthorized ? "Not authenticated" : invalidInput
        ? "Please check the resume fields and try again" : "Resume could not be saved right now",
    }), {
      status: unauthorized ? 401 : invalidInput ? 400 : 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}