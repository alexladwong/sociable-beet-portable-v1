"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { signUpWithEmail } from "./actions";
import { AuthShell } from "@/components/auth/auth-shell";
import { AuthBrand } from "@/components/auth/auth-brand";
import { AuthField } from "@/components/auth/auth-field";
import { OAuthButtons } from "@/components/auth/oauth-buttons";

export default function SignUpPage() {
  const [state, formAction, isPending] = useActionState(signUpWithEmail, null);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  // Client-only guard: the server action takes name/email/password and is
  // untouched - we just refuse to submit mismatching confirmation here.
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    const data = new FormData(e.currentTarget);
    const password = data.get("password") as string;
    const confirm = data.get("confirmPassword") as string;
    if (password !== confirm) {
      e.preventDefault();
      setConfirmError("Passwords do not match.");
      return;
    }
    setConfirmError(null);
  }

  return (
    <AuthShell>
      <AuthBrand />

      <div className="auth-heading">
        <h1>Create your account</h1>
        <p>Start building your workspace.</p>
      </div>

      {state?.error && (
        <div className="auth-error" role="alert">
          {state.error}
        </div>
      )}

      <OAuthButtons callbackURL="/workspace" />

      <div className="auth-divider">
        <span>or continue with email</span>
      </div>

      <form action={formAction} className="auth-form" onSubmit={handleSubmit}>
        <AuthField label="Name" htmlFor="name">
          <input id="name" name="name" type="text" placeholder="Your full name" autoComplete="name" required />
        </AuthField>

        <AuthField label="Email" htmlFor="email">
          <input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            required
          />
        </AuthField>

        <AuthField label="Password" htmlFor="password">
          <input
            id="password"
            name="password"
            type="password"
            placeholder="Create a password"
            autoComplete="new-password"
            required
            minLength={8}
          />
        </AuthField>

        <AuthField label="Confirm password" htmlFor="confirmPassword" error={confirmError || undefined}>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="Confirm your password"
            autoComplete="new-password"
            required
          />
        </AuthField>

        <button type="submit" className="btn primary auth-submit" disabled={isPending}>
          {isPending ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="auth-footer">
        Already have an account?{" "}
        <Link href="/auth/sign-in" className="auth-link">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
