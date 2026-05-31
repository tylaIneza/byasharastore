import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// IntouchPay POSTs here when a RequestPayment is confirmed by the subscriber
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const payload = body.jsonpayload ?? body;

    const {
      requesttransactionid,
      transactionid,
      responsecode,
      status,
      statusdesc,
      referenceno,
    } = payload;

    if (!requesttransactionid) {
      return NextResponse.json({ message: "missing requesttransactionid" }, { status: 400 });
    }

    const tx = await prisma.paymentTransaction.findUnique({
      where: { requestTransactionId: String(requesttransactionid) },
    });

    if (tx) {
      await prisma.paymentTransaction.update({
        where: { requestTransactionId: String(requesttransactionid) },
        data: {
          intouchTransactionId: transactionid ? String(transactionid) : undefined,
          status: responsecode === "01" ? "Successful" : "Failed",
          responsecode: responsecode ? String(responsecode) : undefined,
          referenceNo: referenceno ? String(referenceno) : undefined,
          description: statusdesc ?? status ?? undefined,
        },
      });
    }

    return NextResponse.json({ message: "success", success: true, request_id: requesttransactionid });
  } catch (err) {
    console.error("IntouchPay callback error:", err);
    return NextResponse.json({ message: "error" }, { status: 500 });
  }
}
