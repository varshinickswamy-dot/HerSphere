import {
  setServerSession,
  NotAuthenticatedError,
} from "../../helpers/getSetServerSession";
import { User } from "../../helpers/User";
import { getServerUserSession } from "../../helpers/getServerUserSession";
import superjson from "superjson";

export async function handle(request: Request) {