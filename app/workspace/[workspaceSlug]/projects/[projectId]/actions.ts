"use server";

import { redirect } from "next/navigation";
import { requireWorkspaceRole } from "@/lib/permissions/workspace";
import { canDeleteProjects } from "@/lib/permissions/roles";
import {
  updateWorkspaceProject,
  setWorkspaceProjectStatus,
  deleteWorkspaceProject,
} from "@/lib/projects";
import { projectInputSchema } from "../schema";

export type ProjectFormState = {
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
} | null;

export async function updateProjectAction(
  workspaceSlug: string,
  projectId: string,
  _prevState: ProjectFormState,
  formData: FormData
): Promise<ProjectFormState> {
  // Re-verified here regardless of what the UI shows - only MANAGER+ may edit.
  const { workspace } = await requireWorkspaceRole(workspaceSlug, "MANAGER");

  const parsed = projectInputSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    status: formData.get("status"),
    priority: formData.get("priority"),
    startDate: formData.get("startDate"),
    dueDate: formData.get("dueDate"),
  });

  if (!parsed.success) {
    return { error: "Please fix the errors below.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const progressRaw = formData.get("progress");
  const progress = progressRaw !== null && progressRaw !== "" ? Number(progressRaw) : undefined;
  if (progress !== undefined && (Number.isNaN(progress) || progress < 0 || progress > 100)) {
    return { error: "Progress must be a number between 0 and 100." };
  }

  const { name, description, status, priority, startDate, dueDate } = parsed.data;

  // updateWorkspaceProject scopes the update by workspaceId + projectId together,
  // so this is a no-op (returns false) if the project isn't in this workspace.
  const ok = await updateWorkspaceProject(workspace.id, projectId, {
    name,
    description,
    status,
    priority,
    startDate: startDate ? new Date(startDate) : null,
    dueDate: dueDate ? new Date(dueDate) : null,
    ...(progress !== undefined ? { progress } : {}),
  });

  if (!ok) {
    return { error: "Project not found." };
  }

  redirect(`/workspace/${workspaceSlug}/projects/${projectId}`);
}

export async function archiveProjectAction(workspaceSlug: string, projectId: string) {
  // Archiving is more destructive than editing - requires ADMIN+.
  const { workspace, membership } = await requireWorkspaceRole(workspaceSlug, "ADMIN");
  if (!canDeleteProjects(membership.role)) {
    redirect(`/workspace/${workspaceSlug}/projects/${projectId}`);
  }
  await setWorkspaceProjectStatus(workspace.id, projectId, "ARCHIVED");
  redirect(`/workspace/${workspaceSlug}/projects/${projectId}`);
}

export async function restoreProjectAction(workspaceSlug: string, projectId: string) {
  const { workspace } = await requireWorkspaceRole(workspaceSlug, "ADMIN");
  await setWorkspaceProjectStatus(workspace.id, projectId, "PLANNING");
  redirect(`/workspace/${workspaceSlug}/projects/${projectId}`);
}

export async function deleteProjectAction(workspaceSlug: string, projectId: string) {
  // Permanent deletion - ADMIN+ only, re-verified server-side.
  const { workspace } = await requireWorkspaceRole(workspaceSlug, "ADMIN");
  await deleteWorkspaceProject(workspace.id, projectId);
  redirect(`/workspace/${workspaceSlug}/projects`);
}
