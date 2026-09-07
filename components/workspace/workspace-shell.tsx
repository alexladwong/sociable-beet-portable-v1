import type { Membership, Profile, Workspace } from "@prisma/client";
import { WorkspaceSidebar, type WorkspaceNavKey } from "./workspace-sidebar";
import { WorkspaceTopbar } from "./workspace-topbar";
import { canManageWorkspace as canManageWorkspaceRole, canManageProjects as canManageProjectsRole } from "@/lib/permissions/roles";

type MembershipWithWorkspace = Membership & { workspace: Workspace };

// Runs before first paint and before hydration so a returning user's pinned
// sidebar never flashes collapsed. Must mirror readPinnedPreference() in
// workspace-sidebar.tsx exactly - the DOM it produces and the state the client
// hydrates with must agree.
const SIDEBAR_BOOTSTRAP = `(function () {
  try {
    var key = "sb.sidebar.pinned";
    var stored = null;
    try { stored = localStorage.getItem(key); } catch (e) {}
    var el = document.querySelector("[data-sidebar]");
    if (!el) return;
    var w = document.documentElement.clientWidth;
    var pinned = stored === "1" || (stored === null && w >= 1024);
    if (pinned) el.classList.add("pinned");
  } catch (e) {}
})();`;

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
        active={active}
        canManageWorkspace={canManage}
      />
      <script dangerouslySetInnerHTML={{ __html: SIDEBAR_BOOTSTRAP }} />
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
