import superjson from "superjson";
export type Company={id:string;companyName:string;industry:string|null;location:string|null;description:string|null;website:string|null;logoUrl:string|null;followerCount:number;jobCount:number};
export type OutputType={companies:Company[]};
export async function getCompanies(q="",init?:RequestInit):Promise<OutputType>{const r=await fetch("/_api/companies?q="+encodeURIComponent(q),{...init,credentials:"include"});if(!r.ok)throw new Error((await r.text())||"Could not load companies");return superjson.parse<OutputType>(await r.text())}