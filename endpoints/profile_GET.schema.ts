import superjson from "superjson";
export type OutputType = { profile: any | null };
export const getProfile = async (init?: RequestInit): Promise<OutputType> => {
  const result = await fetch("/_api/profile", { ...init, credentials: "include" });
  if (!result.ok) throw new Error((await result.text()) || "Unable to load profile");
  return superjson.parse<OutputType>(await result.text());
};