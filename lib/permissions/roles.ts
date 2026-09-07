import type { WorkspaceRole } from "@prisma/client";

// Ordered lowest to highest. Keep this the single source of truth for role
// hierarchy - do not compare role strings directly anywhere else.
const ROLE_RANK: Record<WorkspaceRole, number> = {
  GUEST: 1,
  MEMBER: 2,
  MANAGER: 3,
  ADMIN: 4,
  OWNER: 5,
};

export function roleAtLeast(role: WorkspaceRole, minimum: WorkspaceRole): boolean {
  return ROLE_RANK[role] >= ROLE_RANK[minimum];
}

// --- Coarse-grained capability helpers -------------------------------------
// Intentionally simple for this phase: a handful of named capabilities backed
// by the role hierarchy above, instead of a fine-grained permission engine.
// Expand these (or add new ones) as new features need authorization.

export function canManageWorkspace(role: WorkspaceRole): boolean {
  return roleAtLeast(role, "ADMIN");
}

export function canManageMembers(role: WorkspaceRole): boolean {
  return roleAtLeast(role, "ADMIN");
}

export function canManageProjects(role: WorkspaceRole): boolean {
  return roleAtLeast(role, "MANAGER");
}

export function canDeleteWorkspace(role: WorkspaceRole): boolean {
  return role === "OWNER";
}

export function canTransferOwnership(role: WorkspaceRole): boolean {
  return role === "OWNER";
}
