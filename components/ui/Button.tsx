"use client";
import { forwardRef, ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "accent";
  size?: "sm" | "md" | "lg" | "xl";
  loading?: boolean;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, fullWidth, children, disabled, ...props }, ref) => {
    const base = "inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none";

    const variants = {
      primary: "bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-sm hover:shadow-md focus-visible:ring-[#2563EB]",
      secondary: "bg-slate-100 hover:bg-slate-200 text-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-100",
      outline: "border-2 border-[#2563EB] text-[#2563EB] hover:bg-[#2563EB] hover:text-white",
      ghost: "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300",
      danger: "bg-[#EF4444] hover:bg-red-600 text-white shadow-sm focus-visible:ring-[#EF4444]",
      accent: "bg-[#FF6B00] hover:bg-orange-600 text-white shadow-sm focus-visible:ring-[#FF6B00]",
    };

    const sizes = {
      sm: "h-8 px-3 text-xs",
      md: "h-10 px-4 text-sm",
      lg: "h-11 px-6 text-base",
      xl: "h-13 px-8 text-lg",
    };

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], fullWidth && "w-full", className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
