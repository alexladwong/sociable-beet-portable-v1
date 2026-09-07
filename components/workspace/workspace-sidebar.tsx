"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from "./icons";
import { SIDEBAR_TOGGLE_NAV_EVENT, SIDEBAR_TOGGLE_COLLAPSE_EVENT } from "./sidebar-menu-button";

type MembershipWithWorkspace = Membership & { workspace: Workspace };

// Which top-level section is highlighted in the sidebar. Decoupled from the
// topbar's (free-text) title so nested pages - e.g. a single project's
// detail/settings page - can show their own title while "Projects" stays
// the active nav item.
export type WorkspaceNavKey = "Dashboard" | "Projects" | "Team" | "Settings";

const STORAGE_KEY = "sb.sidebar.collapsed";
const COLLAPSE_BREAKPOINT = 1024; // below this the rail is the default look
const DRAWER_BREAKPOINT = 768; // below this the sidebar is an off-canvas drawer

function readStored(): "1" | "0" | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(STORAGE_KEY) as "1" | "0" | null;
  } catch {
    return null;
  }
}

// Mirrors the inline bootstrap script in workspace-shell.tsx so hydration
// and the pre-paint DOM agree on the initial state (no flash, no mismatch).
function readCollapsedPreference(): boolean {
  if (typeof window === "undefined") return false; // SSR pass renders expanded
  const stored = readStored();
  if (stored === "1") return true;
  if (stored === "0") return false;
  // No stored preference: rail by default on medium screens, full on desktop.
  return window.innerWidth >= DRAWER_BREAKPOINT && window.innerWidth < COLLAPSE_BREAKPOINT;
}

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
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(readCollapsedPreference);
  const [userSet, setUserSet] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Follow the viewport default until the user takes over (stored choice wins).
  useEffect(() => {
    if (userSet || readStored() !== null) return;
    const mq = window.matchMedia(`(min-width: ${DRAWER_BREAKPOINT}px) and (max-width: ${COLLAPSE_BREAKPOINT - 1}px)`);
    const sync = () => setCollapsed(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [userSet]);

  // Persist once the user manually collapses/expands.
  const toggleCollapsed = useCallback(() => {
    setUserSet(true);
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      } catch {
        // ignore storage errors
      }
      return next;
    });
  }, []);

  // Mobile drawer: listen for the topbar menu button + close on Escape.
  useEffect(() => {
    const onToggleNav = () => setMobileOpen((open) => !open);
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener(SIDEBAR_TOGGLE_NAV_EVENT, onToggleNav);
    window.addEventListener(SIDEBAR_TOGGLE_COLLAPSE_EVENT, toggleCollapsed);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener(SIDEBAR_TOGGLE_NAV_EVENT, onToggleNav);
      window.removeEventListener(SIDEBAR_TOGGLE_COLLAPSE_EVENT, toggleCollapsed);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [toggleCollapsed]);

  // Close the drawer on navigation (links, switcher, etc.).
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Close the drawer when rotating to a layout where it isn't used.
  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${DRAWER_BREAKPOINT}px)`);
    const sync = () => {
      if (mq.matches) setMobileOpen(false);
    };
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  // Lock body scroll while the drawer is open.
  useEffect(() => {
    if (!mobileOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [mobileOpen]);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  const navLink = (
    label: string,
    href: string,
    Icon: (props: { className?: string }) => React.ReactElement,
    isActive: boolean
  ) => (
    <Link
      className={`nav-item${isActive ? " active" : ""}`}
      href={href}
      onClick={closeMobile}
      aria-current={isActive ? "page" : undefined}
      title={collapsed ? label : undefined}
    >
      <Icon className="nav-icon" />
      <span>{label}</span>
    </Link>
  );

  const disabledNavItem = (label: string, Icon: (props: { className?: string }) => React.ReactElement) => (
    <span className="nav-item nav-item-disabled" title={collapsed ? `${label} - coming soon` : "Coming soon"}>
      <Icon className="nav-icon" />
      <span>{label}</span>
    </span>
  );

  const rootClass = `sidebar${collapsed && !mobileOpen ? " collapsed" : ""}${mobileOpen ? " open" : ""}`;

  return (
    <>
      <aside className={rootClass} data-sidebar aria-label="Workspace navigation">
        <div className="sidebar-brand">
          <Link href="/" onClick={closeMobile} aria-label="Sociable Beet home">
            <img src="/logo.png" alt="Sociable Beet" className="sidebar-logo" />
          </Link>
        </div>

        <WorkspaceSwitcher current={workspace} memberships={memberships} />

        <nav className="nav sidebar-nav" aria-label="Main">
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
            <nav className="nav" aria-label="Manage">
              {navLink("Settings", `/workspace/${slug}/settings`, SettingsIcon, active === "Settings")}
            </nav>
          </>
        )}

        <div className="sidebar-footer">
          <button
            type="button"
            className="sidebar-collapse-btn"
            onClick={toggleCollapsed}
            aria-expanded={!collapsed}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronsRightIcon className="nav-icon" /> : <ChevronsLeftIcon className="nav-icon" />}
            <span>Collapse</span>
          </button>
        </div>
      </aside>

      {mobileOpen && (
        <button
          type="button"
          className="sidebar-overlay"
          aria-label="Close navigation"
          tabIndex={-1}
          onClick={closeMobile}
        />
      )}
    </>
  );
}
