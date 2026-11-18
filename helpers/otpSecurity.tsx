import { createHmac } from "crypto";

/** Hash one-time codes with the same high-entropy server secret used for sessions. */
export function hashOtpCode(email: string, code: string): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || Buffer.byteLength(secret, "utf8") < 32) {
    throw new Error("JWT_SECRET must be configured with at least 32 bytes before OTP authentication can be used.");
  }
  return createHmac("sha256", secret)
    .update(`${email.trim().toLowerCase()}:${code}`)
    .digest("hex");
}
