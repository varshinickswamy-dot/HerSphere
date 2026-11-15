import superjson from "superjson";
export type OutputType={posts:any[];mentors:any[];requests:any[]};
export const getCommunity=async(init?:RequestInit):Promise<OutputType>=>{const r=await fetch("/_api/community",{...init,credentials:"include"});if(!r.ok)throw new Error("Could not load community");return superjson.parse<OutputType>(await r.text())};