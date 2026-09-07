"use server";

import { redirect } from "next/navigation";
import { requireWorkspaceRole } from "@/lib/permissions/workspace";
import { createWorkspaceProject } from "@/lib/projects";
import { projectInputSchema } from "../schema";

export type ProjectFormState = {
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
} | null;

export async function createProjectAction(
  workspaceSlug: string,
  _prevState: ProjectFormState,
  formData: FormData
): Promise<ProjectFormState> {
  // Re-verified here regardless of what the UI shows - only MANAGER+ may create.
  const { profile, workspace } = await requireWorkspaceRole(workspaceSlug, "MANAGER");

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

  const { name, description, status, priority, startDate, dueDate } = parsed.data;

  const project = await createWorkspaceProject(workspace.id, profile.id, {
    name,
    description,
    status,
    priority,
    startDate: startDate ? new Date(startDate) : null,
    dueDate: dueDate ? new Date(dueDate) : null,
  });

  redirect(`/workspace/${workspaceSlug}/projects/${project.id}`);
}
