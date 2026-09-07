"use client";

import { MenuIcon } from "./icons";

// Event names shared with WorkspaceSidebar. The button adapts to the viewport:
// on mobile (<768px) it opens the off-canvas drawer, on desktop it collapses
// the sidebar to the icon rail.
export const SIDEBAR_TOGGLE_NAV_EVENT = "sb:toggle-nav";
export const SIDEBAR_TOGGLE_COLLAPSE_EVENT = "sb:toggle-collapse";

export function SidebarMenuButton() {
  return (
    <button
      type="button"
      className="btn icon-btn mobile-nav-btn"
      aria-label="Toggle navigation"
      onClick={() => {
        const mobile = window.matchMedia("(max-width: 767px)").matches;
        window.dispatchEvent(new Event(mobile ? SIDEBAR_TOGGLE_NAV_EVENT : SIDEBAR_TOGGLE_COLLAPSE_EVENT));
      }}
    >
      <MenuIcon />
    </button>
  );
}
