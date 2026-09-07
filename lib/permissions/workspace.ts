import "server-only";

import { Prisma, type WorkspaceRole } from "@prisma/client";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";
import { roleAtLeast } from "./roles";

// --- Profile bootstrap -------------------------------------------------

/**
 * Verifies there is an authenticated Neon Auth session and mirrors it into
 * our app-owned Profile table (creating it on first visit - this is the only
 * place that needs to run for every authenticated user, including those who
 * signed up via Google/GitHub and never hit our email sign-up server action).
 *
 * Redirects to sign-in if there is no session. Call this at the top of every
 * authenticated server component, server action, or route handler.
 */
export async function requireAuthenticatedProfile() {
  const { data: session } = await auth.getSession();
  if (!session?.user) {
    redirect("/auth/sign-in");
  }

  const profile = await prisma.profile.upsert({
    where: { id: session.user.id },
    create: { id: session.user.id, email: session.user.email, name: session.user.name },
    update: { email: session.user.email, name: session.user.name },
  });

  return { session, profile };
}

// --- Workspace slug helpers ---------------------------------------------

function slugify(input: string): string {
  const slug = input
    .toLowerCase()
    .trim()
    .replace(/'/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-+|-+$)/g, "");
  return slug || "workspace";
}

async function generateUniqueSlug(base: string): Promise<string> {
  const root = slugify(base);
  let candidate = root;
  let suffix = 1;
  // Small bounded loop - collisions on a personal workspace slug are rare.
  while (await prisma.workspace.findUnique({ where: { slug: candidate }, select: { id: true } })) {
    suffix += 1;
    candidate = `${root}-${suffix}`;
  }
  return candidate;
}

// --- Default workspace bootstrap ----------------------------------------

/**
 * Ensures the given profile belongs to at least one workspace. If they
 * already have a membership, returns their oldest (default) workspace.
 * Otherwise creates a new personal workspace and makes them OWNER.
 *
 * Safe to call on every visit to the workspace area - never creates a
 * duplicate default workspace for a profile that already has one.
 */
export async function ensureDefaultWorkspace(profileId: string, displayName?: string | null) {
  const existing = await prisma.membership.findFirst({
    where: { profileId },
    include: { workspace: true },
    orderBy: { createdAt: "asc" },
  });
  if (existing) return existing.workspace;

  const baseName = displayName?.trim() || "My";
  const workspaceName = `${baseName}'s Workspace`;

  // Retry a couple of times in case of a slug race with a concurrent request
  // (unique constraint on Workspace.slug is the real guarantee here).
  for (let attempt = 0; attempt < 3; attempt++) {
    const slug = await generateUniqueSlug(`${workspaceName}${attempt > 0 ? `-${attempt}` : ""}`);
    try {
      return await prisma.$transaction(async (tx) => {
        // Re-check inside the transaction so two concurrent first-visits
        // for the same profile can't both create a default workspace.
        const raceCheck = await tx.membership.findFirst({
          where: { profileId },
          include: { workspace: true },
          orderBy: { createdAt: "asc" },
        });
        if (raceCheck) return raceCheck.workspace;

        return tx.workspace.create({
          data: {
            name: workspaceName,
            slug,
            memberships: { create: { profileId, role: "OWNER" } },
          },
        });
      });
    } catch (err) {
      const isSlugConflict = err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002";
      if (!isSlugConflict || attempt === 2) throw err;
      // loop again with a different slug suffix
    }
  }

  throw new Error("Failed to create default workspace after multiple attempts.");
}

// --- Membership lookups ---------------------------------------------------

/** Pure lookup with no redirect/notFound side effects - safe for route handlers. */
export async function getMembership(profileId: string, workspaceSlug: string) {
  return prisma.membership.findFirst({
    where: { profileId, workspace: { slug: workspaceSlug } },
    include: { workspace: true },
  });
}

export async function listMembershipsForProfile(profileId: string) {
  return prisma.membership.findMany({
    where: { profileId },
    include: { workspace: true },
    orderBy: { workspace: { name: "asc" } },
  });
}

export async function listMembersForWorkspace(workspaceId: string) {
  return prisma.membership.findMany({
    where: { workspaceId },
    include: { profile: true },
    orderBy: { createdAt: "asc" },
  });
}

// --- Page guards -----------------------------------------------------------

/**
 * Authenticates the request and verifies the profile is a member of the
 * workspace identified by `workspaceSlug`. A user must never reach workspace
 * data by guessing/changing a slug - if they are not a member (or the
 * workspace doesn't exist), this renders the 404 page rather than leaking
 * which case it was.
 *
 * Use at the top of every `/workspace/[workspaceSlug]/**` server component.
 */
export async function requireWorkspaceMembership(workspaceSlug: string) {
  const { profile } = await requireAuthenticatedProfile();

  const membership = await getMembership(profile.id, workspaceSlug);
  if (!membership) notFound();

  return { profile, membership, workspace: membership.workspace };
}

/**
 * Same as requireWorkspaceMembership, but also requires at least `minimumRole`.
 * The user is already known to be a member at this point, so an insufficient
 * role redirects to the workspace dashboard instead of a 404.
 */
export async function requireWorkspaceRole(workspaceSlug: string, minimumRole: WorkspaceRole) {
  const ctx = await requireWorkspaceMembership(workspaceSlug);
  if (!roleAtLeast(ctx.membership.role, minimumRole)) {
    redirect(`/workspace/${workspaceSlug}`);
  }
  return ctx;
}
