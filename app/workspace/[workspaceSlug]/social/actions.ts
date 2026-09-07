"use server";

import { redirect } from "next/navigation";
import { requireWorkspaceRole } from "@/lib/permissions/workspace";
import { canManageProjects } from "@/lib/permissions/roles";
import { prisma } from "@/lib/prisma";
import { createWorkspacePost, updateWorkspacePost, transitionWorkspacePost, addWorkspaceComment } from "@/lib/social";
import { postInputSchema } from "./schema";

export type PostFormState = { error?: string; fieldErrors?: Record<string, string[] | undefined> } | null;

const postPath = (workspaceSlug: string, postId: string) =>
  `/workspace/${workspaceSlug}/social/posts/${postId}`;

const listPath = (workspaceSlug: string) => `/workspace/${workspaceSlug}/social`;

// Same conventions as Projects/Tasks: unbound actions, hidden identifiers,
// every mutation re-verified server-side and scoped in the same query.
export async function createPostAction(_prev: PostFormState, formData: FormData): Promise<PostFormState> {
  const workspaceSlug = String(formData.get("workspaceSlug") || "");
  const { profile, workspace } = await requireWorkspaceRole(workspaceSlug, "MEMBER");

  const parsed = postInputSchema.safeParse({
    title: formData.get("title"),
    body: formData.get("body"),
    type: formData.get("type") || "INSPIRATION",
    channels: formData.get("channels"),
    hashtags: formData.get("hashtags"),
  });
  if (!parsed.success) {
    return { error: "Please fix the errors below.", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const post = await createWorkspacePost(workspace.id, profile.id, parsed.data);
  redirect(postPath(workspaceSlug, post.id));
}

/** Edit a draft (author or MANAGER+). */
export async function editPostAction(_prev: PostFormState, formData: FormData): Promise<PostFormState> {
  const workspaceSlug = String(formData.get("workspaceSlug") || "");
  const postId = String(formData.get("postId") || "");
  const { profile, workspace, membership } = await requireWorkspaceRole(workspaceSlug, "MEMBER");

  const parsed = postInputSchema.safeParse({
    title: formData.get("title"),
    body: formData.get("body"),
    type: formData.get("type") || "INSPIRATION",
    channels: formData.get("channels"),
    hashtags: formData.get("hashtags"),
  });
  if (!parsed.success) {
    return { error: "Please fix the errors below.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const post = await prisma.socialPost.findFirst({
    where: { id: postId, workspaceId: workspace.id },
    select: { authorProfileId: true, status: true },
  });
  if (!post) return { error: "Post not found." };
  const isAuthor = post.authorProfileId === profile.id;
  if (!isAuthor && !canManageProjects(membership.role)) return { error: "Only the author or a manager can edit this post." };
  if (post.status !== "DRAFT") return { error: "Only drafts can be edited. Send the post back to draft first." };

  const res = await updateWorkspacePost(workspace.id, postId, { ...parsed.data });
  if (!res.ok) return { error: res.status || "Post not found." };
  redirect(postPath(workspaceSlug, postId));
}

const requireManager = async (workspaceSlug: string) => {
  const { profile, workspace, membership } = await requireWorkspaceRole(workspaceSlug, "MANAGER");
  return { profile, workspace, canManage: canManageProjects(membership.role) };
};

type NextPostStatus = "IN_REVIEW" | "APPROVED" | "SCHEDULED" | "PUBLISHED" | "DRAFT";
type PostAction = "submitted" | "approved" | "scheduled" | "published" | "sent_back";

const transitionForm = async (formData: FormData, next: NextPostStatus, action: PostAction) => {
  const workspaceSlug = String(formData.get("workspaceSlug") || "");
  const postId = String(formData.get("postId") || "");
  const { profile, workspace } = await requireManager(workspaceSlug);
  const scheduledRaw = formData.get("scheduledAt");
  const scheduledAt = scheduledRaw && String(scheduledRaw) ? new Date(String(scheduledRaw)) : null;
  await transitionWorkspacePost(workspace.id, postId, profile.id, next, action, {
    scheduledAt: scheduledAt ?? undefined,
    note: action === "published" ? "Published now" : undefined,
  });
  redirect(postPath(workspaceSlug, postId));
};

export async function submitPostAction(formData: FormData) {
  const workspaceSlug = String(formData.get("workspaceSlug") || "");
  const postId = String(formData.get("postId") || "");
  const { profile, workspace } = await requireWorkspaceRole(workspaceSlug, "MEMBER");
  const ok = await transitionWorkspacePost(workspace.id, postId, profile.id, "IN_REVIEW", "submitted", {
    reviewerProfileId: profile.id,
  });
  redirect(ok ? postPath(workspaceSlug, postId) : listPath(workspaceSlug));
}

export async function approvePostAction(formData: FormData) {
  const workspaceSlug = String(formData.get("workspaceSlug") || "");
  const postId = String(formData.get("postId") || "");
  const { profile, workspace } = await requireManager(workspaceSlug);
  await transitionWorkspacePost(workspace.id, postId, profile.id, "APPROVED", "approved", {
    approverProfileId: profile.id,
  });
  redirect(postPath(workspaceSlug, postId));
}

export async function sendBackPostAction(formData: FormData) {
  await transitionForm(formData, "DRAFT", "sent_back");
}

export async function schedulePostAction(formData: FormData) {
  await transitionForm(formData, "SCHEDULED", "scheduled");
}

export async function publishPostAction(formData: FormData) {
  await transitionForm(formData, "PUBLISHED", "published");
}

export async function commentAction(formData: FormData) {
  const workspaceSlug = String(formData.get("workspaceSlug") || "");
  const postId = String(formData.get("postId") || "");
  const body = String(formData.get("body") || "").trim();
  const { profile, workspace } = await requireWorkspaceRole(workspaceSlug, "MEMBER");
  if (body.length >= 2) {
    await addWorkspaceComment(workspace.id, postId, profile.id, body);
  }
  redirect(postPath(workspaceSlug, postId));
}
