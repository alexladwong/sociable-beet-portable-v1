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

export type WorkspaceSectionTitle = "Dashboard" | "Team" | "Settings";

export function WorkspaceSidebar({
  workspace,
  memberships,
  title,
  canManageWorkspace,
}: {
  workspace: Workspace;
  memberships: MembershipWithWorkspace[];
  title: WorkspaceSectionTitle;
  canManageWorkspace: boolean;
}) {
  const slug = workspace.slug;

  const navLink = (
    label: string,
    href: string,
    Icon: (props: { className?: string }) => React.ReactElement,
    active: boolean
  ) => (
    <Link className={`nav-item${active ? " active" : ""}`} href={href}>
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
        {navLink("Dashboard", `/workspace/${slug}`, DashboardIcon, title === "Dashboard")}
        {disabledNavItem("Projects", ProjectsIcon)}
        {disabledNavItem("Tasks", TasksIcon)}
        {disabledNavItem("Social Studio", SocialIcon)}
        {disabledNavItem("Files", FilesIcon)}
        {disabledNavItem("Activity", ActivityIcon)}
        {disabledNavItem("Analytics", AnalyticsIcon)}
        {navLink("Team", `/workspace/${slug}/team`, TeamIcon, title === "Team")}
      </nav>
      {canManageWorkspace && (
        <>
          <div className="nav-divider" />
          <nav className="nav">
            {navLink("Settings", `/workspace/${slug}/settings`, SettingsIcon, title === "Settings")}
          </nav>
        </>
      )}
    </aside>
  );
}
