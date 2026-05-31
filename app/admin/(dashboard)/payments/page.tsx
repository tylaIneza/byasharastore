"use client";
import { useState, useEffect, useCallback } from "react";
import {
  Wallet, ArrowDownCircle, ArrowUpCircle, Clock, RefreshCw,
  SendHorizonal, X, Phone, DollarSign, FileText, CheckCircle2, XCircle, Loader2,
} from "lucide-react";
import { formatCurrency, formatDateTime } from "@/lib/utils";

type Tx = {
  id: string;
  requestTransactionId: string;
  intouchTransactionId: string | null;
  type: "INCOMING" | "OUTGOING";
  amount: number;
  phone: string;
  status: string;
  responsecode: string | null;
  referenceNo: string | null;
  description: string | null;
  createdAt: string;
};

type Stats = { totalReceived: number; totalWithdrawn: number; pendingCount: number };

const STATUS_COLORS: Record<string, string> = {
  Successful: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  Failed:     "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  Pending:    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
};

export default function AdminPaymentsPage() {
  const [balance, setBalance] = useState<string | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [balanceError, setBalanceError] = useState("");

  const [txs, setTxs] = useState<Tx[]>([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<Stats>({ totalReceived: 0, totalWithdrawn: 0, pendingCount: 0 });
  const [txLoading, setTxLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("");
  const [page, setPage] = useState(1);

  const [showWithdraw, setShowWithdraw] = useState(false);
  const [wPhone, setWPhone] = useState("");
  const [wAmount, setWAmount] = useState("");
  const [wReason, setWReason] = useState("");
  const [wLoading, setWLoading] = useState(false);
  const [wResult, setWResult] = useState<{ success: boolean; message: string } | null>(null);

  const fetchBalance = useCallback(async () => {
    setBalanceLoading(true);
    setBalanceError("");
    try {
      const res = await fetch("/api/payments/intouchpay/balance");
      const data = await res.json();
      if (data.success) setBalance(data.balance);
      else setBalanceError(data.error ?? data.message ?? "Failed to fetch balance");
    } catch {
      setBalanceError("Network error");
    } finally {
      setBalanceLoading(false);
    }
  }, []);

  const fetchTxs = useCallback(async () => {
    setTxLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), ...(typeFilter && { type: typeFilter }) });
      const res = await fetch(`/api/payments/intouchpay/transactions?${params}`);
      const data = await res.json();
      if (data.success) {
        setTxs(data.data);
        setTotal(data.total);
        setStats(data.stats);
      }
    } finally {
      setTxLoading(false);
    }
  }, [page, typeFilter]);

  useEffect(() => { fetchBalance(); }, [fetchBalance]);
  useEffect(() => { fetchTxs(); }, [fetchTxs]);

  async function handleWithdraw() {
    if (!wPhone || !wAmount || isNaN(Number(wAmount)) || Number(wAmount) <= 0) return;
    setWLoading(true);
    setWResult(null);
    try {
      const res = await fetch("/api/payments/intouchpay/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: wPhone, amount: Number(wAmount), reason: wReason || undefined }),
      });
      const data = await res.json();
      if (data.success) {
        setWResult({ success: true, message: `Withdrawal of ${formatCurrency(Number(wAmount))} sent to ${wPhone}. Ref: ${data.referenceId ?? data.requestTransactionId}` });
        setWPhone(""); setWAmount(""); setWReason("");
        fetchBalance();
        fetchTxs();
      } else {
        setWResult({ success: false, message: data.error ?? "Withdrawal failed" });
      }
    } catch (err) {
      setWResult({ success: false, message: "Network error" });
    } finally {
      setWLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Payments</h1>
          <p className="text-sm text-slate-500">IntouchPay gateway — balance, transactions & withdrawals</p>
        </div>
        <button
          onClick={() => setShowWithdraw(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2563EB] text-white text-sm font-semibold hover:bg-[#1D4ED8] transition-colors shadow-sm"
        >
          <SendHorizonal className="w-4 h-4" />
          Withdraw
        </button>
      </div>

      {/* Balance + Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Balance */}
        <div className="bg-gradient-to-br from-[#1D4ED8] to-[#2563EB] rounded-2xl p-5 text-white col-span-1 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5 opacity-80" />
              <span className="text-sm font-semibold opacity-80">Account Balance</span>
            </div>
            <button
              onClick={fetchBalance}
              disabled={balanceLoading}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              title="Refresh balance"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${balanceLoading ? "animate-spin" : ""}`} />
            </button>
          </div>
          {balanceLoading ? (
            <div className="h-9 w-32 bg-white/20 animate-pulse rounded-lg" />
          ) : balanceError ? (
            <p className="text-sm text-red-300">{balanceError}</p>
          ) : balance !== null ? (
            <p className="text-3xl font-black">{formatCurrency(Number(balance))}</p>
          ) : (
            <button onClick={fetchBalance} className="text-sm opacity-70 underline">Load balance</button>
          )}
          <p className="text-xs opacity-60 mt-1">IntouchPay RWF</p>
        </div>

        {/* Total Received */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <ArrowDownCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <span className="text-sm font-semibold text-slate-500">Total Received</span>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{formatCurrency(stats.totalReceived)}</p>
          <p className="text-xs text-slate-400 mt-1">Successful collections</p>
        </div>

        {/* Total Withdrawn */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <ArrowUpCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <span className="text-sm font-semibold text-slate-500">Total Withdrawn</span>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{formatCurrency(stats.totalWithdrawn)}</p>
          <p className="text-xs text-slate-400 mt-1">Successful withdrawals</p>
        </div>

        {/* Pending */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <span className="text-sm font-semibold text-slate-500">Pending</span>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.pendingCount}</p>
          <p className="text-xs text-slate-400 mt-1">Awaiting confirmation</p>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-3">
          <h2 className="font-bold text-slate-900 dark:text-white">Transactions</h2>
          <div className="flex gap-2">
            {(["", "INCOMING", "OUTGOING"] as const).map((t) => (
              <button
                key={t}
                onClick={() => { setTypeFilter(t); setPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                  typeFilter === t
                    ? "bg-[#2563EB] text-white border-[#2563EB]"
                    : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-[#2563EB]"
                }`}
              >
                {t || "All"}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                {["Type", "Phone", "Amount", "Status", "Reference", "Description", "Date"].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/80">
              {txLoading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j} className="px-5 py-3">
                          <div className="h-4 bg-slate-100 dark:bg-slate-800 animate-pulse rounded" />
                        </td>
                      ))}
                    </tr>
                  ))
                : txs.length === 0
                ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-sm text-slate-400">No transactions yet</td>
                  </tr>
                )
                : txs.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-5 py-3">
                      {tx.type === "INCOMING" ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                          <ArrowDownCircle className="w-3.5 h-3.5" /> Received
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-orange-600 dark:text-orange-400">
                          <ArrowUpCircle className="w-3.5 h-3.5" /> Withdrawn
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-slate-700 dark:text-slate-300">{tx.phone}</td>
                    <td className="px-5 py-3 font-bold text-slate-900 dark:text-white">{formatCurrency(Number(tx.amount))}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold ${STATUS_COLORS[tx.status] ?? STATUS_COLORS.Pending}`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-slate-400">{tx.referenceNo ?? tx.requestTransactionId.slice(0, 12) + "…"}</td>
                    <td className="px-5 py-3 text-xs text-slate-500 max-w-[200px] truncate">{tx.description ?? "—"}</td>
                    <td className="px-5 py-3 text-xs text-slate-400 whitespace-nowrap">{formatDateTime(tx.createdAt)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        {total > 20 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 dark:border-slate-800">
            <p className="text-sm text-slate-500">{txs.length} of {total}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 rounded border border-slate-200 dark:border-slate-700 text-sm disabled:opacity-40">Prev</button>
              <button onClick={() => setPage(p => p + 1)} disabled={txs.length < 20} className="px-3 py-1 rounded border border-slate-200 dark:border-slate-700 text-sm disabled:opacity-40">Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Withdraw Modal */}
      {showWithdraw && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <SendHorizonal className="w-5 h-5 text-[#2563EB]" />
                <h3 className="font-bold text-slate-900 dark:text-white">Send Withdrawal</h3>
              </div>
              <button
                onClick={() => { setShowWithdraw(false); setWResult(null); }}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {wResult ? (
                <div className={`rounded-xl p-4 flex items-start gap-3 ${wResult.success ? "bg-emerald-50 dark:bg-emerald-900/20" : "bg-red-50 dark:bg-red-900/20"}`}>
                  {wResult.success
                    ? <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                    : <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />}
                  <p className={`text-sm font-medium ${wResult.success ? "text-emerald-700 dark:text-emerald-300" : "text-red-700 dark:text-red-300"}`}>
                    {wResult.message}
                  </p>
                </div>
              ) : null}

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" /> Recipient Phone
                </label>
                <input
                  type="tel"
                  value={wPhone}
                  onChange={(e) => setWPhone(e.target.value)}
                  placeholder="e.g. 250788000000"
                  disabled={wLoading}
                  className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB] disabled:opacity-60"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5" /> Amount (RWF)
                </label>
                <input
                  type="number"
                  min="1"
                  value={wAmount}
                  onChange={(e) => setWAmount(e.target.value)}
                  placeholder="e.g. 50000"
                  disabled={wLoading}
                  className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB] disabled:opacity-60"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" /> Reason <span className="normal-case font-normal text-slate-400">(optional)</span>
                </label>
                <input
                  type="text"
                  value={wReason}
                  onChange={(e) => setWReason(e.target.value)}
                  placeholder="e.g. Sales payout, Supplier payment"
                  disabled={wLoading}
                  className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB] disabled:opacity-60"
                />
              </div>

              <button
                onClick={handleWithdraw}
                disabled={wLoading || !wPhone || !wAmount || Number(wAmount) <= 0}
                className="w-full h-12 rounded-xl bg-[#2563EB] text-white text-sm font-bold flex items-center justify-center gap-2 hover:bg-[#1D4ED8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {wLoading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</>
                ) : (
                  <><SendHorizonal className="w-4 h-4" /> Send {wAmount ? formatCurrency(Number(wAmount)) : ""}</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
