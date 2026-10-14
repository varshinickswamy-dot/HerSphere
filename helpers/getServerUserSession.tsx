import { db } from "./db";
import { User } from "./User";

import {
  CleanupProbability,
  getServerSessionOrThrow,
  NotAuthenticatedError,
  SessionExpirationSeconds,
} from "./getSetServerSession";
   10	
   11	export async function getServerUserSession(request: Request) {
   12	  const session = await getServerSessionOrThrow(request);
   13	
   14	  // Occasionally clean up expired sessions
   15	  if (Math.random() < CleanupProbability) {
   16	    const expirationDate = new Date(
   17	      Date.now() - SessionExpirationSeconds * 1000
   18	    );
   19	    try {
   20	      await db
   21	        .deleteFrom("sessions")
   22	        .where("lastAccessed", "<", expirationDate)
   23	        .execute();
   24	    } catch (cleanupError) {
   25	      // Log but don't fail the request if cleanup fails
   26	      console.error("Session cleanup error:", cleanupError);
   27	    }
   28	  }
   29	
   30	  // Query the sessions and users tables in a single join query
   31	  const results = await db
   32	    .selectFrom("sessions")
   33	    .innerJoin("users", "sessions.userId", "users.id")
   34	    .select([
   35	      "sessions.id as sessionId",
   36	      "sessions.createdAt as sessionCreatedAt",
   37	      "sessions.lastAccessed as sessionLastAccessed",
   38	      "users.id",
   39	      "users.email",
   40	      "users.displayName",
   41	      "users.role",
   42	      "users.avatarUrl",
   43	    ])
   44	    .where("sessions.id", "=", session.id)
   45	    .limit(1)
   46	    .execute();
   47	
   48	  if (results.length === 0) {
   49	    throw new NotAuthenticatedError();
   50	  }
   51	
   52	  const result = results[0];
   53	  const user = {
   54	    id: result.id,
   55	    email: result.email,
   56	    displayName: result.displayName,
   57	    avatarUrl: result.avatarUrl,
   58	    role: result.role,
   59	  };
   60	
   61	  // Update the session's lastAccessed timestamp
   62	  const now = new Date();
   63	  await db
   64	    .updateTable("sessions")
   65	    .set({ lastAccessed: now })
   66	    .where("id", "=", session.id)
   67	    .execute();
   68	
   69	  return {
   70	    user: user satisfies User,
   71	    // make sure to update the session in cookie
   72	    session: {
   73	      ...session,
   74	      lastAccessed: now,
   75	    },
   76	  };
   77	}
   78