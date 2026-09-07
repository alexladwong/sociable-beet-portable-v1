"use server";

import { auth } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function verifyEmailOtp(
  _prevState: { error: string } | null,
  formData: FormData
) {
  const email = formData.get("email") as string;
  const otp = formData.get("otp") as string;

  if (!email || !otp) {
    return { error: "Enter the code sent to your email." };
  }

  const { error } = await auth.emailOtp.verifyEmail({ email, otp });

  if (error) {
    return { error: error.message || "Invalid or expired code. Try again or resend a new one." };
  }

  const { data: session } = await auth.getSession();
  if (session?.user) {
    await prisma.profile.upsert({
      where: { id: session.user.id },
      create: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        avatarUrl: session.user.image ?? null,
      },
      update: {
        email: session.user.email,
        name: session.user.name,
        avatarUrl: session.user.image ?? null,
      },
    });
    redirect("/workspace");
  }

  // Verified but no session (auto-sign-in disabled on this project) - send
  // the user to sign in with their now-verified credentials.
  redirect("/auth/sign-in");
}

export async function resendVerificationOtp(email: string) {
  if (!email) return { error: "Missing email address." };

  const { error } = await auth.emailOtp.sendVerificationOtp({
    email,
    type: "email-verification",
  });

  if (error) {
    return { error: error.message || "Failed to resend code." };
  }

  return { error: null };
}
