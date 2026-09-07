import "server-only";

import type { TaskStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type TaskInput = {
  title: string;
  description: string | null;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  status: TaskStatus;
  dueDate: Date | null;
};

/**
 * Every query is scoped by workspaceId AND projectId in the same WHERE, so a
 * task from a foreign workspace can never be returned even when its ids are
 * guessed. Callers treat null/false exactly like a 404.
 */
export async function listProjectTasks(workspaceId: string, projectId: string) {
  return prisma.task.findMany({
    where: { projectId, project: { workspaceId } },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });
}

export async function countProjectTasks(workspaceId: string, projectId: string) {
  return prisma.task.count({ where: { projectId, project: { workspaceId } } });
}

export async function countProjectCompletedTasks(workspaceId: string, projectId: string) {
  return prisma.task.count({
    where: { projectId, project: { workspaceId }, status: "COMPLETED" },
  });
}

/** Returns null when the parent project is not in this workspace (no leak). */
export async function createProjectTask(
  workspaceId: string,
  projectId: string,
  data: Omit<TaskInput, "status"> & { status?: TaskStatus }
) {
  const project = await prisma.project.findFirst({
    where: { id: projectId, workspaceId },
    select: { id: true },
  });
  if (!project) return null;
  return prisma.task.create({
    data: { projectId, ...data, status: data.status ?? "TODO" },
  });
}

export async function updateProjectTask(
  workspaceId: string,
  projectId: string,
  taskId: string,
  data: Partial<TaskInput>
): Promise<boolean> {
  const result = await prisma.task.updateMany({
    where: { id: taskId, projectId, project: { workspaceId } },
    data,
  });
  return result.count > 0;
}

export async function setProjectTaskStatus(
  workspaceId: string,
  projectId: string,
  taskId: string,
  status: TaskStatus
): Promise<boolean> {
  return updateProjectTask(workspaceId, projectId, taskId, { status });
}

export async function deleteProjectTask(
  workspaceId: string,
  projectId: string,
  taskId: string
): Promise<boolean> {
  const result = await prisma.task.deleteMany({
    where: { id: taskId, projectId, project: { workspaceId } },
  });
  return result.count > 0;
}
