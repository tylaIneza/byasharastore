"use client";
import { useEffect, useState } from "react";
import { Bell, CheckCheck, Package, ShoppingCart, Settings } from "lucide-react";
import { Notification } from "@/types";
import { useNotificationStore } from "@/store/notifications";
import { Button } from "@/components/ui/Button";
import { timeAgo } from "@/lib/utils";
import { cn } from "@/lib/utils";

const TYPE_ICON: Record<string, { icon: typeof Bell; color: string }> = {
  ORDER: { icon: ShoppingCart, color: "#2563EB" },
  STOCK: { icon: Package, color: "#F59E0B" },
  SYSTEM: { icon: Settings, color: "#7C3AED" },
  TEAM: { icon: Bell, color: "#10B981" },
};

export default function NotificationsPage() {
  const { notifications, setNotifications, markRead, markAllRead } = useNotificationStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/notifications").then((r) => r.json()).then((d) => {
      if (d.success) setNotifications(d.data);
    }).finally(() => setLoading(false));
  }, [setNotifications]);

  async function handleMarkRead(id: string) {
    await fetch("/api/notifications", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    markRead(id);
  }

  async function handleMarkAll() {
    await fetch("/api/notifications", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ markAll: true }) });
    markAllRead();
  }

  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Notifications</h1>
          <p className="text-sm text-slate-500">{unread} unread</p>
        </div>
        {unread > 0 && (
          <Button variant="secondary" size="sm" onClick={handleMarkAll}>
            <CheckCheck className="w-4 h-4" /> Mark all read
          </Button>
        )}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
        {notifications.length === 0 && !loading ? (
          <div className="py-16 text-center">
            <Bell className="w-10 h-10 text-slate-200 dark:text-slate-700 mx-auto mb-3" />
            <p className="text-slate-400">No notifications yet</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50 dark:divide-slate-800">
            {notifications.map((n) => {
              const type = TYPE_ICON[n.type] ?? TYPE_ICON.SYSTEM;
              const Icon = type.icon;
              return (
                <div
                  key={n.id}
                  onClick={() => !n.read && handleMarkRead(n.id)}
                  className={cn(
                    "flex gap-4 p-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors",
                    !n.read ? "bg-[#2563EB]/3 cursor-pointer" : ""
                  )}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: `${type.color}15` }}>
                    <Icon className="w-5 h-5" style={{ color: type.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-semibold ${n.read ? "text-slate-600 dark:text-slate-400" : "text-slate-900 dark:text-white"}`}>{n.title}</p>
                      {!n.read && <span className="w-2 h-2 rounded-full bg-[#2563EB] flex-shrink-0 mt-1.5" />}
                    </div>
                    <p className="text-sm text-slate-500 mt-0.5">{n.message}</p>
                    <p className="text-xs text-slate-400 mt-1">{timeAgo(n.createdAt)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
