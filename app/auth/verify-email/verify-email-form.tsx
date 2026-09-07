"use client";

import { useActionState, useState, useTransition } from "react";
import { verifyEmailOtp, resendVerificationOtp } from "./actions";

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
    <div className="auth-page">
      <div className="card auth-card">
        <h1 className="section-title">Verify your email</h1>
        <p className="small">
          Enter the code we sent to <strong>{email}</strong>. It expires in 10 minutes.
        </p>
        <form action={formAction} className="form" style={{ marginTop: 16 }}>
          <input type="hidden" name="email" value={email} />
          <input
            name="otp"
            type="text"
            inputMode="numeric"
            placeholder="Verification code"
            required
            autoFocus
          />
          {state?.error && <div className="auth-error">{state.error}</div>}
          <button type="submit" className="btn primary" disabled={isPending}>
            {isPending ? "Verifying…" : "Verify email"}
          </button>
        </form>
        <p className="small auth-footer">
          Didn&apos;t get a code?{" "}
          <button
            type="button"
            className="btn"
            style={{ padding: "4px 10px", fontSize: 13 }}
            onClick={handleResend}
            disabled={isResending || !email}
          >
            {isResending ? "Sending…" : "Resend code"}
          </button>
        </p>
        {resendMessage && <p className="small">{resendMessage}</p>}
      </div>
    </div>
  );
}
