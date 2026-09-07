"use server";

import { Prisma } from "@prisma/client";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireWorkspaceRole } from "@/lib/permissions/workspace";

export async function updateWorkspaceSettings(
  _prevState: { error: string } | null,
  formData: FormData
) {
  const workspaceId = formData.get("workspaceId") as string;
  const name = ((formData.get("name") as string) || "").trim();
  const slug = ((formData.get("slug") as string) || "").trim().toLowerCase();
  const description = ((formData.get("description") as string) || "").trim();

  if (!workspaceId || !name || !slug) {
    return { error: "Name and slug are required." };
  }
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return { error: "Slug can only contain lowercase letters, numbers, and hyphens." };
  }

  const target = await prisma.workspace.findUnique({ where: { id: workspaceId }, select: { slug: true } });
  if (!target) {
    return { error: "Workspace not found." };
  }

  // Re-verify authorization server-side using the workspace's *current* slug,
  // not the (possibly edited) form input - never trust the form for the
  // identity/role check itself.
  const { workspace } = await requireWorkspaceRole(target.slug, "ADMIN");

  try {
    await prisma.workspace.update({
      where: { id: workspace.id },
      data: { name, slug, description: description || null },
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return { error: "That slug is already taken." };
    }
    throw err;
  }

  redirect(`/workspace/${slug}/settings`);
}
