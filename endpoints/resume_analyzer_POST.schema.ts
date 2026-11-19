import superjson from "superjson";
export type OutputType = { resume: unknown; checks: Array<{ label: string; ok: boolean }>; feedback: unknown[] };
export const postResumeAnalyzer = async (body?: { jobDescription?: string }, init?: RequestInit): Promise<OutputType> => {
  const response = await fetch("/_api/resume-analyzer", { method: "POST", body: JSON.stringify(body || {}), ...init, credentials: init?.credentials ?? "include", headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) } });
  if (!response.ok) { const body = superjson.parse<{ error?: string }>(await response.text()); throw new Error(body.error || "Resume analysis is temporarily unavailable"); }
  return superjson.parse<OutputType>(await response.text());
};

