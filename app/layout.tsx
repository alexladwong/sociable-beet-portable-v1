import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  // Add favicon
  icons: {
    icon: ["/favicon.ico", "/icon.png"],
    apple: ["/apple-icon.png"],
  },
  title: "Sociable Beet",
  // SEO metadata
  alternates: {
    canonical: "https://sociablebeet.com",
  },
  metadataBase: new URL("https://sociablebeet.com"),
  authors: [{ name: "Sociable Beet" }],
  creator: "Sociable Beet",
  publisher: "Sociable Beet",
  applicationName: "Sociable Beet",
  // Open Graph
  openGraph: {
    title: "Sociable Beet",
    description: "Portable workspace and inspirational social publishing platform",
    url: "https://sociablebeet.com",
    siteName: "Sociable Beet",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Sociable Beet",
      },
      {
        url: "/og-image-dark.png",
        width: 1200,
        height: 630,
        alt: "Sociable Beet Dark",
      },
      {
        url: "/og-image-light.png",
        width: 1200,
        height: 630,
        alt: "Sociable Beet Light",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  keywords: "Sociable Beet, portable workspace, inspirational social publishing, social media management, project management, task management", 
  description: "Portable workspace and inspirational social publishing platform",
};


const THEME_INIT_SCRIPT = `
(function(){
  try {
    var stored = window.localStorage.getItem("theme");
    var theme = stored === "dark" || stored === "light"
      ? stored
      : (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    document.documentElement.dataset.theme = theme;
  } catch (e) {}
})();
`;

// Applies the persisted sidebar state before first paint. Lives in the root
// <head> (not inside a component tree) so React never re-renders it on the
// client - body-level scripts trigger React's "script inside component"
// warning during client-side navigation.
const SIDEBAR_BOOTSTRAP = `
(function(){
  function apply(){
    try {
      var el = document.querySelector("[data-sidebar]");
      if (!el) return;
      var stored = null;
      try { stored = localStorage.getItem("sociable-beet-sidebar-collapsed"); } catch (e) {}
      if (stored !== "0" && stored !== "1") {
        try {
          var legacy = localStorage.getItem("sb.sidebar.pinned");
          if (legacy === "1") stored = "0";
          else if (legacy === "0") stored = "1";
        } catch (e) {}
      }
      var w = document.documentElement.clientWidth;
      var expanded = stored === "0" || (stored === null && w >= 1100);
      if (expanded) el.classList.add("pinned");
    } catch (e) {}
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", apply);
  } else {
    apply();
  }
})();
`;

export default function RootLayout({children}:{children:React.ReactNode}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script id="theme-init" dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <script id="sidebar-bootstrap" dangerouslySetInnerHTML={{ __html: SIDEBAR_BOOTSTRAP }} />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
