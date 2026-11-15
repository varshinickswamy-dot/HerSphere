import superjson from "superjson";
export type OutputType={notifications:any[];unread:number};
export const getNotifications=async(init?:RequestInit):Promise<OutputType>=>{const r=await fetch("/_api/notifications",{...init,credentials:"include"});if(!r.ok)throw new Error("Could not load notifications");return superjson.parse<OutputType>(await r.text())};