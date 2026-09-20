import type { Metadata, Viewport } from "next";
import { connection } from "next/server";
import { PreferencesProvider } from "@/features/preferences/Preferences";
import "@/styles/globals.css";
export const metadata: Metadata = {
  title: "Kivof — Physical AI workspace",
  description: "From robot evidence to verified improvements.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent" },
};
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#18231c",
};
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await connection();
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <PreferencesProvider>{children}</PreferencesProvider>
      </body>
    </html>
  );
}
