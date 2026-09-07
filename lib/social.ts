import "server-only";

import type { Prisma, SocialPostType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type PostInput = {
  title?: string | null;
  body: string;
  type: SocialPostType;
  channels: string[];
  hashtags: string[];
};

const postInclude = {
  author: { select: { id: true, name: true, email: true, avatarUrl: true } },
  reviewer: { select: { id: true, name: true, email: true, avatarUrl: true } },
  approver: { select: { id: true, name: true, email: true, avatarUrl: true } },
  _count: { select: { comments: true, events: true } },
} satisfies Prisma.SocialPostInclude;

export async function listWorkspacePosts(workspaceId: string) {
  return prisma.socialPost.findMany({
    where: { workspaceId },
    include: postInclude,
    orderBy: { createdAt: "desc" },
  });
}

export async function getWorkspacePost(workspaceId: string, postId: string) {
  return prisma.socialPost.findFirst({
    where: { id: postId, workspaceId },
    include: {
      ...postInclude,
      events: { include: { actor: { select: { id: true, name: true, email: true } } }, orderBy: { createdAt: "asc" } },
      comments: { include: { author: { select: { id: true, name: true, email: true, avatarUrl: true } } }, orderBy: { createdAt: "asc" } },
    },
  });
}

export async function createWorkspacePost(
  workspaceId: string,
  authorProfileId: string,
  data: PostInput,
  action: "created" = "created"
) {
  return prisma.socialPost.create({
    data: {
      workspaceId,
      authorProfileId,
      ...data,
      events: { create: { actorProfileId: authorProfileId, action } },
    },
  });
}

export async function updateWorkspacePost(
  workspaceId: string,
  postId: string,
  data: Partial<PostInput> & { scheduledAt?: Date | null }
): Promise<{ ok: boolean; status?: string }> {
  const current = await prisma.socialPost.findFirst({
    where: { id: postId, workspaceId },
    select: { status: true, authorProfileId: true },
  });
  if (!current) return { ok: false };
  if (current.status !== "DRAFT") return { ok: false, status: "Only drafts can be edited." };
  const res = await prisma.socialPost.updateMany({ where: { id: postId, workspaceId }, data });
  return { ok: res.count > 0 };
}

/**
 * Scope + transition in one place: returns false for foreign/missing posts.
 * Every transition writes an immutable SocialPostEvent with the actor.
 */
export async function transitionWorkspacePost(
  workspaceId: string,
  postId: string,
  actorProfileId: string,
  nextStatus: "IN_REVIEW" | "APPROVED" | "SCHEDULED" | "PUBLISHED" | "DRAFT",
  action: "submitted" | "approved" | "scheduled" | "published" | "sent_back",
  extra: { reviewerProfileId?: string; approverProfileId?: string; scheduledAt?: Date | null; note?: string } = {}
) {
  const post = await prisma.socialPost.findFirst({
    where: { id: postId, workspaceId },
    select: { id: true, status: true },
  });
  if (!post) return false;

  const allowed: Record<string, string[]> = {
    submitted: ["DRAFT"],
    approved: ["IN_REVIEW"],
    scheduled: ["APPROVED"],
    published: ["SCHEDULED", "APPROVED"],
    sent_back: ["IN_REVIEW"],
  };
  if (!allowed[action]?.includes(post.status)) return false;

  await prisma.socialPost.update({
    where: { id: postId },
    data: {
      status: nextStatus,
      ...(extra.reviewerProfileId ? { reviewer: { connect: { id: extra.reviewerProfileId } } } : {}),
      ...(extra.approverProfileId ? { approver: { connect: { id: extra.approverProfileId } } } : {}),
      ...(extra.scheduledAt !== undefined ? { scheduledAt: extra.scheduledAt } : {}),
      ...(nextStatus === "PUBLISHED" ? { publishedAt: new Date() } : {}),
      events: { create: { actorProfileId, action, note: extra.note ?? null } },
    },
  });
  return true;
}

export async function addWorkspaceComment(workspaceId: string, postId: string, authorProfileId: string, body: string) {
  const post = await prisma.socialPost.findFirst({ where: { id: postId, workspaceId }, select: { id: true } });
  if (!post) return false;
  await prisma.socialComment.create({ data: { postId, authorProfileId, body } });
  return true;
}
