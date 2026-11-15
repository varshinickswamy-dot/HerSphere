import { z } from "zod";
import superjson from "superjson";

const inputSchema = z.object({ email: z.string().trim().email().max(254), code: z.string().regex(/^\d{6}$/, "Enter the 6-digit code") });
export type Input = z.infer<typeof inputSchema>;
export type Output = { verified: true; message: string };

export async function postVerifyRegistrationOtp(body: Input): Promise<Output> {
  const response = await fetch("/_api/auth/verify_registration_otp", {
    method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: superjson.stringify(inputSchema.parse(body)),
  });
  const result = superjson.parse<Output & { error?: string }>(await response.text());
  if (!response.ok) throw new Error(result.error || "Unable to verify code");
  return result;
}