import type { Membership, Profile, Workspace } from "@prisma/client";
import { WorkspaceSidebar, type WorkspaceNavKey } from "./workspace-sidebar";
import { WorkspaceTopbar } from "./workspace-topbar";
import { canManageWorkspace as canManageWorkspaceRole, canManageProjects as canManageProjectsRole } from "@/lib/permissions/roles";

type MembershipWithWorkspace = Membership & { workspace: Workspace };

export function WorkspaceShell({
  workspace,
  membership,
  profile,
  memberships,
  active,
  title,
  children,
}: {
  workspace: Workspace;
  membership: Membership;
  profile: Profile;
  memberships: MembershipWithWorkspace[];
  active: WorkspaceNavKey;
  /** Topbar heading text - defaults to `active` when omitted (e.g. a single project's own name). */
  title?: string;
  children: React.ReactNode;
}) {
  const canManage = canManageWorkspaceRole(membership.role);
  const canManageProjects = canManageProjectsRole(membership.role);

  return (
    <div className="shell workspace-shell">
      <WorkspaceSidebar
        workspace={workspace}
        memberships={memberships}
        profile={profile}
        active={active}
        canManageWorkspace={canManage}
      />
      <main className="main">
        <WorkspaceTopbar
          title={title ?? active}
          profile={profile}
          workspaceSlug={workspace.slug}
          canManageWorkspace={canManage}
          canManageProjects={canManageProjects}
        />
        <div className="content">{children}</div>
      </main>
    </div>
  );
}
