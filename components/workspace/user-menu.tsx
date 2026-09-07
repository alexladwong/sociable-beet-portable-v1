"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Profile } from "@prisma/client";
import { signOutAction } from "@/lib/auth/actions";
import { useTheme } from "@/lib/use-theme";

function initials(name: string) {
  return name.trim().slice(0, 1).toUpperCase() || "U";
}

export function UserMenu({
  profile,
  workspaceSlug,
  canManageWorkspace,
}: {
  profile: Profile;
  workspaceSlug: string;
  canManageWorkspace: boolean;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme, toggle } = useTheme();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayName = profile.name || profile.email;

  return (
    <div className="user-menu" ref={containerRef}>
      <button
        type="button"
        className="user-menu-trigger"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        title={displayName}
      >
        <span className="avatar">{initials(displayName)}</span>
      </button>
      {open && (
        <div className="user-menu-panel" role="menu">
          <div className="user-menu-header">
            <div className="user-menu-name">{displayName}</div>
            <div className="user-menu-email">{profile.email}</div>
          </div>
          <div className="user-menu-list">
            <button type="button" className="user-menu-item" disabled title="Coming soon">
              Account
            </button>
            <button type="button" className="user-menu-item" onClick={toggle}>
              Appearance
              <span className="small">{theme === "dark" ? "Dark" : "Light"}</span>
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
