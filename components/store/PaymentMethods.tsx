
export default function PaymentMethods() {
  return (
    <section className="py-8 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800">
      <div className="container-base">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest text-center mb-5">
          Accepted Payment Methods
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">

          {/* Visa */}
          <div className="flex items-center justify-center h-10 px-5 rounded-lg bg-[#1A1F71] shadow-sm">
            <span className="text-white font-black italic text-xl tracking-tight">VISA</span>
          </div>

          {/* Mastercard */}
          <div className="flex items-center justify-center h-10 px-4 rounded-lg bg-white border border-slate-200 dark:border-slate-700 shadow-sm gap-1">
            <span className="w-6 h-6 rounded-full bg-[#EB001B] inline-block -mr-2" />
            <span className="w-6 h-6 rounded-full bg-[#F79E1B] inline-block opacity-90" />
            <span className="ml-2 text-xs font-bold text-slate-700 dark:text-slate-300">Mastercard</span>
          </div>

          {/* MTN MoMo */}
          <div className="flex items-center justify-center h-10 px-4 rounded-lg bg-[#FFCC00] shadow-sm gap-1.5">
            <span className="text-black font-black text-sm">MTN MoMo</span>
          </div>

          {/* Airtel Money */}
          <div className="flex items-center justify-center h-10 px-4 rounded-lg bg-[#E30613] shadow-sm">
            <span className="text-white font-black text-sm">Airtel Money</span>
          </div>

          {/* Apple Pay */}
          <div className="flex items-center justify-center h-10 px-5 rounded-lg bg-black shadow-sm gap-1">
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white" xmlns="http://www.w3.org/2000/svg">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
            <span className="text-white font-semibold text-sm">Apple Pay</span>
          </div>

          {/* Afripay */}
          <div className="flex items-center justify-center h-10 px-4 rounded-lg bg-[#00A859] shadow-sm gap-1.5">
            <span className="text-white font-black text-sm">Afripay</span>
          </div>

        </div>
        <p className="text-[11px] text-slate-400 text-center mt-4">
          Secure payments · All methods accepted
        </p>
      </div>
    </section>
  );
}
