"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signUpWithEmail } from "./actions";
import { SocialButtons } from "../social-buttons";

export default function SignUpPage() {
  const [state, formAction, isPending] = useActionState(signUpWithEmail, null);

  return (
    <div className="auth-page">
      <div className="card auth-card">
        <h1 className="section-title">Create your account</h1>
        <SocialButtons callbackURL="/workspace" />
        <div className="auth-divider"><span>or</span></div>
        <form action={formAction} className="form">
          <input name="name" type="text" placeholder="Name" required />
          <input name="email" type="email" placeholder="Email address" required />
          <input name="password" type="password" placeholder="Password" required minLength={8} />
          {state?.error && <div className="auth-error">{state.error}</div>}
          <button type="submit" className="btn primary" disabled={isPending}>
            {isPending ? "Creating account…" : "Create account"}
          </button>
        </form>
        <p className="small auth-footer">
          Already have an account? <Link href="/auth/sign-in">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
