import superjson from "superjson";
export type OutputType = { messages: any[]; unreadCount: number; hasMore: boolean; nextOffset: number };
export async function getMessages(conversationWith?: string, offset = 0, init?: RequestInit): Promise<OutputType> {
  const params = new URLSearchParams();
  if (conversationWith) params.set("with", conversationWith);
  if (offset > 0) params.set("offset", String(offset));
  const query = params.size ? "?" + params.toString() : "";
  const r = await fetch("/_api/messages" + query, { ...init, credentials: "include" });
  if (!r.ok) throw new Error((await r.text()) || "Could not load messages");
  return superjson.parse<OutputType>(await r.text());
}