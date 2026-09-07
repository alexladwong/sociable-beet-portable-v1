import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  // Add favicon
  icons: {
    icon: "/favicon.ico",
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

export default function RootLayout({children}:{children:React.ReactNode}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
