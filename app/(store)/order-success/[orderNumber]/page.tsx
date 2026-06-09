"use client";
import { useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Package, Truck, Phone, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useLanguageStore } from "@/store/language";
import { useCartStore } from "@/store/cart";

export default function OrderSuccessPage() {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const { t } = useLanguageStore();
  const clearCart = useCartStore((s) => s.clearCart);

  useEffect(() => { clearCart(); }, [clearCart]);

  const steps = [
    { icon: Phone,        color: "#2563EB", title: t.orderSuccess.reviewTitle,  desc: t.orderSuccess.reviewDesc },
    { icon: CheckCircle,  color: "#10B981", title: t.orderSuccess.confirmTitle, desc: t.orderSuccess.confirmDesc },
    { icon: Package,      color: "#FF6B00", title: t.orderSuccess.packTitle,    desc: t.orderSuccess.packDesc },
    { icon: Truck,        color: "#7C3AED", title: t.orderSuccess.deliverTitle, desc: t.orderSuccess.deliverDesc },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center py-16 px-4">
      <div className="max-w-lg w-full text-center">

        {/* Success icon */}
        <div className="w-24 h-24 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-12 h-12 text-emerald-500" />
        </div>

        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-3">
          {t.orderSuccess.title}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mb-6">
          {t.orderSuccess.subtitle}
        </p>

        {/* Order Number */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 mb-8">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            {t.orderSuccess.orderNumber}
          </p>
          <p className="text-2xl font-black text-[#2563EB] tracking-wider">{orderNumber}</p>
          <p className="text-xs text-slate-400 mt-2">{t.orderSuccess.saveNumber}</p>
        </div>

        {/* Next Steps */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 mb-8 text-left">
          <h2 className="font-bold text-slate-900 dark:text-white mb-4">{t.orderSuccess.whatNext}</h2>
          <div className="space-y-4">
            {steps.map(({ icon: Icon, color, title, desc }, i) => (
              <div key={i} className="flex gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: `${color}15` }}
                >
                  <Icon className="w-4 h-4" style={{ color }} />
                </div>
                <div>
                  <p className="font-semibold text-sm text-slate-800 dark:text-slate-200">{title}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/" className="flex-1">
            <Button variant="secondary" fullWidth>{t.orderSuccess.backHome}</Button>
          </Link>
          <Link href={`/track-order?order=${orderNumber}`} className="flex-1">
            <Button fullWidth className="group">
              {t.orderSuccess.trackOrder}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

      </div>
    </div>
  );
}
