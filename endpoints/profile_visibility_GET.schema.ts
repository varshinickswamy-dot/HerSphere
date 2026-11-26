import superjson from "superjson";
export type OutputType = { isPublic: boolean };
export const getProfileVisibility = async (): Promise<OutputType> => {
  const response = await fetch("/_api/profile_visibility", { credentials: "include" });
  if (!response.ok) throw new Error("Could not load profile visibility.");
  return superjson.parse<OutputType>(await response.text());
};