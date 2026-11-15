import superjson from "superjson";
export type OutputType = { resources: unknown[] };
export const getLearning = async (init?: RequestInit): Promise<OutputType> => {
  const response = await fetch("/_api/learning", { ...init, credentials: init?.credentials ?? "include", headers: { ...(init?.headers ?? {}) } });
  if (!response.ok) { const body = superjson.parse<{ error?: string }>(await response.text()); throw new Error(body.error || "Unable to load learning resources"); }
  return superjson.parse<OutputType>(await response.text());
};

