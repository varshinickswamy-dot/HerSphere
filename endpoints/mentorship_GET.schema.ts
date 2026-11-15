import superjson from "superjson";
export type OutputType = { mentors: unknown[] };
export const getMentorship = async (init?: RequestInit): Promise<OutputType> => {
  const response = await fetch("/_api/mentorship", { ...init, credentials: init?.credentials ?? "include", headers: { ...(init?.headers ?? {}) } });
  if (!response.ok) { const body = superjson.parse<{ error?: string }>(await response.text()); throw new Error(body.error || "Unable to load mentor profiles"); }
  return superjson.parse<OutputType>(await response.text());
};

