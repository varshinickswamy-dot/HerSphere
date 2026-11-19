import superjson from "superjson";
import { schema } from "./mock_interview_POST.schema";
import { db } from "../helpers/db";
import { getServerUserSession } from "../helpers/getServerUserSession";
import { NotAuthenticatedError } from "../helpers/getSetServerSession";
import { ZodError } from "zod";

const json = (body: unknown, status = 200) => new Response(superjson.stringify(body), {
  status, headers: { "Content-Type": "application/json" },
});

const questionBank = (role: string) => [
  `Tell me about yourself and why you are interested in ${role}.`,
  `Describe a project that demonstrates your skills for ${role}.`,
  `What technical skill are you currently improving for ${role}?`,
  "Describe a difficult problem you solved and how you approached it.",
  "How would you handle a disagreement with a teammate?",
];

const fallbackEvaluation = (questions: string[], answers: string[]) => questions.map((_, i) => {
  const answer = String(answers[i] || "").trim();
  const hasStructure = /\b(situation|task|action|result|because|therefore)\b/i.test(answer);
  const hasEvidence = /\d+|%|users|customers|reduced|improved|built|deployed/i.test(answer);
  const score = Math.min(75, Math.max(20, 25 + Math.min(answer.length, 300) / 10 + (hasStructure ? 8 : 0) + (hasEvidence ? 8 : 0)));
  return {
    questionIndex: i,
    score: Math.round(score),
    feedback: answer.length < 80
      ? "Add context, explain the action you personally took, and finish with the result."
      : hasEvidence
        ? "Your answer includes useful evidence. Make your personal contribution and the outcome even more explicit."
        : "Good starting detail. Add a specific example and a measurable or observable result.",
  };
});

async function evaluateWithAI(role: string, questions: string[], answers: string[]) {
  const key = (process.env as Record<string, string | undefined>).OPENAI_API_KEY;
  if (!key) return null;
  const model = (process.env as Record<string, string | undefined>).OPENAI_MODEL || "gpt-4.1-mini";
  const prompt = `Evaluate this mock interview for the target role: ${role}. Assess each answer fairly for relevance, structure, technical or behavioral depth, ownership, clarity and evidence. Do not reward length alone. Return ONLY valid JSON with this shape: {"feedback":[{"questionIndex":0,"score":0,"feedback":"specific, actionable feedback"}],"overallScore":0}. Scores must be integers from 0 to 100. Include one feedback item for each question in the same order. Do not invent details that the candidate did not state.\n\n${questions.map((q, i) => `Question ${i + 1}: ${q}\nAnswer: ${answers[i] || "[No answer]"}`).join("\n\n")}`;
  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model, input: prompt, max_output_tokens: 1200 }),
    });
    if (!response.ok) return null;
    const payload: any = await response.json();
    const raw = payload?.output_text || payload?.output?.flatMap((item: any) => item?.content || []).find((item: any) => item?.text)?.text;
    if (typeof raw !== "string") return null;
    const parsed = JSON.parse(raw.replace(/^```(?:json)?\s*|\s*```$/g, ""));
    if (!Array.isArray(parsed.feedback) || parsed.feedback.length !== questions.length) return null;
    const feedback = parsed.feedback.map((item: any, index: number) => ({
      questionIndex: index,
      score: Math.max(0, Math.min(100, Math.round(Number(item.score) || 0))),
      feedback: String(item.feedback || "Review this answer and add a specific example.").slice(0, 700),
    }));
    const overallScore = Math.max(0, Math.min(100, Math.round(Number(parsed.overallScore) || feedback.reduce((sum: number, item: any) => sum + item.score, 0) / feedback.length)));
    return { feedback, overallScore };
  } catch {
    return null;
  }
}

export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);
    const body = schema.parse(superjson.parse(await request.text()));

    if (body.action === "start") {
      const profile = await db.selectFrom("studentProfiles").selectAll().where("userId", "=", String(user.id)).executeTakeFirst();
      const role = body.targetRole?.trim() || profile?.preferredRole || profile?.careerGoal || "Software Developer";
      const questions = questionBank(role);
      const interview = await db.insertInto("mockInterviews").values({
        userId: String(user.id), targetRole: role, status: "active", questions, answers: [], feedback: [], overallScore: 0,
      }).returningAll().executeTakeFirstOrThrow();
      return json({ interview, nextQuestion: questions[0] });
    }

    const interview = await db.selectFrom("mockInterviews").selectAll()
      .where("id", "=", String(body.interviewId || "")).where("userId", "=", String(user.id)).executeTakeFirst();
    if (!interview) throw new Error("Interview not found");
    if (interview.status !== "active") return json({ error: "This interview is already completed." }, 409);
    const questions = Array.isArray(interview.questions) ? interview.questions as string[] : [];
    const answers = Array.isArray(interview.answers) ? [...interview.answers] as string[] : [];

    if (body.action === "answer") {
      const index = body.questionIndex ?? answers.length;
      if (index !== answers.length || index >= questions.length) return json({ error: "Please answer the current interview question." }, 400);
      answers[index] = body.answer?.trim() || "";
      const updated = await db.updateTable("mockInterviews").set({ answers, updatedAt: new Date() })
        .where("id", "=", String(interview.id)).where("userId", "=", String(user.id)).returningAll().executeTakeFirstOrThrow();
      return json({ interview: updated, nextQuestion: questions[answers.length] });
    }

    if (answers.length !== questions.length || answers.some((answer) => !String(answer || "").trim())) {
      return json({ error: "Complete all interview questions before finishing." }, 400);
    }
    const aiEvaluation = await evaluateWithAI(String(interview.targetRole || "Software Developer"), questions, answers);
    const evaluation = aiEvaluation || (() => {
      const feedback = fallbackEvaluation(questions, answers);
      return { feedback, overallScore: Math.round(feedback.reduce((sum, item) => sum + item.score, 0) / Math.max(feedback.length, 1)) };
    })();
    const updated = await db.updateTable("mockInterviews").set({
      answers, feedback: evaluation.feedback, overallScore: evaluation.overallScore, status: "completed", updatedAt: new Date(),
    }).where("id", "=", String(interview.id)).where("userId", "=", String(user.id)).returningAll().executeTakeFirstOrThrow();
    return json({ interview: updated, feedback: evaluation.feedback, evaluationMode: aiEvaluation ? "ai" : "basic" });
  } catch (error) {
    const status = error instanceof NotAuthenticatedError ? 401
      : error instanceof ZodError ? 400
        : error instanceof Error && error.message === "Interview not found" ? 404 : 500;
    const message = status === 401 ? "Not authenticated" : status === 400 ? "Please check your interview details and try again"
      : status === 404 ? "Interview not found" : "Mock interview service is temporarily unavailable";
    return json({ error: message }, status);
  }
}
