import { z } from "zod";
import { User } from "../../helpers/User";
import superjson from "superjson";

export const schema = z.object({
  email: z.string().trim().max(254, "Email is too long").email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters").max(128, "Password is too long").regex(/[A-Z]/, "Password must include an uppercase letter").regex(/[a-z]/, "Password must include a lowercase letter").regex(/[0-9]/, "Password must include a number"),
  displayName: z.string().trim().min(1, "Name is required").max(100, "Name must be 100 characters or fewer"),
  accountType: z.enum(["personal","company"]).default("personal"),
  companyName: z.string().max(160).optional(),
  industry: z.string().max(100).optional(),
  website: z.string().max(2048).optional(),
  companyLocation: z.string().max(160).optional(),
  companyDescription: z.string().max(2000).optional(),
});

export type OutputType = {
  user: User;
};

export const postRegister = async (
  body: z.infer<typeof schema>,
  init?: RequestInit
): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  const result = await fetch(`/_api/auth/register_with_password`, {
    method: "POST",
    body: superjson.stringify(validatedInput),
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    credentials: "include", // Important for cookies to be sent and received
  });

  if (!result.ok) {
    const errorData = superjson.parse<{ message: string }>(await result.text());
    throw new Error(errorData.message || "Registration failed");
  }

  return superjson.parse<OutputType>(await result.text());
};