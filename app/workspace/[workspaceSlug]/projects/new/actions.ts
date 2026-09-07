"use server";

import { redirect } from "next/navigation";
import { requireWorkspaceRole } from "@/lib/permissions/workspace";
import { createWorkspaceProject } from "@/lib/projects";
import { projectInputSchema } from "../schema";

export type ProjectFormState = {
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
} | null;

/**
 * Creates a project in the workspace whose slug is carried by the form's
 * hidden `workspaceSlug` field. The slug is re-verified server-side
 * (membership + MANAGER+ role) - never trust the browser, but the submitted
 * slug can only ever resolve to a workspace the caller may already manage.
 *
 * NOTE: this action must stay *unbound*. Next.js/React stalls the response
 * when a bound server action returns a plain state object on a no-JS
 * document POST (the form's progressive-enhancement path), which is exactly
 * the validation-error flow. Passing identifiers as hidden form fields keeps
 * the same inline-error UX on every transport.
 */
export async function createProjectAction(
  _prevState: ProjectFormState,
  formData: FormData
): Promise<ProjectFormState> {
  const workspaceSlug = String(formData.get("workspaceSlug") || "");
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
