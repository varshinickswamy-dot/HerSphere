import { z } from "zod";
import superjson from "superjson";
import { User } from "../../helpers/User";

// no schema, just a simple GET request
export const schema = z.object({});

export type OutputType =
  | {