"use client";
import { useEffect } from "react";
import { SessionProvider, signOut, useSession } from "next-auth/react";

const TAB_KEY = "admin_tab_active";

function TabGuard({ children }: { children: React.ReactNode }) {
  const { status } = useSession();

  useEffect(() => {
    if (status !== "authenticated") return;

    // If the flag is absent the tab was freshly opened (previous tab was closed)
    if (!sessionStorage.getItem(TAB_KEY)) {
      signOut({ callbackUrl: "/admin/login" });
      return;
    }
  }, [status]);

  useEffect(() => {
    if (status !== "authenticated") return;
    sessionStorage.setItem(TAB_KEY, "1");
  }, [status]);

  return <>{children}</>;
}

export default function SessionWrapper({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <TabGuard>{children}</TabGuard>
    </SessionProvider>
  );
}
