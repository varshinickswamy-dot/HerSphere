import superjson from "superjson";
export type OutputType={stats:any;users:any[];jobs:any[];applications:any[];audit:any[]};
export const getAdmin=async(init?:RequestInit):Promise<OutputType>=>{const r=await fetch("/_api/admin",{...init,credentials:"include"});if(!r.ok)throw new Error("Admin access denied");return superjson.parse<OutputType>(await r.text())};