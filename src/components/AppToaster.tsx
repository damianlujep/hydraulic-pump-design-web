"use client";

import { Toaster } from "sonner";

export const AppToaster = () => {
  return (
    <Toaster
      position="bottom-right"
      gap={10}
      toastOptions={{
        classNames: {
          toast: "app-toast",
          title: "app-toast-title",
          description: "app-toast-desc",
        },
      }}
    />
  );
};
