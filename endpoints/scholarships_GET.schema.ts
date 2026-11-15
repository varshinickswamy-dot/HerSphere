import superjson from "superjson";
export type OutputType = { scholarships: unknown[] };
export const getScholarships = async (init?: RequestInit): Promise<OutputType> => {
  const response = await fetch("/_api/scholarships", { ...init, credentials: init?.credentials ?? "include", headers: { ...(init?.headers ?? {}) } });
  if (!response.ok) { const body = superjson.parse<{ error?: string }>(await response.text()); throw new Error(body.error || "Unable to load scholarships"); }
  return superjson.parse<OutputType>(await response.text());
};
    8