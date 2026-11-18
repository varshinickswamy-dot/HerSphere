import { db } from "../../helpers/db";
import { randomInt } from "crypto";
import { hashOtpCode } from "../../helpers/otpSecurity";
import superjson from "superjson";
import { z, ZodError } from "zod";

const inputSchema = z.object({ email: z.string().trim().email().max(254) });
const json = (body: unknown, status = 200) => new Response(superjson.stringify(body), { status, headers: { "Content-Type": "application/json" } });
const genericMessage = "If an account exists for that email, a password reset code has been sent.";

export async function handle(request: Request) {
  try {
    const { email } = inputSchema.parse(superjson.parse(await request.text()));
    const normalizedEmail = email.toLowerCase();
    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) return json({ message: "Password reset email is temporarily unavailable. Please try again later." }, 503);

    const user = await db.selectFrom("users").select("id").where("email", "=", normalizedEmail).executeTakeFirst();
    // Do not reveal whether an email address has an account.
    if (!user) return json({ message: genericMessage });

    const previous = await db.selectFrom("emailVerificationOtps").selectAll()
      .where("email", "=", normalizedEmail).where("purpose", "=", "password_reset").executeTakeFirst();
    const now = new Date();
    if (previous && now.getTime() - new Date(previous.lastSentAt).getTime() < 60_000) {
      return json({ message: "Please wait 60 seconds before requesting another code." }, 429);
    }

    const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
    const expiresAt = new Date(now.getTime() + 5 * 60_000);
    const codeHash = hashOtpCode(normalizedEmail, code);
    await db.insertInto("emailVerificationOtps").values({
      email: normalizedEmail, purpose: "password_reset", codeHash, expiresAt,
      attempts: 0, lastSentAt: now, verifiedAt: null,
    }).onConflict((oc) => oc.columns(["email", "purpose"]).doUpdateSet({
      codeHash, expiresAt, attempts: 0, lastSentAt: now, verifiedAt: null,
    })).execute();

    const mail = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "api-key": apiKey, "Content-Type": "application/json", accept: "application/json" },
      body: JSON.stringify({
        sender: { name: "HerSphere", email: "varshinimc642@gmail.com" },
        to: [{ email: normalizedEmail }],
        subject: "Reset your HerSphere password",
        textContent: `Your HerSphere password reset code is ${code}. It expires in 5 minutes. If you did not request this, ignore this email.`,
        htmlContent: `<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:28px;color:#172033"><h2>Reset your HerSphere password</h2><p>Use this code to reset your password:</p><div style="font-size:32px;font-weight:700;letter-spacing:8px;padding:18px;background:#f2f0ff;border-radius:12px;text-align:center">${code}</div><p>This code expires in 5 minutes. Do not share it with anyone.</p></div>`,
      }),
    });
    if (!mail.ok) {
      await db.deleteFrom("emailVerificationOtps").where("email", "=", normalizedEmail).where("purpose", "=", "password_reset").execute();
      return json({ message: "Password reset email could not be sent. Check the email sender configuration and try again." }, 502);
    }
    return json({ message: genericMessage, expiresInSeconds: 300 });
  } catch (error) {
    const invalid = error instanceof ZodError || error instanceof SyntaxError;
    return json({ message: invalid ? "Enter a valid email address." : "Unable to request a password reset right now." }, invalid ? 400 : 500);
  }
}
