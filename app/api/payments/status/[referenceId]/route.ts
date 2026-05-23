import { NextRequest, NextResponse } from "next/server";
import * as momo from "@/lib/payments/momo";
import * as airtel from "@/lib/payments/airtel";

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
