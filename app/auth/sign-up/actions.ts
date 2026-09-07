"use server";

import { auth } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function signUpWithEmail(
  _prevState: { error: string } | null,
  formData: FormData
) {
  const email = formData.get("email") as string;
  const name = formData.get("name") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const { error } = await auth.signUp.email({ email, name, password });

  if (error) {
    return { error: error.message || "Failed to create account" };
  }

  const { data: session } = await auth.getSession();

  // If the project has "Verify at Sign-up" enabled, no session cookie is set
  // yet - the account exists but is pending email verification. Rather than
  // trust a specific shape from signUp.email's response, treat "no session"
  // as "needs verification" and send the user to enter the emailed OTP code.
  if (!session?.user) {
    redirect(`/auth/verify-email?email=${encodeURIComponent(email)}`);
  }

  // Mirror the Neon Auth user into our app's Profile table.
  await prisma.profile.upsert({
    where: { id: session.user.id },
    create: { id: session.user.id, email: session.user.email, name: session.user.name },
    update: { email: session.user.email, name: session.user.name },
  });

  redirect("/workspace");
}
