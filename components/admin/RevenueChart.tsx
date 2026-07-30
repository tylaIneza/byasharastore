"use client";
import {
  ResponsiveContainer, ComposedChart, Area, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

interface DataPoint { date: string; revenue: number; orders: number }
interface Props { data: DataPoint[] }

function CustomTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: { value: number; name: string; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 shadow-xl min-w-[140px]">
      <p className="text-xs text-slate-400 mb-2 pb-2 border-b border-slate-100 dark:border-slate-800">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2 mt-1.5">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: entry.color }} />
          <span className="text-xs text-slate-500 capitalize">{entry.name}:</span>
          <span className="text-xs font-bold text-slate-900 dark:text-white ml-auto">
            {entry.name === "revenue" ? formatCurrency(entry.value) : `${entry.value}`}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function RevenueChart({ data }: Props) {
  if (!data.length) {
    return (
      <div className="h-64 flex flex-col items-center justify-center gap-2 text-slate-400">
        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xl">📊</div>
        <p className="text-sm">No revenue data yet</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <ComposedChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <defs>
          <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#2563EB" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: "#94a3b8" }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
          tickFormatter={(v) => new Date(v).toLocaleDateString("en", { day: "numeric", month: "short" })}
        />
        <YAxis
          yAxisId="rev"
          tick={{ fontSize: 11, fill: "#94a3b8" }}
          axisLine={false}
          tickLine={false}
          width={50}
          tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)}
        />
        <YAxis
          yAxisId="ord"
          orientation="right"
          tick={{ fontSize: 11, fill: "#94a3b8" }}
          axisLine={false}
          tickLine={false}
          width={28}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          yAxisId="rev"
          type="monotone"
          dataKey="revenue"
          stroke="#2563EB"
          strokeWidth={2.5}
          fill="url(#revGrad)"
          dot={false}
          activeDot={{ r: 5, fill: "#2563EB", stroke: "white", strokeWidth: 2 }}
        />
        <Line
          yAxisId="ord"
          type="monotone"
          dataKey="orders"
          stroke="#10B981"
          strokeWidth={2}
          dot={false}
          strokeDasharray="5 3"
          activeDot={{ r: 4, fill: "#10B981", stroke: "white", strokeWidth: 2 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
