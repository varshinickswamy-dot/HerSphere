import superjson from "superjson";
import { ZodError } from "zod";
import { schema } from "./career_analysis_POST.schema";
import { db } from "../helpers/db";
import { getServerUserSession } from "../helpers/getServerUserSession";
import { NotAuthenticatedError } from "../helpers/getSetServerSession";
import { getRequiredSkillsForRole, normalizeCareerSkill } from "../helpers/careerSkills";

export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);
    const input = schema.parse(superjson.parse(await request.text()));
    const profile = await db.selectFrom("studentProfiles").selectAll()
      .where("userId", "=", String(user.id)).executeTakeFirst();
    const role = input.targetRole.trim();
    const target = getRequiredSkillsForRole(role);
    const skills = (profile?.skills ?? []).map(normalizeCareerSkill);
    const strengths = (profile?.skills ?? []).filter((skill) => target.some((required) => normalizeCareerSkill(required) === normalizeCareerSkill(skill)));
    const gaps = target.filter((skill) => !skills.includes(normalizeCareerSkill(skill)));
    const score = Math.min(100, Math.max(0, Math.round((strengths.length / Math.max(target.length, 1)) * 100)));
    const summary = "Your " + role + " profile currently matches " + strengths.length + " of " + target.length
      + " core skills. Focus next on " + (gaps.slice(0, 3).join(", ") || "building projects and interview readiness") + ".";
    const milestones = gaps.slice(0, 5).map((skill, index) => ({
      step: index + 1, title: "Build " + skill + " capability", skill,
      status: index === 0 ? "current" : "upcoming",
      description: "Learn " + skill + ", complete a small practical project, and add evidence to your portfolio.",
    }));
    const assessment = await db.insertInto("skillAssessments").values({
      userId: String(user.id), targetRole: role, strengths, recommendedSkills: gaps,
      skillGaps: gaps, readinessScore: score, summary,
    }).onConflict((oc) => oc.column("userId").doUpdateSet({
      targetRole: role, strengths, recommendedSkills: gaps, skillGaps: gaps,
      readinessScore: score, summary, updatedAt: new Date(),
    })).returningAll().executeTakeFirstOrThrow();
    const roadmap = await db.insertInto("careerRoadmaps").values({
      userId: String(user.id), targetRole: role,
      summary: "A practical roadmap for " + role + " based on your current profile.", milestones,
    }).onConflict((oc) => oc.column("userId").doUpdateSet({
      targetRole: role, summary: "A practical roadmap for " + role + " based on your current profile.",
      milestones, updatedAt: new Date(),
    })).returningAll().executeTakeFirstOrThrow();
    return new Response(superjson.stringify({ assessment, roadmap }), { headers: { "Content-Type": "application/json" } });
  } catch (error) {
    const unauthorized = error instanceof NotAuthenticatedError;
    const invalidInput = error instanceof ZodError || error instanceof SyntaxError;
    return new Response(superjson.stringify({
      error: unauthorized ? "Not authenticated" : invalidInput
        ? "Please check your career goal and try again" : "Career analysis is temporarily unavailable",
    }), {
      status: unauthorized ? 401 : invalidInput ? 400 : 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
