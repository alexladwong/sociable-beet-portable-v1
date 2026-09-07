import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sociable Beet",
  description: "Portable workspace and inspirational social publishing platform",
};

export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="en"><body>{children}</body></html>;
}
