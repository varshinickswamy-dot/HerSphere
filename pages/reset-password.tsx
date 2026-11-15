import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useState } from "react";
import { postResetPassword } from "../endpoints/auth/reset_password_POST.schema";
import styles from "./auth.module.css";

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const [email, setEmail] = useState(params.get("email") || "");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }
    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password) || password.length < 8) {
      setError("Use at least 8 characters with uppercase, lowercase and a number.");
      return;
    }
    setBusy(true);
    try {
      await postResetPassword({ email, code, password });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to reset your password.");
    } finally {
      setBusy(false);
    }
  };

  return <main className={styles.page}>
    <div className={styles.brand}><Link to="/" className={styles.logo}><span>H</span> HerSphere</Link><p>Your Career. Your Future. Your Sphere.</p></div>
    <section className={styles.card}>
      <div className={styles.kicker}>SECURE PASSWORD RESET</div>
      <h1>Create a <em>new password.</em></h1>
      <p className={styles.sub}>Enter the reset code sent to your email and choose a new password.</p>
      {!success ? <form className={styles.companyForm} onSubmit={submit}>
        <input required type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Account email" />
        <input required inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={e => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="6-digit reset code" />
        <input required type="password" autoComplete="new-password" minLength={8} value={password} onChange={e => setPassword(e.target.value)} placeholder="New password" />
        <input required type="password" autoComplete="new-password" minLength={8} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm new password" />
        {error && <small className={styles.formError}>{error}</small>}
        <button disabled={busy || code.length !== 6} type="submit">{busy ? "Updating password..." : "Update password"}</button>
      </form> : <div className={styles.companyNote}>Your password has been updated. All existing sessions have been signed out. Please sign in with your new password.</div>}
      {success ? <button className={styles.switchRole} type="button" onClick={() => navigate("/login",{replace:true})}>Continue to sign in →</button> : <div className={styles.footer}><Link to="/forgot-password">Request another reset code</Link></div>}
    </section>
  </main>;
}
