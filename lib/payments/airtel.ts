const BASE_URL     = process.env.AIRTEL_BASE_URL     ?? "https://openapi.airtel.africa";
const CLIENT_ID    = process.env.AIRTEL_CLIENT_ID    ?? "";
const CLIENT_SECRET= process.env.AIRTEL_CLIENT_SECRET ?? "";
const COUNTRY      = process.env.AIRTEL_COUNTRY      ?? "RW";
const CURRENCY     = process.env.AIRTEL_CURRENCY     ?? "RWF";

export function isAirtelConfigured() {
  return !!(CLIENT_ID && CLIENT_SECRET);
}

async function getAccessToken(): Promise<string> {
  const res = await fetch(`${BASE_URL}/auth/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ client_id: CLIENT_ID, client_secret: CLIENT_SECRET, grant_type: "client_credentials" }),
  });
  if (!res.ok) throw new Error(`Airtel token error: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data.access_token;
}

export async function requestToPay(params: {
  amount: number;
  phone: string;
  referenceId: string;
  description: string;
}): Promise<void> {
  const token = await getAccessToken();
  const res = await fetch(`${BASE_URL}/merchant/v1/payments/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "X-Country": COUNTRY,
      "X-Currency": CURRENCY,
    },
    body: JSON.stringify({
      reference: params.referenceId,
      subscriber: { country: COUNTRY, currency: CURRENCY, msisdn: params.phone.replace(/\D/g, "") },
      transaction: { amount: Math.round(params.amount), id: params.referenceId, country: COUNTRY, currency: CURRENCY },
    }),
  });
  if (!res.ok) throw new Error(`Airtel payment failed: ${res.status} ${await res.text()}`);
}

export async function checkPaymentStatus(referenceId: string): Promise<"PENDING" | "SUCCESSFUL" | "FAILED"> {
  const token = await getAccessToken();
  const res = await fetch(`${BASE_URL}/standard/v1/payments/${referenceId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "X-Country": COUNTRY,
      "X-Currency": CURRENCY,
    },
  });
  if (!res.ok) throw new Error(`Airtel status error: ${res.status}`);
  const data = await res.json();
  // Airtel returns status codes: TS (success), TF (failed), TIP (in progress)
  const status = data?.data?.transaction?.status;
  if (status === "TS") return "SUCCESSFUL";
  if (status === "TF") return "FAILED";
  return "PENDING";
}
