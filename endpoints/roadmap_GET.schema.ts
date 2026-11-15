import superjson from "superjson";
export type OutputType = { roadmap: unknown | null; gaps: unknown | null };
export const getRoadmap = async (init?: RequestInit): Promise<OutputType> => {
  const response = await fetch("/_api/roadmap", { ...init, credentials: init?.credentials ?? "include", headers: { ...(init?.headers ?? {}) } });
  if (!response.ok) { const body = superjson.parse<{ error?: string }>(await response.text()); throw new Error(body.error || "Unable to load your roadmap"); }
  return superjson.parse<OutputType>(await response.text());
};

