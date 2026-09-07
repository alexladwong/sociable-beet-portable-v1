"use client";

import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { AuthBrand } from "@/components/auth/auth-brand";

// Presentation only - the Neon Auth password-reset flow is not wired yet, so
// this page explains the state honestly instead of inventing behavior.
export default function ForgotPasswordPage() {
  return (
    <AuthShell>
      <AuthBrand />

      <div className="auth-heading">
        <h1>Forgot your password?</h1>
        <p>Password recovery is coming soon.</p>
      </div>

      <div className="auth-note">
        For now you can sign in with your existing password. If you&apos;re locked
        out, create a new account or reach out to your workspace owner.
      </div>

      <Link href="/auth/sign-in" className="btn primary auth-submit auth-submit-link">
        Back to sign in
      </Link>

      <p className="auth-footer">
        <Link href="/auth/sign-up" className="auth-link">
          Create an account instead
        </Link>
      </p>
    </AuthShell>
  );
}
