import { z } from "zod";
import superjson from "superjson";
import { db } from "../helpers/db";
import { getServerUserSession } from "../helpers/getServerUserSession";
import { NotAuthenticatedError } from "../helpers/getSetServerSession";
import { schema } from "./profile_POST.schema";
export async function handle(request:Request){
  try{
    const {user}=await getServerUserSession(request);