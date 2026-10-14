import superjson from "superjson";
export type OutputType={resume:any|null};
export const getResume=async(init?:RequestInit):Promise<OutputType>=>{const r=await fetch("/_api/resume",{...init,credentials:"include"});if(!r.ok)throw new Error("Unable to load resume");return superjson.parse<OutputType>(await r.text())};