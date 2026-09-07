import type { ProjectStatus } from "@prisma/client";
import { requireWorkspaceMembership, listMembershipsForProfile } from "@/lib/permissions/workspace";
import { canManageProjects } from "@/lib/permissions/roles";
import { listWorkspaceProjects, type ProjectSort } from "@/lib/projects";
import { WorkspaceShell } from "@/components/workspace/workspace-shell";
import { ProjectsList } from "./projects-list";

export const dynamic = "force-dynamic";

const STATUS_OPTIONS: ProjectStatus[] = ["PLANNING", "ACTIVE", "REVIEW", "COMPLETED", "ARCHIVED"];
const SORT_OPTIONS: ProjectSort[] = ["newest", "oldest", "name", "dueDate"];

export default async function ProjectsPage({
  params,
  searchParams,
}: {
  params: Promise<{ workspaceSlug: string }>;
  searchParams: Promise<{ q?: string; status?: string; sort?: string }>;
}) {
  const { workspaceSlug } = await params;
  const { q, status, sort } = await searchParams;
  const { profile, membership, workspace } = await requireWorkspaceMembership(workspaceSlug);
  const memberships = await listMembershipsForProfile(profile.id);

  const activeStatus = STATUS_OPTIONS.includes(status as ProjectStatus) ? (status as ProjectStatus) : undefined;
  const activeSort = SORT_OPTIONS.includes(sort as ProjectSort) ? (sort as ProjectSort) : "newest";

  const projects = await listWorkspaceProjects(workspace.id, {
    search: q,
    status: activeStatus,
    sort: activeSort,
  });

  const canCreate = canManageProjects(membership.role);

  return (
    <WorkspaceShell workspace={workspace} membership={membership} profile={profile} memberships={memberships} active="Projects">
      <ProjectsList
        workspaceSlug={workspaceSlug}
        workspaceName={workspace.name}
        projects={projects}
        canCreate={canCreate}
        query={q || ""}
        status={activeStatus || ""}
        sort={activeSort}
        statusOptions={STATUS_OPTIONS}
      />
    </WorkspaceShell>
  );
}
