import type { Metadata } from "next";
import { Geist, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/theme-provider";
import { QueryProvider } from "@/providers/query-provider";
import { ClickSpark } from "@/components/ui/click-spark";
import { Toaster } from "@/components/ui/sonner";
import { ThemeColorMode } from "@/components/ui/theme-color-mode";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-source-serif",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});
export const metadata: Metadata = {
  title: "TeamFlow - Project Management Platform | Streamline Your Workflow",
  description:
    "TeamFlow is a comprehensive project management platform that streamlines your entire project lifecycle. Manage PRDs with markdown editor and version control, collaborate on design assets with Figma integration, assign tasks with priorities and due dates, and handle releases with semantic versioning. Perfect for teams working on software development projects.",
  keywords: [
    "project management",
    "team collaboration",
    "PRD management",
    "requirements documentation",
    "task management",
    "workspace management",
    "software development",
    "version control",
    "design collaboration",
    "release management",
    "markdown editor",
    "figma integration",
    "workflow automation",
  ],
  authors: [{ name: "TeamFlow" }],
  creator: "TeamFlow",
  publisher: "TeamFlow",
  applicationName: "TeamFlow",
  category: "productivity",
  openGraph: {
    title: "TeamFlow - Project Management Platform",
    description:
      "Streamline your entire project lifecycle from requirements gathering to deployment. Manage PRDs, design collaboration, development tasks, and release workflows all in one platform.",
    type: "website",
    siteName: "TeamFlow",
    locale: "en_US",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${sourceSerif.variable} h-full font-sans`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ThemeColorMode />
          <QueryProvider>
            <ClickSpark>{children}</ClickSpark>
            <Toaster />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
