import superjson from "superjson";
export const updateProfileVisibility = async (isPublic: boolean): Promise<void> => {
  const response = await fetch("/_api/profile_visibility", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: superjson.stringify({ isPublic }) });
  if (!response.ok) throw new Error("Could not save profile visibility.");
};