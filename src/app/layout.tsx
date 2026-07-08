import type { Metadata } from "next";
import { cookies } from "next/headers";
import { IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import { ThemeProvider } from "@/context/ThemeContext";
import { ReactQueryProvider } from "@/context/ReactQueryProvider";
import { AuthProvider } from "@/lib/auth/auth-context";
import { createServerClient } from "@/lib/api/server-client";
import { ACCESS_TOKEN_COOKIE } from "@/lib/api/cookies";
import type { User } from "@/interfaces/user";

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
(() => {
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

const RootLayout = async ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const jar = await cookies();
  let initialUser: User | null = null;

  if (jar.has(ACCESS_TOKEN_COOKIE)) {
    try {
      const client = await createServerClient();
      const { data, response } = await client.GET("/api/v1/auth/me");
      if (response.ok && data) initialUser = data;
    } catch {
      initialUser = null;
    }
  }

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
          <ReactQueryProvider>
            <AuthProvider initialUser={initialUser}>{children}</AuthProvider>
          </ReactQueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
};

export default RootLayout;
