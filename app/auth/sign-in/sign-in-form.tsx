"use client";

import Link from "next/link";
import { useActionState } from "react";

import { signInWithEmail } from "./actions";
import { AuthShell } from "@/components/auth/auth-shell";
import { AuthBrand } from "@/components/auth/auth-brand";
import { AuthField } from "@/components/auth/auth-field";
import { OAuthButtons } from "@/components/auth/oauth-buttons";

export default function SignInForm({ oauthError }: { oauthError?: string | null }) {
  const [state, formAction, isPending] = useActionState(signInWithEmail, null);

  return (
    <AuthShell>
      <AuthBrand />

      <div className="auth-heading">
        <h1>Welcome back</h1>
        <p>Sign in to continue to your workspace.</p>
      </div>

      {oauthError?.startsWith("oauth_") && (
        <div className="auth-error" role="alert">
          Sign-in with <strong>{oauthError.replace("oauth_", "")}</strong> failed or is not
          configured yet.
        </div>
      )}

      <OAuthButtons callbackURL="/workspace" />

      <div className="auth-divider">
        <span>or continue with email</span>
      </div>

      <form action={formAction} className="auth-form">
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

        <AuthField
          label="Password"
          htmlFor="password"
          labelRight={
            <Link href="/auth/forgot-password" className="auth-link auth-link-small">
              Forgot password?
            </Link>
          }
          error={state?.error || undefined}
        >
          <input
            id="password"
            name="password"
            type="password"
            placeholder="Enter your password"
            autoComplete="current-password"
            required
          />
        </AuthField>

        <button type="submit" className="btn primary auth-submit" disabled={isPending}>
          {isPending ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="auth-footer">
        Don&apos;t have an account?{" "}
        <Link href="/auth/sign-up" className="auth-link">
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
}
