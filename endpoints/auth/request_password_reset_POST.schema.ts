import { z } from "zod";
import superjson from "superjson";

export const schema = z.object({ email: z.string().trim().email().max(254) });
export type OutputType = { message: string; expiresInSeconds?: number };

export const postRequestPasswordReset = async (body: z.infer<typeof schema>, init?: RequestInit): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  const result = await fetch("/_api/auth/request_password_reset", {
    method: "POST", body: superjson.stringify(validatedInput), ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    credentials: "include",
  });
  const data = superjson.parse<OutputType>(await result.text());
  if (!result.ok) throw new Error(data.message || "Unable to request a password reset.");
  return data;
};
