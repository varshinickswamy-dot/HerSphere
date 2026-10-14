import { z } from "zod";
import { User } from "../../helpers/User";
import superjson from "superjson";

export const schema = z.object({
  email: z.string().trim().max(254, "Email is too long").email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters").max(128, "Password is too long").regex(/[A-Z]/, "Password must include an uppercase letter").regex(/[a-z]/, "Password must include a lowercase letter").regex(/[0-9]/, "Password must include a number"),
  displayName: z.string().trim().min(1, "Name is required").max(100, "Name must be 100 characters or fewer"),
  accountType: z.enum(["personal","company"]).default("personal"),