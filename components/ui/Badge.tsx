import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info" | "outline";
  size?: "sm" | "md";
  className?: string;
}

export function Badge({ children, variant = "default", size = "sm", className }: BadgeProps) {
  const variants = {
    default: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    success: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    warning: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    danger: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    info: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    outline: "border border-slate-200 text-slate-700 dark:border-slate-700 dark:text-slate-300",
  };
  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-sm",
  };
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full font-medium", variants[variant], sizes[size], className)}>
      {children}
    </span>
  );
}

export function OrderStatusBadge({ status }: { status: string }) {
  const map: Record<string, { variant: BadgeProps["variant"]; label: string }> = {
    PENDING: { variant: "warning", label: "Pending" },
    CONFIRMED: { variant: "info", label: "Confirmed" },
    PROCESSING: { variant: "info", label: "Processing" },
    DISPATCHED: { variant: "default", label: "Dispatched" },
    DELIVERED: { variant: "success", label: "Delivered" },
    CANCELLED: { variant: "danger", label: "Cancelled" },
  };
  const config = map[status] ?? { variant: "default", label: status };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

export function ProductStatusBadge({ status }: { status: string }) {
  const map: Record<string, { variant: BadgeProps["variant"]; label: string }> = {
    DRAFT: { variant: "default", label: "Draft" },
    PENDING: { variant: "warning", label: "Pending" },
    ACTIVE: { variant: "success", label: "Active" },
    REJECTED: { variant: "danger", label: "Rejected" },
  };
  const config = map[status] ?? { variant: "default", label: status };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
