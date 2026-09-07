"use client";

import { useActionState, useState, useTransition } from "react";
import Link from "next/link";
import { verifyEmailOtp, resendVerificationOtp } from "./actions";
import { AuthShell } from "@/components/auth/auth-shell";
import { AuthBrand } from "@/components/auth/auth-brand";

export function VerifyEmailForm({ email }: { email: string }) {
  const [state, formAction, isPending] = useActionState(verifyEmailOtp, null);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [isResending, startResend] = useTransition();

  function handleResend() {
    setResendMessage(null);
    startResend(async () => {
      const result = await resendVerificationOtp(email);
      setResendMessage(result.error ? result.error : "A new code was sent to your email.");
    });
  }

  return (
    <AuthShell>
      <AuthBrand />

      <div className="auth-heading">
        <h1>Verify your email</h1>
        <p>
          We sent a verification code to <strong>{email}</strong>. It expires in 10 minutes.
        </p>
      </div>

      {state?.error && (
        <div className="auth-error" role="alert">
          {state.error}
        </div>
      )}

      <form action={formAction} className="auth-form">
        <input type="hidden" name="email" value={email} />
        <input
          name="otp"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="Verification code"
          aria-label="Verification code"
          className="auth-otp"
          required
          autoFocus
        />
        <button type="submit" className="btn primary auth-submit" disabled={isPending}>
          {isPending ? "Verifying…" : "Verify email"}
        </button>
      </form>

      <p className="auth-footer">
        Didn&apos;t receive a code?{" "}
        <button
          type="button"
          className="auth-link"
          onClick={handleResend}
          disabled={isResending || !email}
        >
          {isResending ? "Sending…" : "Resend code"}
        </button>
      </p>
      {resendMessage && <p className="auth-footnote">{resendMessage}</p>}

      <p className="auth-footer">
        <Link href="/auth/sign-in" className="auth-link">
          Back to sign in
        </Link>
      </p>
    </AuthShell>
  );
}
