import superjson from "superjson";
export type OutputType = { internships: unknown[] };
export const getInternships = async (init?: RequestInit): Promise<OutputType> => {
 const response = await fetch("/_api/internships", { ...init, headers: { ...(init?.headers ?? {}) } });
 if (!response.ok) throw new Error("Unable to load internships");
 return superjson.parse<OutputType>(await response.text());
};