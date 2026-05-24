"use client";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Package } from "lucide-react";
import { formatCurrency, formatNumber } from "@/lib/utils";

interface Stats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  revenueChange: number;
  ordersChange: number;
  customersChange: number;
  productsChange: number;
  allTimeRevenue: number;
  todayOrders: number;
}

interface Props { stats: Stats }

const CARDS = [
  {
    key: "totalRevenue" as const,
    label: "Revenue This Month",
    subLabel: (s: Stats) => `${formatCurrency(s.allTimeRevenue)} all time`,
    icon: DollarSign,
    gradient: "from-blue-50 to-white dark:from-blue-950/30 dark:to-slate-900",
    borderColor: "border-l-[#2563EB]",
    iconBg: "bg-blue-100 dark:bg-blue-900/40",
    iconColor: "text-[#2563EB] dark:text-blue-400",
    valueColor: "text-[#2563EB]",
    format: (v: number) => formatCurrency(v),
    changeKey: "revenueChange" as const,
  },
  {
    key: "totalOrders" as const,
    label: "Orders This Month",
    subLabel: (s: Stats) => `${s.todayOrders} new today`,
    icon: ShoppingCart,
    gradient: "from-emerald-50 to-white dark:from-emerald-950/30 dark:to-slate-900",
    borderColor: "border-l-emerald-500",
    iconBg: "bg-emerald-100 dark:bg-emerald-900/40",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    valueColor: "text-emerald-600",
    format: (v: number) => formatNumber(v),
    changeKey: "ordersChange" as const,
  },
  {
    key: "totalCustomers" as const,
    label: "Total Customers",
    subLabel: () => "Registered accounts",
    icon: Users,
    gradient: "from-orange-50 to-white dark:from-orange-950/30 dark:to-slate-900",
    borderColor: "border-l-[#FF6B00]",
    iconBg: "bg-orange-100 dark:bg-orange-900/40",
    iconColor: "text-[#FF6B00] dark:text-orange-400",
    valueColor: "text-[#FF6B00]",
    format: (v: number) => formatNumber(v),
    changeKey: "customersChange" as const,
  },
  {
    key: "totalProducts" as const,
    label: "Active Products",
    subLabel: () => "In store catalog",
    icon: Package,
    gradient: "from-purple-50 to-white dark:from-purple-950/30 dark:to-slate-900",
    borderColor: "border-l-purple-500",
    iconBg: "bg-purple-100 dark:bg-purple-900/40",
    iconColor: "text-purple-600 dark:text-purple-400",
    valueColor: "text-purple-600",
    format: (v: number) => formatNumber(v),
    changeKey: "productsChange" as const,
  },
];

export default function DashboardStats({ stats }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
      {CARDS.map((card, i) => {
        const Icon = card.icon;
        const value = stats[card.key];
        const change = stats[card.changeKey];
        const isPositive = change >= 0;
        const hasChange = change !== 0;

        return (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`bg-gradient-to-br ${card.gradient} rounded-2xl border border-slate-100 dark:border-slate-800 border-l-4 ${card.borderColor} p-5 shadow-sm hover:shadow-md transition-all duration-200`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.iconBg}`}>
                <Icon className={`w-5 h-5 ${card.iconColor}`} />
              </div>
              {hasChange && (
                <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
                  isPositive
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
                    : "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400"
                }`}>
                  {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {Math.abs(change).toFixed(1)}%
                </span>
              )}
            </div>

            <p className={`text-2xl font-black mb-0.5 ${card.valueColor}`}>{card.format(value)}</p>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">{card.label}</p>
            <p className="text-xs text-slate-400">{card.subLabel(stats)}</p>
          </motion.div>
        );
      })}
    </div>
  );
}
