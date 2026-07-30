"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";
import {
  LayoutDashboard, Package, ShoppingCart, Users, Grid3x3,
  Warehouse, BarChart3, Bell, Settings, LogOut, Menu, X, Users2,
  ChevronRight, Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNotificationStore } from "@/store/notifications";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/categories", label: "Categories", icon: Grid3x3 },
  { href: "/admin/warehouse", label: "Warehouse", icon: Warehouse },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/payments", label: "Payments", icon: Wallet },
  { href: "/admin/notifications", label: "Notifications", icon: Bell },
  { href: "/admin/team", label: "Team", icon: Users2 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const unreadCount = useNotificationStore((s) => s.unreadCount);

  function isActive(item: { href: string; exact?: boolean }) {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800">
        <Link href="/admin" className="flex items-center gap-3">
          <Image src="/logo.png" alt="NewGen Store" width={36} height={36} className="rounded-lg flex-shrink-0" priority />
          <div>
            <p className="font-black text-slate-900 dark:text-white text-base leading-none">
              NEW<span className="text-[#2563EB]">GEN</span>
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">Admin Portal</p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <div className="space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                  active
                    ? "bg-[#2563EB] text-white shadow-sm shadow-[#2563EB]/30"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                <Icon className="w-4.5 h-4.5 flex-shrink-0 w-5 h-5" />
                <span className="flex-1">{item.label}</span>
                {item.href === "/admin/notifications" && unreadCount > 0 && (
                  <span className={cn(
                    "text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center",
                    active ? "bg-white/20 text-white" : "bg-red-500 text-white"
                  )}>
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
                {active && <ChevronRight className="w-3.5 h-3.5 opacity-70" />}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors mb-1"
        >
          ↗ View Store
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-40">
        <SidebarContent />
      </aside>

      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-lg flex items-center justify-center"
      >
        <Menu className="w-5 h-5 text-slate-700 dark:text-slate-300" />
      </button>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <>
          <div className="lg:hidden fixed inset-0 bg-black/40 z-40" onClick={() => setMobileOpen(false)} />
          <aside className="lg:hidden fixed left-0 top-0 bottom-0 w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-50">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
            <SidebarContent />
          </aside>
        </>
      )}
    </>
  );
}
