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
  if (session?.user) {
    // Mirror the Neon Auth user into our app's Profile table.
    await prisma.profile.upsert({
      where: { id: session.user.id },
      create: { id: session.user.id, email: session.user.email, name: session.user.name },
      update: { email: session.user.email, name: session.user.name },
    });
  }

  redirect("/workspace");
}
