import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendOTPEmail } from "@/lib/mailer";
import { generateOTP } from "@/lib/utils";
import { rateLimit } from "@/lib/rateLimit";
import { sendOTPSchema } from "@/lib/validators/auth";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "unknown";
    if (!rateLimit(`otp:${ip}`, 3, 60_000)) {
      return NextResponse.json({ success: false, error: "Too many requests. Please wait." }, { status: 429 });
    }

    const body = await req.json();
    const parsed = sendOTPSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Invalid email address" }, { status: 400 });
    }

    const email = parsed.data.email.toLowerCase().trim();

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive) {
      // Return success to avoid email enumeration
      return NextResponse.json({ success: true, message: "If that email exists, an OTP has been sent." });
    }

    // Invalidate previous OTPs
    await prisma.oTPCode.updateMany({
      where: { email, used: false },
      data: { used: true },
    });

    const code = generateOTP();
    const expires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await prisma.oTPCode.create({ data: { email, code, expires } });

    const smtpConfigured = process.env.SMTP_USER && !process.env.SMTP_USER.includes("your-email");

    if (smtpConfigured) {
      await sendOTPEmail(email, code, user.name);
    } else {
      // Dev mode: print OTP to terminal so you can log in without SMTP
      console.log("\n" + "=".repeat(50));
      console.log(`  🔑  OTP for ${email}: ${code}`);
      console.log("=".repeat(50) + "\n");
    }

    return NextResponse.json({ success: true, message: "OTP sent to your email." });
  } catch (err) {
    console.error("send-otp error:", err);
    return NextResponse.json({ success: false, error: "Failed to send OTP" }, { status: 500 });
  }
}
