import { db } from "../../helpers/db";
import { randomInt, createHmac } from "crypto";
import superjson from "superjson";
import { z, ZodError } from "zod";

const inputSchema = z.object({ email: z.string().trim().email().max(254) });
const json = (body: unknown, status = 200) => new Response(superjson.stringify(body), { status, headers: { "Content-Type": "application/json" } });
const hashCode = (email: string, code: string) => createHmac("sha256", process.env.JWT_SECRET || "").update(`${email}:${code}`).digest("hex");

export async function handle(request: Request) {
  try {
    const { email } = inputSchema.parse(superjson.parse(await request.text()));
    const normalizedEmail = email.toLowerCase();
    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) return json({ error: "Email service is not configured. Please try again later." }, 503);
    const existing = await db.selectFrom("users").select("id").where("email", "=", normalizedEmail).executeTakeFirst();
    if (existing) return json({ error: "This email is already registered. Please sign in instead." }, 409);

    const previous = await db.selectFrom("emailVerificationOtps").selectAll().where("email", "=", normalizedEmail).where("purpose", "=", "registration").executeTakeFirst();
    const now = new Date();
    if (previous && now.getTime() - new Date(previous.lastSentAt).getTime() < 60_000) {
      return json({ error: "Please wait 60 seconds before requesting another code." }, 429);
    }

    const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
    const expiresAt = new Date(now.getTime() + 5 * 60_000);
    await db.insertInto("emailVerificationOtps").values({
      email: normalizedEmail,
      purpose: "registration",
      codeHash: hashCode(normalizedEmail, code),
      expiresAt,
      attempts: 0,
      lastSentAt: now,
      verifiedAt: null,
    }).onConflict((oc) => oc.columns(["email", "purpose"]).doUpdateSet({ codeHash: hashCode(normalizedEmail, code), expiresAt, attempts: 0, lastSentAt: now, verifiedAt: null })).execute();

    const mail = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "api-key": apiKey, "Content-Type": "application/json", accept: "application/json" },
      body: JSON.stringify({
        sender: { name: "HerSphere", email: "varshinimc642@gmail.com" },
        to: [{ email: normalizedEmail }],
        subject: "Verify your HerSphere email",
        textContent: `Your HerSphere verification code is ${code}. It expires in 5 minutes. If you did not request this code, ignore this email.`,
        htmlContent: `<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:28px;color:#172033"><h2>Welcome to HerSphere</h2><p>Use this verification code to finish creating your account:</p><div style="font-size:32px;font-weight:700;letter-spacing:8px;padding:18px;background:#f2f0ff;border-radius:12px;text-align:center">${code}</div><p>This code expires in 5 minutes. Do not share it with anyone.</p></div>`,
      }),
    });
    if (!mail.ok) {
      // Do not expose provider details or OTP values to the browser.
      await db.deleteFrom("emailVerificationOtps").where("email", "=", normalizedEmail).where("purpose", "=", "registration").execute();
      return json({ error: "Brevo could not send the verification email. Check your sender configuration and try again." }, 502);
    }
    return json({ message: "Verification code sent. Check your inbox and spam folder.", expiresInSeconds: 300 });
  } catch (error) {
    const invalid = error instanceof ZodError || error instanceof SyntaxError;
    return json({ error: invalid ? "Enter a valid email address." : "Unable to send verification code right now." }, invalid ? 400 : 500);
  }
}
