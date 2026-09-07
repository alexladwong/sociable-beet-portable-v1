import type { Membership, Profile, Workspace } from "@prisma/client";
import { WorkspaceSidebar, type WorkspaceSectionTitle } from "./workspace-sidebar";
import { WorkspaceTopbar } from "./workspace-topbar";
import { canManageWorkspace as canManageWorkspaceRole } from "@/lib/permissions/roles";

type MembershipWithWorkspace = Membership & { workspace: Workspace };

export function WorkspaceShell({
  workspace,
  membership,
  profile,
  memberships,
  title,
  children,
}: {
  workspace: Workspace;
  membership: Membership;
  profile: Profile;
  memberships: MembershipWithWorkspace[];
  title: WorkspaceSectionTitle;
  children: React.ReactNode;
}) {
  const canManage = canManageWorkspaceRole(membership.role);

  return (
    <div className="shell workspace-shell">
      {/* CSS-only mobile drawer: checked state slides .sidebar in and shows the overlay (see globals.css) */}
      <input type="checkbox" id="mobile-nav-toggle" className="mobile-nav-checkbox" />
      <WorkspaceSidebar
        workspace={workspace}
        memberships={memberships}
        title={title}
        canManageWorkspace={canManage}
      />
      <label htmlFor="mobile-nav-toggle" className="sidebar-overlay" aria-hidden="true" />
      <main className="main">
        <WorkspaceTopbar
          title={title}
          profile={profile}
          workspaceSlug={workspace.slug}
          canManageWorkspace={canManage}
        />
        <div className="content">{children}</div>
      </main>
    </div>
  );
}
