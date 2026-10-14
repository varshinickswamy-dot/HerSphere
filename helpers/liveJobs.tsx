type LiveJob={
 id:string;title:string;companyName:string|null;description:string;location:string|null;workMode:string;
 employmentType:string;salaryRange:string|null;skills:string[];createdAt:string|null;expiresAt:string|null;
 applicationUrl:string;website:string|null;source:"Adzuna"|"Jooble"|"JSearch"|"Himalayas"|"RemoteJobs.org"|"Arbeitnow";
 sourceUrl:string;lastUpdatedAt:string;
};
const cache:{at:number;jobs:LiveJob[]}={at:0,jobs:[]};
const clean=(v:unknown)=>String(v??"").replace(/<[^>]*>/g," ").replace(/\s+/g," ").trim();
const dateValue=(v:unknown):string|null=>{