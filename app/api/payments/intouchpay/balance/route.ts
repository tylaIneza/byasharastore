import { NextResponse } from "next/server";
import * as intouchpay from "@/lib/payments/intouchpay";

export async function GET() {
  if (!intouchpay.isConfigured()) {
    return NextResponse.json({ error: "IntouchPay credentials not configured" }, { status: 503 });
  }
  try {
    const data = await intouchpay.getBalance();
    return NextResponse.json(data);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("IntouchPay balance error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
