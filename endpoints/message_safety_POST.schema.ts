import superjson from "superjson";
import { z } from "zod";
export const schema = z.object({ action: z.enum(["block", "unblock", "report"]), userId: z.string().regex(/^\d{1,20}$/), messageId: z.string().regex(/^\d{1,20}$/).optional(), reason: z.enum(["Harassment", "Spam", "Scam or fraud", "Inappropriate content", "Other"]).optional(), details: z.string().trim().max(1000).optional() });
export type OutputType = { ok: true; action?: string; alreadyReported?: boolean };
export async function postMessageSafety(body: z.infer<typeof schema>, init?: RequestInit): Promise<OutputType> {
  const r = await fetch("/_api/message_safety", { method: "POST", body: superjson.stringify(schema.parse(body)), ...init, headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) }, credentials: "include" });
  if (!r.ok) throw new Error((await r.text()) || "Could not complete the safety action");
  return superjson.parse<OutputType>(await r.text());
}