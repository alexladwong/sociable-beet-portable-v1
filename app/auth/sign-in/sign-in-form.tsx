"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signInWithEmail } from "./actions";
import { SocialButtons } from "../social-buttons";

export function SignInForm({ oauthError }: { oauthError?: string }) {
  const [state, formAction, isPending] = useActionState(signInWithEmail, null);

  return (
    <div className="auth-page">
      <div className="card auth-card">
        <h1 className="section-title">Sign in to Sociable Beet</h1>
        {oauthError?.startsWith("oauth_") && (
          <div className="auth-error">
            {`Sign-in with ${oauthError.replace("oauth_", "")} failed or is not configured yet.`}
          </div>
        )}
        <SocialButtons callbackURL="/workspace" />
        <div className="auth-divider"><span>or</span></div>
        <form action={formAction} className="form">
          <input name="email" type="email" placeholder="Email address" required />
          <input name="password" type="password" placeholder="Password" required />
          {state?.error && <div className="auth-error">{state.error}</div>}
          <button type="submit" className="btn primary" disabled={isPending}>
            {isPending ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <p className="small auth-footer">
          Don&apos;t have an account? <Link href="/auth/sign-up">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
