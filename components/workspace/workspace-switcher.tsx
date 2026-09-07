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
}: {
  current: Workspace;
  memberships: MembershipWithWorkspace[];
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const others = memberships.filter((m) => m.workspace.id !== current.id);

  return (
    <div className="workspace-switcher" ref={containerRef}>
      <button
        type="button"
        className="workspace-switcher-trigger"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        title={current.name}
      >
        <span className="workspace-switcher-avatar">{initials(current.name)}</span>
        <span className="workspace-switcher-name">{current.name}</span>
        <ChevronDownIcon className="workspace-switcher-chevron" />
      </button>
      {open && (
        <div className="workspace-switcher-menu" role="menu">
          <div className="workspace-switcher-label">Workspaces</div>
          <Link
            href={`/workspace/${current.slug}`}
            className="workspace-switcher-item workspace-switcher-current"
            onClick={() => setOpen(false)}
          >
            <span className="workspace-switcher-avatar small">{initials(current.name)}</span>
            <span className="workspace-switcher-item-text">{current.name}</span>
          </Link>
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
