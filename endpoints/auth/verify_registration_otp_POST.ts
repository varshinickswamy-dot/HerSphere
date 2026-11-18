import { db } from "../../helpers/db";
import { timingSafeEqual } from "crypto";
import { hashOtpCode } from "../../helpers/otpSecurity";
import superjson from "superjson";
import { z, ZodError } from "zod";

const inputSchema = z.object({ email: z.string().trim().email().max(254), code: z.string().regex(/^\d{6}$/) });
const json = (body: unknown, status = 200) => new Response(superjson.stringify(body), { status, headers: { "Content-Type": "application/json" } });

export async function handle(request: Request) {
  try {
    const { email, code } = inputSchema.parse(superjson.parse(await request.text()));
    const normalizedEmail = email.toLowerCase();
    const row = await db.selectFrom("emailVerificationOtps").selectAll().where("email", "=", normalizedEmail).where("purpose", "=", "registration").executeTakeFirst();
    if (!row) return json({ error: "No active code found. Request a new code." }, 404);
    if (row.verifiedAt) return json({ verified: true, message: "Email already verified." });
    if (new Date(row.expiresAt).getTime() <= Date.now()) return json({ error: "This code has expired. Request a new one." }, 410);
    if (row.attempts >= 5) return json({ error: "Too many incorrect attempts. Request a new code." }, 429);
    const expected = Buffer.from(row.codeHash, "hex");
    const actual = Buffer.from(hashOtpCode(normalizedEmail, code), "hex");
    const matches = expected.length === actual.length && timingSafeEqual(expected, actual);
    if (!matches) {
      await db.updateTable("emailVerificationOtps").set({ attempts: row.attempts + 1 }).where("id", "=", row.id).execute();
      return json({ error: "Incorrect verification code." }, 400);
    }
    await db.updateTable("emailVerificationOtps").set({ verifiedAt: new Date() }).where("id", "=", row.id).execute();
    return json({ verified: true, message: "Email verified successfully." });
  } catch (error) {
    const invalid = error instanceof ZodError || error instanceof SyntaxError;
    return json({ error: invalid ? "Enter a valid email and 6-digit code." : "Unable to verify code right now." }, invalid ? 400 : 500);
  }
}
