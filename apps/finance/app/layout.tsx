import type { Metadata } from "next";
import "./globals.css";
import { BottomNav } from "./components/BottomNav";

export const metadata: Metadata = {
  title: "Finance App",
  description: "Personal finance management application",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Finance",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#007AFF",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
      </head>
      <body className="bg-ios-gray-6 antialiased">
        <main className="pb-16 min-h-screen">{children}</main>
        <BottomNav />
      </body>
    </html>
  );
}
