import { NextRequest, NextResponse } from "next/server";
import * as momo from "@/lib/payments/momo";
import * as airtel from "@/lib/payments/airtel";
import * as intouchpay from "@/lib/payments/intouchpay";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ referenceId: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const { referenceId } = await params;
  const method = req.nextUrl.searchParams.get("method");

  try {
    let status: "PENDING" | "SUCCESSFUL" | "FAILED";

    if (method === "MTN_MOMO") {
      status = await momo.checkPaymentStatus(referenceId);

    } else if (method === "AIRTEL_MONEY") {
      status = await airtel.checkPaymentStatus(referenceId);

    } else if (method === "INTOUCHPAY") {
      const tx = await prisma.paymentTransaction.findUnique({
        where: { requestTransactionId: referenceId },
        select: { status: true, intouchTransactionId: true },
      });
      if (!tx) return NextResponse.json({ error: "Transaction not found" }, { status: 404 });

      // If still pending, ask IntouchPay directly (works without a public callback URL)
      if (tx.status === "Pending" && tx.intouchTransactionId) {
        try {
          const result = await intouchpay.getTransactionStatus({
            requestTransactionId: referenceId,
            transactionId: tx.intouchTransactionId,
          });
          // responsecode "01" = payment confirmed by subscriber
          if (result.responsecode === "01") {
            await prisma.paymentTransaction.update({
              where: { requestTransactionId: referenceId },
              data: { status: "Successful", responsecode: "01" },
            });
            return NextResponse.json({ status: "SUCCESSFUL" });
          }
          // any non-pending failure
          if (!result.success && result.responsecode !== "1000") {
            await prisma.paymentTransaction.update({
              where: { requestTransactionId: referenceId },
              data: { status: "Failed", responsecode: result.responsecode },
            });
            return NextResponse.json({ status: "FAILED" });
          }
        } catch {
          // network/parse error — keep polling
        }
      }

      const s = tx.status.toLowerCase();
      status = s === "successful" ? "SUCCESSFUL" : s === "failed" ? "FAILED" : "PENDING";

    } else {
      return NextResponse.json({ error: "Unknown payment method" }, { status: 400 });
    }

    return NextResponse.json({ status });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Payment status error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
