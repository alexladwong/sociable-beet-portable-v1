import "server-only";

import type { Prisma, ProjectStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type ProjectSort = "newest" | "oldest" | "name" | "dueDate";

export type ProjectListFilters = {
  search?: string;
  status?: ProjectStatus;
  sort?: ProjectSort;
};

export type ProjectInput = {
  name: string;
  description: string | null;
  status: ProjectStatus;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  startDate: Date | null;
  dueDate: Date | null;
};

export async function listWorkspaceProjects(workspaceId: string, filters: ProjectListFilters = {}) {
  const where: Prisma.ProjectWhereInput = { workspaceId };
  if (filters.status) where.status = filters.status;
  if (filters.search) where.name = { contains: filters.search, mode: "insensitive" };

  const orderBy: Prisma.ProjectOrderByWithRelationInput =
    filters.sort === "oldest"
      ? { createdAt: "asc" }
      : filters.sort === "name"
        ? { name: "asc" }
        : filters.sort === "dueDate"
          ? { dueDate: "asc" }
          : { createdAt: "desc" };

  return prisma.project.findMany({ where, include: { tasks: true }, orderBy });
}

/**
 * Always scopes by workspaceId in the *same* query - never fetch a project by
 * id alone and check its workspace afterwards. Returns null if the project
 * doesn't exist OR belongs to a different workspace, so callers can treat
 * both cases identically (404) without leaking which one it was.
 */
export async function getWorkspaceProject(workspaceId: string, projectId: string) {
  return prisma.project.findFirst({
    where: { id: projectId, workspaceId },
    include: { tasks: true, creator: true },
  });
}

export async function createWorkspaceProject(workspaceId: string, createdBy: string, data: ProjectInput) {
  return prisma.project.create({
    data: { workspaceId, createdBy, ...data },
  });
}

/** Returns false (rather than throwing) if the project isn't in this workspace. */
export async function updateWorkspaceProject(
  workspaceId: string,
  projectId: string,
  data: Partial<ProjectInput> & { progress?: number }
): Promise<boolean> {
  const result = await prisma.project.updateMany({
    where: { id: projectId, workspaceId },
    data,
  });
  return result.count > 0;
}

export async function setWorkspaceProjectStatus(
  workspaceId: string,
  projectId: string,
  status: ProjectStatus
): Promise<boolean> {
  const result = await prisma.project.updateMany({
    where: { id: projectId, workspaceId },
    data: { status },
  });
  return result.count > 0;
}

export async function deleteWorkspaceProject(workspaceId: string, projectId: string): Promise<boolean> {
  const result = await prisma.project.deleteMany({ where: { id: projectId, workspaceId } });
  return result.count > 0;
}
