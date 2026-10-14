import superjson from "superjson";
import {schema} from "./job_alerts_POST.schema";
import {db} from "../helpers/db";
import {getServerUserSession} from "../helpers/getServerUserSession";

export async function handle(request:Request){
  try{
    const {user}=await getServerUserSession(request);
    const b=schema.parse(superjson.parse(await request.text()));