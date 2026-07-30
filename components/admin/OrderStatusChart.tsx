"use client";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  PENDING:    { label: "Pending",    color: "#F59E0B" },
  CONFIRMED:  { label: "Confirmed",  color: "#3B82F6" },
  PROCESSING: { label: "Processing", color: "#8B5CF6" },
  DISPATCHED: { label: "Dispatched", color: "#06B6D4" },
  DELIVERED:  { label: "Delivered",  color: "#10B981" },
  CANCELLED:  { label: "Cancelled",  color: "#EF4444" },
};

interface Props { data: { status: string; count: number }[] }

function Tip({ active, payload }: { active?: boolean; payload?: { name: string; value: number }[] }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 shadow-xl text-xs font-semibold text-slate-800 dark:text-white">
      {payload[0].name}: {payload[0].value}
    </div>
  );
}

export default function OrderStatusChart({ data }: Props) {
  const chartData = data
    .filter((d) => d.count > 0)
    .map((d) => ({
      name: STATUS_CONFIG[d.status]?.label ?? d.status,
      value: d.count,
      color: STATUS_CONFIG[d.status]?.color ?? "#94a3b8",
    }));

  const total = chartData.reduce((a, d) => a + d.value, 0);

  if (!chartData.length) {
    return <div className="h-48 flex items-center justify-center text-slate-400 text-sm">No orders yet</div>;
  }

  return (
    <div>
      <div className="relative h-44">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={chartData} cx="50%" cy="50%" innerRadius={52} outerRadius={76} paddingAngle={3} dataKey="value">
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.color} stroke="none" />
              ))}
            </Pie>
            <Tooltip content={<Tip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-black text-slate-900 dark:text-white">{total}</span>
          <span className="text-xs text-slate-400">Total</span>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {chartData.map((d) => (
          <div key={d.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
              <span className="text-xs text-slate-600 dark:text-slate-400">{d.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{d.value}</span>
              <span className="text-xs text-slate-400 w-8 text-right">{total > 0 ? Math.round((d.value / total) * 100) : 0}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
