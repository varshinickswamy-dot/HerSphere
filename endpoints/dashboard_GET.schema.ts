import superjson from "superjson";
export type OutputType={user:any;profile:any;stats:any;resumes:any[];interviews:any[];assessment:any;recentApplications:any[]};
export async function getDashboard(init?:RequestInit):Promise<OutputType>{const r=await fetch("/_api/dashboard",{...init,credentials:"include"});if(!r.ok)throw new Error("Could not load dashboard");return superjson.parse<OutputType>(await r.text());}
