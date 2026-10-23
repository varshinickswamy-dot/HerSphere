import superjson from "superjson";
import {schema} from "./job_alerts_POST.schema";
import {db} from "../helpers/db";
import {getServerUserSession} from "../helpers/getServerUserSession";

export async function handle(request:Request){
  try{
    const {user}=await getServerUserSession(request);
    const b=schema.parse(superjson.parse(await request.text()));
    const uid=String(user.id);
    if(b.action==="delete"){
      if(!b.id) throw new Error("Alert id required");
      await db.deleteFrom("jobAlerts").where("id","=",b.id).where("userId","=",uid).execute();
      return new Response(superjson.stringify({ok:true}),{headers:{"Content-Type":"application/json"}});
    }
    if(b.action==="toggle"||b.action==="update"){
      if(!b.id) throw new Error("Alert id required");
      const current=await db.selectFrom("jobAlerts").selectAll().where("id","=",b.id).where("userId","=",uid).executeTakeFirstOrThrow();
      const values:any={updatedAt:new Date()};
      if(b.action==="toggle") values.isActive=!current.isActive;
      else {
        if(b.name!==undefined) values.name=b.name;
        if(b.keywords!==undefined) values.keywords=b.keywords||null;
        if(b.location!==undefined) values.location=b.location||null;
        if(b.workMode!==undefined) values.workMode=b.workMode||null;
        if(b.experience!==undefined) values.experience=b.experience||null;
        if(b.employmentType!==undefined) values.employmentType=b.employmentType||null;
        if(b.salaryMin!==undefined) values.salaryMin=b.salaryMin?Number(b.salaryMin):null;
        if(b.frequency!==undefined) values.frequency=b.frequency||"daily";
        if(b.isActive!==undefined) values.isActive=b.isActive;
      }
      const alert=await db.updateTable("jobAlerts").set(values).where("id","=",b.id).where("userId","=",uid).returningAll().executeTakeFirstOrThrow();
      return new Response(superjson.stringify({alert,ok:true}),{headers:{"Content-Type":"application/json"}});
    }
    if(!b.name?.trim()) throw new Error("Alert name is required");
    const alert=await db.insertInto("jobAlerts").values({
      userId:uid,name:b.name.trim(),keywords:b.keywords||null,location:b.location||null,
      workMode:b.workMode||null,experience:b.experience||null,employmentType:b.employmentType||null,
      salaryMin:b.salaryMin?Number(b.salaryMin):null,frequency:b.frequency||"daily",isActive:true,
      lastNotifiedAt:null,createdAt:new Date(),updatedAt:new Date()
    }).returningAll().executeTakeFirstOrThrow();
    return new Response(superjson.stringify({alert,ok:true}),{headers:{"Content-Type":"application/json"}});
  }catch{return new Response(superjson.stringify({error:"Could not update job alert"}),{status:400,headers:{"Content-Type":"application/json"}})}
}