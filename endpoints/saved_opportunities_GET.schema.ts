import superjson from "superjson";
export type OutputType={opportunities:any[]};
export async function getSavedOpportunities(init?:RequestInit):Promise<OutputType>{const r=await fetch("/_api/saved_opportunities",{...init,credentials:"include"});if(!r.ok)throw new Error((await r.text())||"Could not load saved opportunities");return superjson.parse<OutputType>(await r.text())}