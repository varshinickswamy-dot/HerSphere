import { z } from "zod";
import { User } from "../../helpers/User";
import superjson from "superjson";

export const schema = z.object({
  email: z.string().trim().max(254, "Email is too long").email("Enter a valid email"),
  password: z.string().min(1, "Password is required").max(128, "Password is too long"),
});
