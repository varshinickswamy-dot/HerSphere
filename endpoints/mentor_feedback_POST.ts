import superjson from "superjson";
import {schema} from "./mentor_feedback_POST.schema";
import {db} from "../helpers/db";
import {getServerUserSession} from "../helpers/getServerUserSession";
import {NotAuthenticatedError} from "../helpers/getSetServerSession";
import {ZodError} from "zod";
export async function handle(request:Request){
 try{
  const {user}=await getServerUserSession(request);