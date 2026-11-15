import { z } from "zod";
import superjson from "superjson";

const inputSchema = z.object({ email: z.string().trim().email().max(254) });
export type Input = z.infer<typeof inputSchema>;
export type Output = { message: string; expiresInSeconds: number };

export async function postSendRegistrationOtp(body: Input): Promise<Output> {
  const input = inputSchema.parse(body);
  const response = await fetch("/_api/auth/send_registration_otp", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: superjson.stringify(input),
  });
  const result = superjson.parse<Output & { error?: string }>(await response.text());
  if (!response.ok) throw new Error(result.error || "Unable to send verification code");
  return result;
}
