import type { Metadata } from "next";

import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Codex Config Viewer",
  description: "Visual Codex config editor with i18n, TOML import, and file generation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
