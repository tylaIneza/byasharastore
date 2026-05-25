"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, ArrowRight, RefreshCw, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const emailSchema = z.object({ email: z.string().email("Enter a valid email") });
const otpSchema = z.object({ otp: z.string().length(6, "OTP is 6 digits") });

export default function AdminLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  const emailForm = useForm<{ email: string }>({ resolver: zodResolver(emailSchema) });
  const otpForm = useForm<{ otp: string }>({ resolver: zodResolver(otpSchema) });

  async function onSendOTP(data: { email: string }) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email }),
      });
      const result = await res.json();
      if (result.success) {
        setEmail(data.email);
        setStep("otp");
        startResendCooldown();
      } else {
        setError(result.error ?? "Failed to send OTP");
      }
    } finally {
      setLoading(false);
    }
  }

  function startResendCooldown() {
    setResendCooldown(60);
    const interval = setInterval(() => {
      setResendCooldown((c) => {
        if (c <= 1) { clearInterval(interval); return 0; }
        return c - 1;
      });
    }, 1000);
  }

  async function onVerifyOTP(data: { otp: string }) {
    setLoading(true);
    setError("");
    try {
      const res = await signIn("otp", {
        email,
        otp: data.otp,
        redirect: false,
      });
      if (res?.ok) {
        sessionStorage.setItem("admin_tab_active", "1");
        router.push("/admin");
      } else {
        setError("Invalid or expired OTP. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function resendOTP() {
    if (resendCooldown > 0) return;
    setLoading(true);
    try {
      await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      startResendCooldown();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center px-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#2563EB]/10 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-[#7C3AED]/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-xl bg-[#2563EB] flex items-center justify-center">
              <span className="text-white font-black text-sm">BY</span>
            </div>
            <span className="font-black text-2xl text-white">
              BY<span className="text-[#60A5FA]">ASHARA</span>
            </span>
          </div>
          <p className="text-slate-400 text-sm">Admin Portal</p>
        </div>

        <div className="bg-[#1e293b] border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
          {step === "email" ? (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-[#2563EB]/20 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-[#60A5FA]" />
                </div>
                <div>
                  <h1 className="font-bold text-white text-lg">Sign In</h1>
                  <p className="text-slate-400 text-xs">Enter your admin email to receive an OTP</p>
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-900/30 border border-red-800 text-red-300 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={emailForm.handleSubmit(onSendOTP)} className="space-y-4">
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="admin@byashara.com"
                  error={emailForm.formState.errors.email?.message}
                  required
                  className="bg-[#0f172a] border-slate-700 text-white placeholder:text-slate-600"
                  {...emailForm.register("email")}
                />
                <Button type="submit" loading={loading} fullWidth size="lg" className="group">
                  Send OTP
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </form>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h1 className="font-bold text-white text-lg">Enter OTP</h1>
                  <p className="text-slate-400 text-xs">Check your email: {email}</p>
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-900/30 border border-red-800 text-red-300 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={otpForm.handleSubmit(onVerifyOTP)} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-300 block mb-1.5">
                    6-Digit OTP Code <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="000000"
                    className="w-full h-14 rounded-xl border border-slate-700 bg-[#0f172a] text-white text-center text-2xl font-black tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                    {...otpForm.register("otp")}
                  />
                  {otpForm.formState.errors.otp && (
                    <p className="text-xs text-red-400 mt-1">{otpForm.formState.errors.otp.message}</p>
                  )}
                </div>

                <Button type="submit" loading={loading} fullWidth size="lg">
                  Verify & Sign In
                </Button>
              </form>

              <div className="mt-4 flex items-center justify-between text-sm">
                <button
                  onClick={() => setStep("email")}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  ← Change email
                </button>
                <button
                  onClick={resendOTP}
                  disabled={resendCooldown > 0 || loading}
                  className="flex items-center gap-1.5 text-[#60A5FA] hover:text-white transition-colors disabled:opacity-50"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  {resendCooldown > 0 ? `Resend (${resendCooldown}s)` : "Resend OTP"}
                </button>
              </div>

              <p className="text-center text-xs text-slate-500 mt-4">
                OTP expires in 5 minutes
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
