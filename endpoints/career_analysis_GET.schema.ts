import superjson from "superjson";
export type OutputType={assessment:any|null;roadmap:any|null};
export const getCareerAnalysis=async(init?:RequestInit):Promise<OutputType>=>{
 const r=await fetch("/_api/career_analysis",{...init,credentials:"include"});
 if(!r.ok) throw new Error("Unable to load career analysis");
 return superjson.parse<OutputType>(await r.text());
};