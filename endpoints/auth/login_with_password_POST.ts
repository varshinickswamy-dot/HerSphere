// adapt this to your database schema
import { db } from "../../helpers/db";
import { sql } from "kysely";
import { schema } from "./login_with_password_POST.schema";
import { compare } from "bcryptjs";
import { randomBytes } from "crypto";
import {
  setServerSession,
  SessionExpirationSeconds,