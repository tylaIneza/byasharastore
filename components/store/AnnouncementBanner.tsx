"use client";
import { useEffect, useState } from "react";
import { X, Zap, AlertTriangle, AlertCircle, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type BannerType = "info" | "warning" | "danger" | "success";

interface Announcement {
  enabled: boolean;
  message: string;
  type: BannerType;
  dismissible: boolean;
}

const THEMES: Record<
  BannerType,
  { gradient: string; dot: string; ring: string; Icon: React.ElementType }
> = {
  info: {
    gradient: "from-blue-700 via-blue-600 to-indigo-700",
    dot: "bg-blue-300",
    ring: "ring-blue-400/40",
    Icon: Zap,
  },
  warning: {
    gradient: "from-amber-600 via-orange-500 to-amber-600",
    dot: "bg-amber-200",
    ring: "ring-amber-400/40",
    Icon: AlertTriangle,
  },
  danger: {
    gradient: "from-red-700 via-rose-600 to-red-700",
    dot: "bg-rose-300",
    ring: "ring-red-400/40",
    Icon: AlertCircle,
  },
  success: {
    gradient: "from-emerald-700 via-green-600 to-teal-700",
    dot: "bg-emerald-300",
    ring: "ring-emerald-400/40",
    Icon: CheckCircle,
  },
};

export default function AnnouncementBanner() {
  const [banner, setBanner] = useState<Announcement | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    function fetchBanner() {
      fetch("/api/announcement")
        .then((r) => r.json())
        .then((data: Announcement) => {
          if (data.enabled && data.message) {
            setBanner((prev) => {
              if (prev?.message !== data.message) setDismissed(false);
              return data;
            });
          } else {
            setBanner(null);
          }
        })
        .catch(() => {});
    }

    fetchBanner();

    window.addEventListener("store-update", fetchBanner);
    return () => window.removeEventListener("store-update", fetchBanner);
  }, []);

  const theme = banner ? THEMES[banner.type] : null;

  return (
    <AnimatePresence>
      {banner && !dismissed && theme && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
          className={`sticky top-16 z-40 overflow-hidden bg-gradient-to-r ${theme.gradient}`}
        >
          {/* Shimmer sweep */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="animate-banner-shimmer absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/15 to-transparent skew-x-[-20deg]" />
          </div>

          {/* Bottom border highlight */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-white/10" />

          <div className="relative px-10 sm:px-14 py-2.5 flex items-center justify-center min-h-[42px] gap-3">
            {/* Pulsing live dot with icon */}
            <span className="relative shrink-0 flex items-center justify-center">
              <span className={`absolute w-5 h-5 rounded-full ${theme.dot} opacity-40 animate-ping`} />
              <span className={`relative w-5 h-5 rounded-full ${theme.dot} ring-2 ${theme.ring} flex items-center justify-center`}>
                <theme.Icon className="w-2.5 h-2.5 text-white/90" strokeWidth={2.5} />
              </span>
            </span>

            {/* Message */}
            <p className="text-white text-xs sm:text-[13px] font-semibold tracking-wide text-center leading-snug [text-shadow:0_1px_2px_rgba(0,0,0,0.25)]">
              {banner.message}
            </p>

            {/* Dismiss */}
            {banner.dismissible && (
              <button
                onClick={() => setDismissed(true)}
                className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/25 text-white/70 hover:text-white transition-all"
                aria-label="Dismiss announcement"
              >
                <X className="w-3.5 h-3.5" strokeWidth={2.5} />
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
