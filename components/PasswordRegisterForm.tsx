import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
  useForm,
} from "./Form";
import { Input } from "./Input";
import { Button } from "./Button";
import { Spinner } from "./Spinner";
import styles from "./PasswordRegisterForm.module.css";
import { useAuth } from "../helpers/useAuth";
import {
  schema,
  postRegister,
} from "../endpoints/auth/register_with_password_POST.schema";
import { postSendRegistrationOtp } from "../endpoints/auth/send_registration_otp_POST.schema";
import { postVerifyRegistrationOtp } from "../endpoints/auth/verify_registration_otp_POST.schema";

export type RegisterFormData = z.infer<typeof schema>;

interface PasswordRegisterFormProps {
  className?: string;
  defaultValues?: Partial<RegisterFormData>;
}

export const PasswordRegisterForm: React.FC<PasswordRegisterFormProps> = ({
  className,
  defaultValues,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const { onLogin } = useAuth();
  const navigate = useNavigate();

  const form = useForm({
    schema,
    defaultValues: defaultValues || {
      email: "",
      password: "",
      displayName: "",
    },
  });

  const handleSubmit = async (data: z.infer<typeof schema>) => {
    setError(null);
    setIsLoading(true);

    try {
      if (!emailVerified) {
        setError("Please verify your email address before creating your account.");
        return;
      }
      const result = await postRegister(data);
      // Avoid writing email addresses or other personal data to browser logs.
      onLogin(result.user);
      navigate("/profile");
    } catch (err) {
      // Keep registration errors out of logs; they may include user-provided details.

      if (err instanceof Error) {
        const errorMessage = err.message;

        if (errorMessage.includes("Email already in use")) {
          setError(
            "This email is already registered. Please try logging in instead."
          );
        } else if (errorMessage.toLowerCase().includes("display name")) {
          setError("Please provide a valid display name that isn't empty.");
        } else if (
          errorMessage.includes("display") ||
          errorMessage.includes("name")
        ) {
          setError("Please check your display name: " + errorMessage);
        } else {
          setError(errorMessage || "Registration failed. Please try again.");
        }
      } else {
        // Avoid logging submitted registration data.
        setError("Registration failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const sendCode = async () => {
    setError(null);
    const valid = schema.safeParse(form.values);
    if (!valid.success) {
      setError(valid.error.issues[0]?.message || "Complete your details first.");
      return;
    }
    setIsLoading(true);
    try {
      await postSendRegistrationOtp({ email: valid.data.email });
      setOtpSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to send verification code.");
    } finally {
      setIsLoading(false);
    }
  };

  const verifyCode = async () => {
    setError(null);
    setIsLoading(true);
    try {
      await postVerifyRegistrationOtp({ email: String(form.values.email || ""), code: otp });
      setEmailVerified(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to verify code.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      {error && <div className={styles.errorMessage}>{error}</div>}
      <form
        onSubmit={form.handleSubmit((data) =>
          handleSubmit(data as z.infer<typeof schema>)
        )}
        className={`${styles.form} ${className || ""}`}
      >
        <FormItem name="email">
          <FormLabel>Email</FormLabel>
          <FormControl>
            <Input
              placeholder="your@email.com"
              value={form.values.email || ""}
              onChange={(e) =>
                form.setValues((prev: any) => ({
                  ...prev,
                  email: e.target.value,
                }))
              }
            />
          </FormControl>
          <FormMessage />
        </FormItem>

        <FormItem name="displayName">
          <FormLabel>Display Name</FormLabel>
          <FormControl>
            <Input
              id="register-display-name"
              placeholder="Your Name"
              value={form.values.displayName || ""}
              onChange={(e) =>
                form.setValues((prev: any) => ({
                  ...prev,
                  displayName: e.target.value,
                }))
              }
            />
          </FormControl>
          <FormDescription>
            Spaces, emojis, and special characters are all allowed
          </FormDescription>
          <FormMessage />
        </FormItem>

        <FormItem name="password">
          <FormLabel>Password</FormLabel>
          <FormControl>
            <Input
              type="password"
              placeholder="••••••••"
              value={form.values.password || ""}
              onChange={(e) =>
                form.setValues((prev: any) => ({
                  ...prev,
                  password: e.target.value,
                }))
              }
            />
          </FormControl>
          <FormDescription>
            At least 8 characters with uppercase, lowercase, and number
          </FormDescription>
          <FormMessage />
        </FormItem>

        {!emailVerified && !otpSent && <Button type="button" disabled={isLoading} className={styles.submitButton} onClick={sendCode}>{isLoading ? <><Spinner size="sm" /> Sending code...</> : "Send email verification code"}</Button>}
        {otpSent && !emailVerified && <FormItem name="emailOtp"><FormLabel>6-digit email verification code</FormLabel><FormControl><Input inputMode="numeric" autoComplete="one-time-code" maxLength={6} placeholder="Enter OTP" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))} /></FormControl><Button type="button" disabled={isLoading || otp.length !== 6} className={styles.submitButton} onClick={verifyCode}>{isLoading ? <><Spinner size="sm" /> Verifying...</> : "Verify email"}</Button><Button type="button" variant="outline" disabled={isLoading} onClick={sendCode}>Resend code</Button></FormItem>}
        {emailVerified && <><div className={styles.successMessage}>Email verified successfully.</div><Button type="submit" disabled={isLoading} className={styles.submitButton}>{isLoading ? <><Spinner size="sm" /> Creating Account...</> : "Create Account"}</Button></>}
      </form>
    </Form>
  );
};

