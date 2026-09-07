"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Membership, Workspace } from "@prisma/client";
import { ChevronDownIcon, PlusIcon, SettingsIcon } from "./icons";

type MembershipWithWorkspace = Membership & { workspace: Workspace };

function initials(name: string) {
  return name.trim().slice(0, 1).toUpperCase() || "W";
}

export function WorkspaceSwitcher({
  current,
  memberships,
  collapsed = false,
}: {
  current: Workspace;
  memberships: MembershipWithWorkspace[];
  collapsed?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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

  const others = memberships.filter((m) => m.workspace.id !== current.id);
  // Honest caption: a single-workspace membership reads as a personal space.
  const caption = memberships.length <= 1 ? "Personal" : "Shared";
  const currentMembership = memberships.find((m) => m.workspace.id === current.id);

  return (
    <div className="workspace-switcher" ref={containerRef}>
      <button
        type="button"
        className="workspace-switcher-trigger"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        title={collapsed ? current.name : undefined}
      >
        <span className="workspace-switcher-avatar">{initials(current.name)}</span>
        {!collapsed && (
          <span className="workspace-switcher-text">
            <span className="workspace-switcher-name">{current.name}</span>
            <span className="workspace-switcher-caption">
              {caption}
              {currentMembership ? ` · ${currentMembership.role[0] + currentMembership.role.slice(1).toLowerCase()}` : ""}
            </span>
          </span>
        )}
        {!collapsed && <ChevronDownIcon className="workspace-switcher-chevron" />}
      </button>
      {open && (
        <div className="workspace-switcher-menu" role="menu">
          <div className="workspace-switcher-label">Current workspace</div>
          <Link
            href={`/workspace/${current.slug}`}
            className="workspace-switcher-item workspace-switcher-current"
            onClick={() => setOpen(false)}
          >
            <span className="workspace-switcher-avatar small">{initials(current.name)}</span>
            <span className="workspace-switcher-item-text">{current.name}</span>
          </Link>

          {others.length > 0 && (
            <>
              <div className="workspace-switcher-label">Other workspaces</div>
              {others.map((m) => (
                <Link
                  key={m.workspace.id}
                  href={`/workspace/${m.workspace.slug}`}
                  className="workspace-switcher-item"
                  onClick={() => setOpen(false)}
                >
                  <span className="workspace-switcher-avatar small">{initials(m.workspace.name)}</span>
                  <span className="workspace-switcher-item-text">{m.workspace.name}</span>
                </Link>
              ))}
            </>
          )}

          <div className="workspace-switcher-footer">
            <button type="button" className="workspace-switcher-item" disabled title="Coming soon">
              <PlusIcon />
              <span className="workspace-switcher-item-text">Create workspace</span>
            </button>
            <Link
              href={`/workspace/${current.slug}/settings`}
              className="workspace-switcher-item"
              onClick={() => setOpen(false)}
            >
              <SettingsIcon />
              <span className="workspace-switcher-item-text">Workspace settings</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
