"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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

// Which top-level section is highlighted. Decoupled from the topbar's (free-text)
// title so nested pages - e.g. a single project's detail page - can show their
// own title while "Projects" stays the active nav item.
export type WorkspaceNavKey = "Dashboard" | "Projects" | "Team" | "Settings";

const STORAGE_KEY = "sb.sidebar.pinned";
const DESKTOP_BREAKPOINT = 1024; // full sidebar is the default at >= this width
const DRAWER_BREAKPOINT = 768; // below this the sidebar is an off-canvas drawer

function readStored(): "1" | "0" | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(STORAGE_KEY) as "1" | "0" | null;
  } catch {
    return null;
  }
}

// Mirrors the inline bootstrap script in workspace-shell.tsx so hydration and
// the pre-paint DOM agree on the initial state (no flash, no mismatch).
function readPinnedPreference(): boolean {
  if (typeof window === "undefined") return false; // SSR pass renders collapsed
  const stored = readStored();
  if (stored === "1") return true;
  if (stored === "0") return false;
  return window.innerWidth >= DESKTOP_BREAKPOINT;
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
  const [pinned, setPinned] = useState(readPinnedPreference);
  const [userSet, setUserSet] = useState(false);
  const [fly, setFly] = useState(false); // hover fly-out while unpinned
  const [mobileOpen, setMobileOpen] = useState(false);

  const pinnedRef = useRef(pinned);
  pinnedRef.current = pinned;

  // Follow the desktop default until the user takes over (stored choice wins).
  useEffect(() => {
    if (userSet || readStored() !== null) return;
    const mq = window.matchMedia(`(min-width: ${DESKTOP_BREAKPOINT}px)`);
    const sync = () => setPinned(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [userSet]);

  const setPinnedPersisted = useCallback((next: boolean) => {
    setUserSet(true);
    setPinned(next);
    try {
      localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
    } catch {
      // ignore storage errors
    }
  }, []);

  const togglePinned = useCallback(() => {
    setPinnedPersisted(!pinnedRef.current);
  }, [setPinnedPersisted]);

  // Topbar menu button + Esc handling (registered once; refs stay fresh).
  useEffect(() => {
    const onToggleNav = () => setMobileOpen((open) => !open);
    const onToggleCollapse = () => setPinnedPersisted(!pinnedRef.current);
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileOpen(false);
        setFly(false);
      }
    };
    window.addEventListener(SIDEBAR_TOGGLE_NAV_EVENT, onToggleNav);
    window.addEventListener(SIDEBAR_TOGGLE_COLLAPSE_EVENT, onToggleCollapse);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener(SIDEBAR_TOGGLE_NAV_EVENT, onToggleNav);
      window.removeEventListener(SIDEBAR_TOGGLE_COLLAPSE_EVENT, onToggleCollapse);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [setPinnedPersisted]);

  // Close the drawer on navigation (links, switcher, etc.).
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Drawer: close when rotating to a width that doesn't use it; lock body scroll.
  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${DRAWER_BREAKPOINT}px)`);
    const sync = () => {
      if (mq.matches) setMobileOpen(false);
    };
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [mobileOpen]);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  // Hover fly-out: expanding while the pointer/focus is over the chrome and
  // collapsing on leave - unless the panel is pinned.
  const handleChromeEnter = useCallback(() => {
    if (!pinnedRef.current) setFly(true);
  }, []);
  const handleChromeLeave = useCallback(() => setFly(false), []);

  // Any navigation from the panel docks it (pins it open) when unpinned, so a
  // click never ends with the list sliding away under the cursor.
  const handleNavClick = useCallback(() => {
    closeMobile();
    if (!pinnedRef.current) setPinnedPersisted(true);
  }, [closeMobile, setPinnedPersisted]);

  const expanded = pinned || fly || mobileOpen;

  const chromeClass =
    "ws-chrome" +
    (pinned ? " pinned" : "") +
    (mobileOpen ? " open" : "") +
    (!pinned && fly && !mobileOpen ? " fly" : "");

  const navLink = (
    label: string,
    href: string,
    Icon: (props: { className?: string }) => React.ReactElement,
    isActive: boolean
  ) => (
    <Link
      className={`nav-item${isActive ? " active" : ""}`}
      href={href}
      onClick={handleNavClick}
      aria-current={isActive ? "page" : undefined}
      title={expanded ? undefined : label}
    >
      <Icon className="nav-icon" />
      <span>{label}</span>
    </Link>
  );

  const disabledNavItem = (label: string, Icon: (props: { className?: string }) => React.ReactElement) => (
    <span className="nav-item nav-item-disabled" title={expanded ? "Coming soon" : label}>
      <Icon className="nav-icon" />
      <span>{label}</span>
    </span>
  );

  return (
    <>
      <div
        className={chromeClass}
        data-sidebar
        onMouseEnter={handleChromeEnter}
        onMouseLeave={handleChromeLeave}
        onFocusCapture={handleChromeEnter}
        onBlurCapture={(e) => {
          const next = e.relatedTarget as Node | null;
          if (!pinnedRef.current && !(e.currentTarget as HTMLElement).contains(next)) setFly(false);
        }}
      >
        <div className="ws-brand">
          <Link href="/" onClick={closeMobile} aria-label="Sociable Beet home">
            <img src="/logo.png" alt="Sociable Beet" className="ws-logo" />
            <span className="ws-wordmark">Sociable Beet</span>
          </Link>
        </div>

        <WorkspaceSwitcher current={workspace} memberships={memberships} />

        <div className="ws-scroll">
          <div className="ws-group-label">Workspace</div>
          <nav className="nav" aria-label="Main">
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
            <div className="ws-section">
              <div className="ws-group-label">Manage</div>
              <nav className="nav" aria-label="Manage">
                {navLink("Settings", `/workspace/${slug}/settings`, SettingsIcon, active === "Settings")}
              </nav>
            </div>
          )}
        </div>

        <div className="ws-footer">
          <button
            type="button"
            className="ws-collapse-btn"
            onClick={togglePinned}
            aria-expanded={expanded}
            aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
            title={expanded ? "Collapse sidebar" : "Expand sidebar"}
          >
            {expanded ? <ChevronsLeftIcon className="nav-icon" /> : <ChevronsRightIcon className="nav-icon" />}
            <span>{expanded ? "Collapse" : "Expand"}</span>
          </button>
        </div>
      </div>

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
