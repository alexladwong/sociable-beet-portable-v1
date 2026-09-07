"use server";

import { auth } from "@/lib/auth/server";
import { redirect } from "next/navigation";

export async function signInWithEmail(
  _prevState: { error: string } | null,
  formData: FormData
) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await auth.signIn.email({ email, password });

  if (error) {
    return { error: error.message || "Failed to sign in. Try again." };
  }

  redirect("/workspace");
}
