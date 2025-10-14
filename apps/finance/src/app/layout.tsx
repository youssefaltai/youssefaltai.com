import { QueryProvider } from "@repo/providers";
import { createViewport } from "@repo/utils";
import { MantineProvider, ColorSchemeScript, mantineHtmlProps } from "@mantine/core";
import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Finance",
  description: "Personal finance management application",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Finance",
  },
};

export const viewport: Viewport = createViewport();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript />
        <link rel="manifest" href="/manifest.webmanifest" />
      </head>
      <body>
        <MantineProvider>
          <QueryProvider>
            {children}
          </QueryProvider>
        </MantineProvider>
      </body>
    </html>
  );
}
