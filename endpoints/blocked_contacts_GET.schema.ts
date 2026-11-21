import superjson from "superjson";
export type BlockedContact = { id: string; displayName: string; role: string; createdAt: string | Date };
export type OutputType = { contacts: BlockedContact[] };
export async function getBlockedContacts(init?: RequestInit): Promise<OutputType> {
  const r = await fetch("/_api/blocked_contacts", { ...init, credentials: "include" });
  if (!r.ok) throw new Error((await r.text()) || "Could not load blocked contacts");
  return superjson.parse<OutputType>(await r.text());
}