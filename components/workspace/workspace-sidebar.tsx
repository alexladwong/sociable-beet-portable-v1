"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Membership, Profile, Workspace } from "@prisma/client";
import { WorkspaceSwitcher } from "./workspace-switcher";
import { UserMenu } from "./user-menu";
import {
  HomeIcon,
  ProjectsIcon,
  CalendarIcon,
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
export type WorkspaceNavKey = "Workspace" | "Projects" | "Calendar" | "Team" | "Settings";

const STORAGE_KEY = "sociable-beet-sidebar-collapsed"; // "1" = collapsed, "0" = expanded
const LEGACY_STORAGE_KEY = "sb.sidebar.pinned"; // pre-rename key ("1" meant expanded)
const DESKTOP_BREAKPOINT = 1100; // >= this the expanded sidebar is the default
const DRAWER_BREAKPOINT = 700; // below this the sidebar is an off-canvas drawer

function readStored(): "1" | "0" | null {
  if (typeof window === "undefined") return null;
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === "1" || v === "0") return v as "1" | "0";
    const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacy === "1") return "0"; // legacy "pinned = expanded"
    if (legacy === "0") return "1";
    return null;
  } catch {
    return null;
  }
}

// Mirrors the inline bootstrap script in workspace-shell.tsx so hydration and
// the pre-paint DOM agree on the initial state (no flash, no mismatch).
function readExpandedPreference(): boolean {
  if (typeof window === "undefined") return false; // SSR pass renders collapsed
  const stored = readStored();
  if (stored === "0") return true;
  if (stored === "1") return false;
  return window.innerWidth >= DESKTOP_BREAKPOINT;
}

export function WorkspaceSidebar({
  workspace,
  memberships,
  active,
  profile,
  canManageWorkspace,
}: {
  workspace: Workspace;
  memberships: MembershipWithWorkspace[];
  active: WorkspaceNavKey;
  profile: Profile;
  canManageWorkspace: boolean;
}) {
  const slug = workspace.slug;
  const pathname = usePathname();
  const [pinned, setPinned] = useState(readExpandedPreference);
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
      localStorage.setItem(STORAGE_KEY, next ? "0" : "1");
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

  // Hover fly-out: expand while the pointer/focus is over the chrome and
  // collapse on leave - unless the panel is pinned.
  const handleChromeEnter = useCallback(() => {
    if (!pinnedRef.current) setFly(true);
  }, []);
  const handleChromeLeave = useCallback(() => setFly(false), []);

  // Navigation from the panel docks it (pins it open) when unpinned.
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
          <Link href="/workspace" onClick={closeMobile} aria-label="Sociable Beet home" className="ws-brand-link">
            <img src="/logo.png" alt="" className="ws-logo" />
            <span className="ws-wordmark">Sociable Beet</span>
          </Link>
        </div>

        <WorkspaceSwitcher current={workspace} memberships={memberships} collapsed={!expanded} />

        <div className="ws-scroll">
          <nav className="nav" aria-label="Main">
            {navLink("Workspace", `/workspace/${slug}`, HomeIcon, active === "Workspace")}
            {navLink("Projects", `/workspace/${slug}/projects`, ProjectsIcon, active === "Projects")}
            {navLink("Calendar", `/workspace/${slug}/calendar`, CalendarIcon, active === "Calendar")}
            {disabledNavItem("Tasks", TasksIcon)}
            {disabledNavItem("Social Studio", SocialIcon)}
            {disabledNavItem("Files", FilesIcon)}
            {disabledNavItem("Activity", ActivityIcon)}
            {disabledNavItem("Analytics", AnalyticsIcon)}
            {navLink("Team", `/workspace/${slug}/team`, TeamIcon, active === "Team")}
          </nav>

          {canManageWorkspace && (
            <>
              <div className="nav-divider ws-divider" />
              <nav className="nav" aria-label="Manage">
                {navLink("Settings", `/workspace/${slug}/settings`, SettingsIcon, active === "Settings")}
              </nav>
            </>
          )}
        </div>

        <UserMenu
          profile={profile}
          workspaceSlug={slug}
          canManageWorkspace={canManageWorkspace}
          variant="sidebar"
          collapsed={!expanded}
        />

        <button
          type="button"
          className="ws-edge-btn"
          onClick={togglePinned}
          aria-expanded={expanded}
          aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
          title={expanded ? "Collapse sidebar" : "Expand sidebar"}
        >
          {expanded ? <ChevronsLeftIcon className="icon-sm" /> : <ChevronsRightIcon className="icon-sm" />}
        </button>
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
