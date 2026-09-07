"use server";

import { redirect } from "next/navigation";
import { requireWorkspaceRole } from "@/lib/permissions/workspace";
import {
  createProjectTask,
  updateProjectTask,
  setProjectTaskStatus,
  deleteProjectTask,
} from "@/lib/tasks";
import { prisma } from "@/lib/prisma";
import { taskInputSchema } from "./schema";

export type TaskFormState = {
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
} | null;

const taskPage = (workspaceSlug: string, projectId: string) =>
  `/workspace/${workspaceSlug}/projects/${projectId}?tab=tasks`;

/**
 * All task actions follow the Projects conventions:
 * - unbound (identifiers arrive as hidden form fields - bound actions that
 *   return validation state stall Next 16 no-JS document POSTs)
 * - every identifier re-verified server-side (MANAGER+ role, then the
 *   workspace scoping happens in the same query that touches the row)
 */

export async function createTaskAction(
  _prevState: TaskFormState,
  formData: FormData
): Promise<TaskFormState> {
  const workspaceSlug = String(formData.get("workspaceSlug") || "");
  const projectId = String(formData.get("projectId") || "");
  const { workspace } = await requireWorkspaceRole(workspaceSlug, "MANAGER");

  const parsed = taskInputSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    status: formData.get("status") || "TODO",
    priority: formData.get("priority") || "MEDIUM",
    dueDate: formData.get("dueDate"),
  });

  if (!parsed.success) {
    return { error: "Please fix the errors below.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { title, description, status, priority, dueDate } = parsed.data;

  const task = await createProjectTask(workspace.id, projectId, {
    title,
    description,
    status,
    priority,
    dueDate: dueDate ? new Date(dueDate) : null,
  });

  if (!task) {
    return { error: "Project not found." };
  }

  redirect(taskPage(workspaceSlug, projectId));
}

export async function updateTaskAction(
  _prevState: TaskFormState,
  formData: FormData
): Promise<TaskFormState> {
  const workspaceSlug = String(formData.get("workspaceSlug") || "");
  const projectId = String(formData.get("projectId") || "");
  const taskId = String(formData.get("taskId") || "");
  const { workspace } = await requireWorkspaceRole(workspaceSlug, "MANAGER");

  const parsed = taskInputSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    status: formData.get("status"),
    priority: formData.get("priority"),
    dueDate: formData.get("dueDate"),
  });

  if (!parsed.success) {
    return { error: "Please fix the errors below.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { title, description, status, priority, dueDate } = parsed.data;

  const ok = await updateProjectTask(workspace.id, projectId, taskId, {
    title,
    description,
    status,
    priority,
    dueDate: dueDate ? new Date(dueDate) : null,
  });

  if (!ok) {
    return { error: "Task not found." };
  }

  redirect(taskPage(workspaceSlug, projectId));
}

/** Quick toggle used by the row checkbox: COMPLETED <-> TODO. */
export async function toggleTaskCompleteAction(formData: FormData) {
  const workspaceSlug = String(formData.get("workspaceSlug") || "");
  const projectId = String(formData.get("projectId") || "");
  const taskId = String(formData.get("taskId") || "");
  const { workspace } = await requireWorkspaceRole(workspaceSlug, "MANAGER");

  const current = await prisma.task.findFirst({
    where: { id: taskId, projectId, project: { workspaceId: workspace.id } },
    select: { status: true },
  });
  if (!current) {
    redirect(taskPage(workspaceSlug, projectId));
    return;
  }
  await setProjectTaskStatus(
    workspace.id,
    projectId,
    taskId,
    current.status === "COMPLETED" ? "TODO" : "COMPLETED"
  );
  redirect(taskPage(workspaceSlug, projectId));
}

export async function deleteTaskAction(formData: FormData) {
  const workspaceSlug = String(formData.get("workspaceSlug") || "");
  const projectId = String(formData.get("projectId") || "");
  const taskId = String(formData.get("taskId") || "");
  const { workspace } = await requireWorkspaceRole(workspaceSlug, "MANAGER");

  await deleteProjectTask(workspace.id, projectId, taskId);
  redirect(taskPage(workspaceSlug, projectId));
}