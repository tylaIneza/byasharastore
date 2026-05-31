import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import * as momo from "@/lib/payments/momo";
import * as airtel from "@/lib/payments/airtel";
import * as intouchpay from "@/lib/payments/intouchpay";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { method, phone, amount, orderId } = await req.json();

    if (!phone || !amount || !method) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const referenceId = uuidv4();
    const description = `BYASHARA STORE — ${orderId ?? referenceId.slice(0, 8).toUpperCase()}`;

    if (method === "MTN_MOMO") {
      if (!momo.isMomoConfigured()) {
        return NextResponse.json({ error: "MTN MoMo is not configured yet. Please contact the store." }, { status: 503 });
      }
      const ref = await momo.requestToPay({ amount, phone, externalId: referenceId, description });
      return NextResponse.json({ success: true, referenceId: ref, method });
    }

    if (method === "AIRTEL_MONEY") {
      if (!airtel.isAirtelConfigured()) {
        return NextResponse.json({ error: "Airtel Money is not configured yet. Please contact the store." }, { status: 503 });
      }
      await airtel.requestToPay({ amount, phone, referenceId, description });
      return NextResponse.json({ success: true, referenceId, method });
    }

    if (method === "INTOUCHPAY") {
      if (!intouchpay.isConfigured()) {
        return NextResponse.json({ error: "IntouchPay is not configured yet. Please contact the store." }, { status: 503 });
      }
      const requestTransactionId = `PY-${referenceId.replace(/-/g, "").slice(0, 16).toUpperCase()}`;
      await prisma.paymentTransaction.create({
        data: {
          requestTransactionId,
          type: "INCOMING",
          amount: Number(amount),
          phone: String(phone).replace(/\D/g, ""),
          status: "Pending",
          description,
          orderId: orderId ?? null,
        },
      });
      const result = await intouchpay.requestPayment({ amount, phone, requestTransactionId });
      if (result.transactionid) {
        await prisma.paymentTransaction.update({
          where: { requestTransactionId },
          data: { intouchTransactionId: String(result.transactionid) },
        });
      }
      return NextResponse.json({ success: true, referenceId: requestTransactionId, method });
    }

    return NextResponse.json({ error: "Unsupported payment method" }, { status: 400 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Payment initiate error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
