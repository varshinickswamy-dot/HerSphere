import { z } from "zod";
import superjson from "superjson";

// No input required for logout
export const schema = z.object({});

export type OutputType =
  | {
      success: boolean;