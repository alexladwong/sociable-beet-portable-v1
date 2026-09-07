import Link from "next/link";
import type { Profile } from "@prisma/client";
import { ThemeToggle } from "../theme-toggle";
import { UserMenu } from "./user-menu";
import { SearchIcon, BellIcon, PlusIcon, MenuIcon } from "./icons";

export function WorkspaceTopbar({
  title,
  profile,
  workspaceSlug,
  canManageWorkspace,
  canManageProjects,
}: {
  title: string;
  profile: Profile;
  workspaceSlug: string;
  canManageWorkspace: boolean;
  canManageProjects: boolean;
}) {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <label htmlFor="mobile-nav-toggle" className="btn icon-btn mobile-nav-btn" aria-label="Open menu">
          <MenuIcon />
        </label>
        <strong>{title}</strong>
      </div>
      <div className="actions">
        <button type="button" className="btn topbar-search" disabled title="Search coming soon">
          <SearchIcon />
          <span>Search…</span>
        </button>
        <button type="button" className="btn icon-btn" disabled title="Notifications coming soon">
          <BellIcon />
        </button>
        <ThemeToggle />
        <button type="button" className="btn" disabled title="Invitations coming soon">
          Invite
        </button>
        {canManageProjects ? (
          <Link href={`/workspace/${workspaceSlug}/projects/new`} className="btn primary">
            <PlusIcon />
            <span className="btn-label">New Project</span>
          </Link>
        ) : (
          <button type="button" className="btn primary" disabled title="Only managers and above can create projects">
            <PlusIcon />
            <span className="btn-label">New Project</span>
          </button>
        )}
        <UserMenu profile={profile} workspaceSlug={workspaceSlug} canManageWorkspace={canManageWorkspace} />
      </div>
    </header>
  );
}
