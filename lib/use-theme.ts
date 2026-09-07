"use client";

import { useEffect, useState } from "react";

export type Theme = "light" | "dark";

// Shared by ThemeToggle and UserMenu's "Appearance" item so there is one
// source of truth for reading/writing the theme (kept in sync with the
// FOUC-prevention inline script in app/layout.tsx).
export function useTheme() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    setTheme((document.documentElement.dataset.theme as Theme) || "light");
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    window.localStorage.setItem("theme", next);
    setTheme(next);
  }

  return { theme, toggle };
}
