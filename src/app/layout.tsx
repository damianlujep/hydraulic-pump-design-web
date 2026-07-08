import type { Metadata } from "next";
import { IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import { ThemeProvider } from "@/context/ThemeContext";
import { ReactQueryProvider } from "@/context/ReactQueryProvider";

import "react-loading-skeleton/dist/skeleton.css";
import "@/styles/globals.css";

const sans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans-ibm",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono-ibm",
});

export const metadata: Metadata = {
  title: "HydraPump Design Suite",
  description: "Diseño y rediseño de sistemas de bombeo hidráulico — Jet & Pistón",
};

const NO_FLASH_SCRIPT = `
(function () {
  try {
    var stored = localStorage.getItem("hydrapump-theme");
    var theme = stored === "dark" || stored === "light"
      ? stored
      : (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
    var accent = localStorage.getItem("hydrapump-accent") || "indigo";
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.setAttribute("data-accent", accent);
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      data-theme="dark"
      data-accent="indigo"
      className={`${sans.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: NO_FLASH_SCRIPT }} />
      </head>
      <body className="h-full bg-bg text-text font-sans antialiased">
        <ThemeProvider>
          <ReactQueryProvider>{children}</ReactQueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
