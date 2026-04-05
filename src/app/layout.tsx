import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { DynamicProvider } from "@/providers/DynamicProvider";
import { ToastProvider } from "@/providers/ToastProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SONOS - Decentralized Music",
  description: "Listen, earn, and own music on-chain",
  icons: {
    icon: "/SonosLogo.png",
    apple: "/SonosLogo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <DynamicProvider>
            <ToastProvider>{children}</ToastProvider>
          </DynamicProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
