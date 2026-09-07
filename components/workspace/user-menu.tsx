"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Profile } from "@prisma/client";
import { signOutAction } from "@/lib/auth/actions";
import { useTheme } from "@/lib/use-theme";
import { UserAvatar } from "./user-avatar";
import { EllipsisIcon } from "./icons";

/**
 * One profile menu for the whole shell. Rendered in two variants:
 * - "topbar": avatar-only trigger, panel drops below
 * - "sidebar": avatar + name/email row (bottom of the sidebar), panel rises
 * Both share the same data source (the authenticated Profile) and menu items.
 */
export function UserMenu({
  profile,
  workspaceSlug,
  canManageWorkspace,
  variant = "topbar",
  collapsed = false,
}: {
  profile: Profile;
  workspaceSlug: string;
  canManageWorkspace: boolean;
  variant?: "topbar" | "sidebar";
  collapsed?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme, toggle } = useTheme();
  const dark = theme === "dark";

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const displayName = profile.name || profile.email;

  return (
    <div
      className={`user-menu${variant === "sidebar" ? " user-menu-sidebar" : ""}`}
      ref={containerRef}
    >
      {variant === "topbar" ? (
        <button
          type="button"
          className="user-menu-trigger"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-haspopup="menu"
          title={displayName}
        >
          <UserAvatar name={profile.name} email={profile.email} image={profile.avatarUrl} size={32} />
        </button>
      ) : (
        <button
          type="button"
          className={`ws-profile-trigger${open ? " open" : ""}`}
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-haspopup="menu"
          title={collapsed ? displayName : undefined}
        >
          <UserAvatar name={profile.name} email={profile.email} image={profile.avatarUrl} size={30} />
          {!collapsed && (
            <span className="ws-profile-meta">
              <span className="ws-profile-name">{displayName}</span>
              <span className="ws-profile-email">{profile.email}</span>
            </span>
          )}
          {!collapsed && (
            <span className="ws-profile-dots">
              <EllipsisIcon className="nav-icon" />
            </span>
          )}
        </button>
      )}

      {open && (
        <div
          className={`user-menu-panel${variant === "sidebar" ? " up" : ""}`}
          role="menu"
        >
          <div className="user-menu-header">
            <UserAvatar name={profile.name} email={profile.email} image={profile.avatarUrl} size={36} />
            <div style={{ minWidth: 0 }}>
              <div className="user-menu-name">{displayName}</div>
              <div className="user-menu-email">{profile.email}</div>
            </div>
          </div>
          <div className="user-menu-list">
            <button type="button" className="user-menu-item" disabled title="Coming soon">
              Account
            </button>
            {canManageWorkspace && (
              <Link
                href={`/workspace/${workspaceSlug}/settings`}
                className="user-menu-item"
                onClick={() => setOpen(false)}
              >
                Workspace settings
              </Link>
            )}
            <button type="button" className="user-menu-item" onClick={toggle}>
              Appearance
              <span className="small">{dark ? "Dark" : "Light"}</span>
            </button>
          </div>
          <div className="user-menu-list user-menu-footer">
            <form action={signOutAction}>
              <button type="submit" className="user-menu-item user-menu-signout">
                Sign out
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
