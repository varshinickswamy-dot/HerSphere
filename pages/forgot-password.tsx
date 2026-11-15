import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { postRequestPasswordReset } from "../endpoints/auth/request_password_reset_POST.schema";
import styles from "./auth.module.css";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await postRequestPasswordReset({ email });
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to request a reset code.");
    } finally {
      setBusy(false);
    }
  };

  return <main className={styles.page}>
    <div className={styles.brand}><Link to="/" className={styles.logo}><span>H</span> HerSphere</Link><p>Your Career. Your Future. Your Sphere.</p></div>
    <section className={styles.card}>
      <div className={styles.kicker}>ACCOUNT RECOVERY</div>
      <h1>Reset your <em>password.</em></h1>
      <p className={styles.sub}>Enter the email address associated with your HerSphere account. We will send a short-lived reset code if an account exists.</p>
      {!sent ? <form className={styles.companyForm} onSubmit={submit}>
        <input required type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Your account email" />
        {error && <small className={styles.formError}>{error}</small>}
        <button disabled={busy} type="submit">{busy ? "Sending reset code..." : "Send reset code"}</button>
      </form> : <div className={styles.companyNote}>If an account exists for {email}, a reset code has been sent. Check your inbox and spam folder. The code expires in 5 minutes.</div>}
      {sent && <button className={styles.switchRole} type="button" onClick={() => navigate(`/reset-password?email=${encodeURIComponent(email)}`)}>Continue to reset password →</button>}
      <div className={styles.footer}><Link to="/login">Back to sign in</Link></div>
    </section>
  </main>;
}
