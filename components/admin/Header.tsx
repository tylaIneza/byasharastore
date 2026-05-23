"use client";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { Bell, Moon, Sun } from "lucide-react";
import Link from "next/link";
import { useNotificationStore } from "@/store/notifications";

export default function AdminHeader() {
  const { data: session } = useSession();
  const { resolvedTheme, setTheme } = useTheme();
  const { unreadCount, setNotifications } = useNotificationStore();

  // Poll notifications every 15 seconds
  useEffect(() => {
    async function fetchNotifications() {
      try {
        const res = await fetch("/api/notifications");
        const data = await res.json();
        if (data.success) setNotifications(data.data);
      } catch {}
    }
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15_000);
    return () => clearInterval(interval);
  }, [setNotifications]);

  const initials = session?.user?.name
    ?.split(" ")
    .map((n: string) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() ?? "AD";

  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 md:px-6 h-16 flex items-center justify-between gap-4">
      <div className="pl-12 lg:pl-0">
        <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 hidden lg:block">
          Welcome back, <span className="text-slate-900 dark:text-white">{session?.user?.name}</span>
        </h2>
      </div>

      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <button
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {resolvedTheme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Notifications */}
        <Link
          href="/admin/notifications"
          className="relative p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Link>

        {/* Avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-700">
          <div className="w-8 h-8 rounded-full bg-[#2563EB] flex items-center justify-center">
            <span className="text-white text-xs font-bold">{initials}</span>
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-semibold text-slate-900 dark:text-white leading-none">{session?.user?.name}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">{(session?.user as { role?: string })?.role?.replace("_", " ")}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
