import superjson from "superjson";
import {schema} from "./mentor_POST.schema";
import {db} from "../helpers/db";
import {sql} from "kysely";
import {getServerUserSession} from "../helpers/getServerUserSession";import {getLiveJobs} from "../helpers/liveJobs";
import {NotAuthenticatedError} from "../helpers/getSetServerSession";
import {ZodError} from "zod";
export async function handle(request:Request){
 try{