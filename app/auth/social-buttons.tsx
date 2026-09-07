"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth/client";

type Provider = "google" | "github";

const PROVIDER_LABEL: Record<Provider, string> = {
  google: "Google",
  github: "GitHub",
};

export function SocialButtons({ callbackURL }: { callbackURL: string }) {
  const [pending, setPending] = useState<Provider | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSignIn(provider: Provider) {
    setError(null);
    setPending(provider);
    try {
      // On success this redirects the browser to the provider's auth page,
      // so this call never "completes" in the happy path. If the provider
      // isn't configured in the Neon Console (or another upstream issue
      // occurs), it resolves with an error instead of redirecting.
      const { error } = await authClient.signIn.social({
        provider,
        callbackURL,
        errorCallbackURL: `/auth/sign-in?error=oauth_${provider}`,
      });
      if (error) {
        setError(error.message || `${PROVIDER_LABEL[provider]} sign-in is not available right now.`);
        setPending(null);
      }
    } catch {
      setError(`${PROVIDER_LABEL[provider]} sign-in is not available right now.`);
      setPending(null);
    }
  }

  return (
    <div className="auth-social">
      <button
        type="button"
        className="btn auth-social-btn"
        disabled={pending !== null}
        onClick={() => handleSignIn("google")}
      >
        {pending === "google" ? "Connecting to Google…" : "Continue with Google"}
      </button>
      <button
        type="button"
        className="btn auth-social-btn"
        disabled={pending !== null}
        onClick={() => handleSignIn("github")}
      >
        {pending === "github" ? "Connecting to GitHub…" : "Continue with GitHub"}
      </button>
      {error && <div className="auth-error">{error}</div>}
    </div>
  );
}
