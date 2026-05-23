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
}

interface Props { stats: Stats }

const CARDS = [
  {
    key: "totalRevenue" as const,
    label: "Revenue (This Month)",
    icon: DollarSign,
    color: "#2563EB",
    format: (v: number) => formatCurrency(v),
    changeKey: "revenueChange" as const,
  },
  {
    key: "totalOrders" as const,
    label: "Orders (This Month)",
    icon: ShoppingCart,
    color: "#10B981",
    format: (v: number) => formatNumber(v),
    changeKey: "ordersChange" as const,
  },
  {
    key: "totalCustomers" as const,
    label: "Total Customers",
    icon: Users,
    color: "#FF6B00",
    format: (v: number) => formatNumber(v),
    changeKey: "customersChange" as const,
  },
  {
    key: "totalProducts" as const,
    label: "Active Products",
    icon: Package,
    color: "#7C3AED",
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

        return (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card rounded-2xl p-5 relative overflow-hidden"
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: `${card.color}15` }}
              >
                <Icon className="w-5 h-5" style={{ color: card.color }} />
              </div>
              {change !== 0 && (
                <div className={`flex items-center gap-1 text-xs font-semibold ${isPositive ? "text-emerald-500" : "text-red-500"}`}>
                  {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                  {Math.abs(change).toFixed(1)}%
                </div>
              )}
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white mb-1">{card.format(value)}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{card.label}</p>

            {/* Background decoration */}
            <div
              className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full opacity-5"
              style={{ background: card.color }}
            />
          </motion.div>
        );
      })}
    </div>
  );
}
