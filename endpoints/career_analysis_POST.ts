import superjson from "superjson";
import {schema} from "./career_analysis_POST.schema";
import {db} from "../helpers/db";
import {getServerUserSession} from "../helpers/getServerUserSession";
const normalize=(x:string)=>x.toLowerCase().replace(/[^a-z0-9+#.]/g,"");
const roleMap:Record<string,string[]>={
 "full stack developer":["java","javascript","react","node.js","sql","git","html","css"],
 "software developer":["java","python","javascript","sql","git","data structures","algorithms"],
 "data analyst":["python","sql","excel","statistics","power bi","tableau"],