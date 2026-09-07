import Link from "next/link";
import type { Membership, Workspace } from "@prisma/client";
import { WorkspaceSwitcher } from "./workspace-switcher";
import {
  DashboardIcon,
  ProjectsIcon,
  TasksIcon,
  SocialIcon,
  FilesIcon,
  ActivityIcon,
  AnalyticsIcon,
  TeamIcon,
  SettingsIcon,
} from "./icons";

type MembershipWithWorkspace = Membership & { workspace: Workspace };

// Which top-level section is highlighted in the sidebar. Decoupled from the
// topbar's (free-text) title so nested pages - e.g. a single project's
// detail/settings page - can show their own title while "Projects" stays
// the active nav item.
export type WorkspaceNavKey = "Dashboard" | "Projects" | "Team" | "Settings";

export function WorkspaceSidebar({
  workspace,
  memberships,
  active,
  canManageWorkspace,
}: {
  workspace: Workspace;
  memberships: MembershipWithWorkspace[];
  active: WorkspaceNavKey;
  canManageWorkspace: boolean;
}) {
  const slug = workspace.slug;

  const navLink = (
    label: string,
    href: string,
    Icon: (props: { className?: string }) => React.ReactElement,
    isActive: boolean
  ) => (
    <Link className={`nav-item${isActive ? " active" : ""}`} href={href}>
      <Icon className="nav-icon" />
      <span>{label}</span>
    </Link>
  );

  const disabledNavItem = (label: string, Icon: (props: { className?: string }) => React.ReactElement) => (
    <span className="nav-item nav-item-disabled" title="Coming soon">
      <Icon className="nav-icon" />
      <span>{label}</span>
    </span>
  );

  return (
    <aside className="sidebar">
      <div className="brand">Sociable Beet</div>
      <WorkspaceSwitcher current={workspace} memberships={memberships} />
      <nav className="nav">
        {navLink("Dashboard", `/workspace/${slug}`, DashboardIcon, active === "Dashboard")}
        {navLink("Projects", `/workspace/${slug}/projects`, ProjectsIcon, active === "Projects")}
        {disabledNavItem("Tasks", TasksIcon)}
        {disabledNavItem("Social Studio", SocialIcon)}
        {disabledNavItem("Files", FilesIcon)}
        {disabledNavItem("Activity", ActivityIcon)}
        {disabledNavItem("Analytics", AnalyticsIcon)}
        {navLink("Team", `/workspace/${slug}/team`, TeamIcon, active === "Team")}
      </nav>
      {canManageWorkspace && (
        <>
          <div className="nav-divider" />
          <nav className="nav">
            {navLink("Settings", `/workspace/${slug}/settings`, SettingsIcon, active === "Settings")}
          </nav>
        </>
      )}
    </aside>
  );
}
