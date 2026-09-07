"use server";

import { auth } from "@/lib/auth/server";
import { redirect } from "next/navigation";

export async function signOutAction() {
  await auth.signOut();
  redirect("/auth/sign-in");
}
