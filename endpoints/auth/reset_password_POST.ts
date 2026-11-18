import { db } from "../../helpers/db";
import { timingSafeEqual } from "crypto";
import { hashOtpCode } from "../../helpers/otpSecurity";
import superjson from "superjson";
import { z, ZodError } from "zod";
import { generatePasswordHash } from "../../helpers/generatePasswordHash";

const inputSchema = z.object({
  email: z.string().trim().email().max(254),
  code: z.string().regex(/^\d{6}$/),
  password: z.string().min(8).max(128).regex(/[A-Z]/).regex(/[a-z]/).regex(/[0-9]/),
});
const json = (body: unknown, status = 200) => new Response(superjson.stringify(body), { status, headers: { "Content-Type": "application/json" } });

export async function handle(request: Request) {
  try {
    const { email, code, password } = inputSchema.parse(superjson.parse(await request.text()));
    const normalizedEmail = email.toLowerCase();
    const row = await db.selectFrom("emailVerificationOtps").selectAll()
      .where("email", "=", normalizedEmail).where("purpose", "=", "password_reset").executeTakeFirst();
    if (!row) return json({ message: "No active reset code found. Request a new code." }, 404);
    if (new Date(row.expiresAt).getTime() <= Date.now()) return json({ message: "This reset code has expired. Request a new one." }, 410);
    if (row.attempts >= 5) return json({ message: "Too many incorrect attempts. Request a new code." }, 429);

    const expected = Buffer.from(row.codeHash, "hex");
    const actual = Buffer.from(hashOtpCode(normalizedEmail, code), "hex");
    const matches = expected.length === actual.length && timingSafeEqual(expected, actual);
    if (!matches) {
      await db.updateTable("emailVerificationOtps").set({ attempts: row.attempts + 1 }).where("id", "=", row.id).execute();
      return json({ message: "Incorrect reset code." }, 400);
    }

    const user = await db.selectFrom("users").select("id").where("email", "=", normalizedEmail).executeTakeFirst();
    if (!user) return json({ message: "Unable to reset this account. Request a new code." }, 400);
    const passwordHash = await generatePasswordHash(password);
    await db.transaction().execute(async (trx) => {
      await trx.updateTable("userPasswords").set({ passwordHash }).where("userId", "=", user.id).execute();
      // Revoke all existing sessions after a password reset.
      await trx.deleteFrom("sessions").where("userId", "=", user.id).execute();
      await trx.deleteFrom("emailVerificationOtps").where("id", "=", row.id).execute();
    });
    return json({ message: "Password updated successfully. Please sign in with your new password." });
  } catch (error) {
    const invalid = error instanceof ZodError || error instanceof SyntaxError;
    return json({ message: invalid ? "Enter a valid email, 6-digit code and strong password." : "Unable to reset your password right now." }, invalid ? 400 : 500);
  }
}
