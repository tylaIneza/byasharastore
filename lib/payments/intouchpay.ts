import crypto from "crypto";

const BASE_URL = process.env.INTOUCH_BASE_URL ?? "https://www.intouchpay.co.rw";
const USERNAME = process.env.INTOUCH_USERNAME ?? "";
const ACCOUNT_ID = process.env.INTOUCH_ACCOUNT_ID ?? "";
const PARTNER_PASSWORD = process.env.INTOUCH_PARTNER_PASSWORD ?? "";
const CALLBACK_URL = process.env.INTOUCH_CALLBACK_URL ?? "";

export function isConfigured() {
  return !!(USERNAME && ACCOUNT_ID && PARTNER_PASSWORD);
}

// Normalize Rwanda phone to 250XXXXXXXXX format
function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("250")) return digits;
  if (digits.startsWith("0")) return "250" + digits.slice(1);
  return "250" + digits;
}

function ts() {
  return new Date().toISOString().replace(/\D/g, "").slice(0, 14);
}

function makePassword(timestamp: string) {
  return crypto
    .createHash("sha256")
    .update(USERNAME + ACCOUNT_ID + PARTNER_PASSWORD + timestamp)
    .digest("hex");
}

export async function requestPayment(params: {
  amount: number;
  phone: string;
  requestTransactionId: string;
}) {
  const t = ts();
  const body = new URLSearchParams({
    username: USERNAME,
    timestamp: t,
    amount: String(Math.round(params.amount)),
    password: makePassword(t),
    mobilephone: normalizePhone(params.phone),
    requesttransactionid: params.requestTransactionId,
    accountno: ACCOUNT_ID,
    callbackurl: CALLBACK_URL,
  });

  const res = await fetch(`${BASE_URL}/api/requestpayment/`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!res.ok) throw new Error(`IntouchPay requestPayment ${res.status}: ${await res.text()}`);
  const data = await res.json();

  // responsecode 1000 = Pending (success — awaiting subscriber confirmation)
  if (data.responsecode !== "1000" && !data.success) {
    throw new Error(`IntouchPay ${data.responsecode}: ${data.message ?? "Unknown error"}`);
  }
  return data as {
    status: string;
    requesttransactionid: string;
    success: boolean;
    responsecode: string;
    transactionid: number | string;
    message: string;
  };
}

export async function getTransactionStatus(params: {
  requestTransactionId: string;
  transactionId: string;
}) {
  const t = ts();
  const res = await fetch(`${BASE_URL}/api/gettransactionstatus/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: USERNAME,
      timestamp: t,
      password: makePassword(t),
      requesttransactionid: params.requestTransactionId,
      transactionid: params.transactionId,
    }),
  });
  if (!res.ok) throw new Error(`IntouchPay getTransactionStatus ${res.status}: ${await res.text()}`);
  return res.json() as Promise<{
    success: boolean;
    responsecode: string;
    status: string;
    message: string;
  }>;
}

export async function requestDeposit(params: {
  amount: number;
  phone: string;
  requestTransactionId: string;
  reason?: string;
}) {
  const t = ts();
  const body = new URLSearchParams({
    username: USERNAME,
    timestamp: t,
    amount: String(Math.round(params.amount)),
    password: makePassword(t),
    mobilephone: normalizePhone(params.phone),
    requesttransactionid: params.requestTransactionId,
    accountno: ACCOUNT_ID,
    reason: params.reason ?? "Byashara Store Withdrawal",
    sid: "1",
    withdrawcharge: "0",
  });

  const res = await fetch(`${BASE_URL}/api/requestdeposit/`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
  if (!res.ok) throw new Error(`IntouchPay requestDeposit ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data as {
    requesttransactionid: string;
    referenceid?: string;
    responsecode: string;
    success: boolean;
    message?: string;
    statusdesc?: string;
  };
}

export async function getBalance() {
  const t = ts();
  const body = new URLSearchParams({
    username: USERNAME,
    timestamp: t,
    accountno: ACCOUNT_ID,
    password: makePassword(t),
  });
  const res = await fetch(`${BASE_URL}/api/getbalance/`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
  if (!res.ok) throw new Error(`IntouchPay getBalance ${res.status}: ${await res.text()}`);
  return res.json() as Promise<{
    balance: string;
    success: boolean;
    responsecode?: string;
    message?: string;
  }>;
}
