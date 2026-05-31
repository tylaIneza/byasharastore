import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";
import * as intouchpay from "@/lib/payments/intouchpay";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!intouchpay.isConfigured()) {
    return NextResponse.json({ error: "IntouchPay is not configured" }, { status: 503 });
  }

  try {
    const { phone, amount, reason } = await req.json();

    if (!phone || !amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return NextResponse.json({ error: "phone and a positive amount are required" }, { status: 400 });
    }

    const requestTransactionId = `WD-${uuidv4().replace(/-/g, "").slice(0, 16).toUpperCase()}`;

    const record = await prisma.paymentTransaction.create({
      data: {
        requestTransactionId,
        type: "OUTGOING",
        amount: Number(amount),
        phone: String(phone),
        status: "Pending",
        description: reason ?? "Admin Withdrawal",
      },
    });

    const result = await intouchpay.requestDeposit({
      amount: Number(amount),
      phone: String(phone),
      requestTransactionId,
      reason: reason ?? "Byashara Store Withdrawal",
    });

    const finalStatus = result.success ? "Successful" : "Failed";

    await prisma.paymentTransaction.update({
      where: { id: record.id },
      data: {
        status: finalStatus,
        responsecode: result.responsecode,
        referenceNo: result.referenceid ?? undefined,
      },
    });

    return NextResponse.json({
      success: result.success,
      requestTransactionId,
      responsecode: result.responsecode,
      referenceId: result.referenceid,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("IntouchPay withdraw error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
