"use client";

import { WorkspaceErrorCard } from "@/components/workspace/layout/WorkspaceErrorCard";
import "@/styles/globals.css";

// Next.js requires global-error.tsx to render its own <html>/<body> — it replaces the root
// layout entirely when the root layout itself throws, so the no-flash script / ThemeProvider
// aren't available here. Hardcoded dark theme is an acceptable fallback for this last-resort
// screen; WorkspaceErrorCard itself is reused as-is (no provider dependency).
const GlobalError = ({ reset }: { error: Error & { digest?: string }; reset: () => void }) => {
  return (
    <html lang="es" data-theme="dark" data-accent="indigo">
      <body className="h-screen bg-bg text-text font-sans antialiased">
        <WorkspaceErrorCard
          title="Algo salió mal"
          message="La aplicación encontró un error inesperado al iniciar. Puedes intentar recargarla."
          onRetry={reset}
        />
      </body>
    </html>
  );
};

export default GlobalError;
