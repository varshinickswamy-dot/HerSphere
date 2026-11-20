import superjson from "superjson";
export type OutputType = { messages: any[]; unreadCount: number };
export async function getMessages(conversationWith?: string, init?: RequestInit): Promise<OutputType> {
  const query = conversationWith ? "?with=" + encodeURIComponent(conversationWith) : "";
  const r = await fetch("/_api/messages" + query, { ...init, credentials: "include" });
  if (!r.ok) throw new Error((await r.text()) || "Could not load messages");
  return superjson.parse<OutputType>(await r.text());
}