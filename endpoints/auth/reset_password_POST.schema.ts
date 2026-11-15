import { z } from "zod";
import superjson from "superjson";

export const schema = z.object({
  email: z.string().trim().email().max(254),
  code: z.string().regex(/^\d{6}$/),
  password: z.string().min(8).max(128).regex(/[A-Z]/).regex(/[a-z]/).regex(/[0-9]/),
});
export type OutputType = { message: string };

export const postResetPassword = async (body: z.infer<typeof schema>, init?: RequestInit): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  const result = await fetch("/_api/auth/reset_password", {
    method: "POST", body: superjson.stringify(validatedInput), ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    credentials: "include",
  });
  const data = superjson.parse<OutputType>(await result.text());
  if (!result.ok) throw new Error(data.message || "Unable to reset your password.");
  return data;
};
