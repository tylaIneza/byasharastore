import { v4 as uuidv4 } from "uuid";

const BASE_URL = process.env.MTN_MOMO_BASE_URL ?? "https://sandbox.momodeveloper.mtn.com";
const SUB_KEY  = process.env.MTN_MOMO_SUBSCRIPTION_KEY ?? "";
const API_USER = process.env.MTN_MOMO_API_USER ?? "";
const API_KEY  = process.env.MTN_MOMO_API_KEY ?? "";
const ENV      = process.env.MTN_MOMO_ENVIRONMENT ?? "sandbox";
const CURRENCY = ENV === "sandbox" ? "EUR" : "RWF";

export function isMomoConfigured() {
  return !!(SUB_KEY && API_USER && API_KEY);
}

async function getAccessToken(): Promise<string> {
  const credentials = Buffer.from(`${API_USER}:${API_KEY}`).toString("base64");
  const res = await fetch(`${BASE_URL}/collection/token/`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Ocp-Apim-Subscription-Key": SUB_KEY,
    },
  });
  if (!res.ok) throw new Error(`MTN token error: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data.access_token;
}

export async function requestToPay(params: {
  amount: number;
  phone: string;
  externalId: string;
  description: string;
}): Promise<string> {
  const referenceId = uuidv4();
  const token = await getAccessToken();

  const res = await fetch(`${BASE_URL}/collection/v1_0/requesttopay`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "X-Reference-Id": referenceId,
      "X-Target-Environment": ENV,
      "Ocp-Apim-Subscription-Key": SUB_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: String(Math.round(params.amount)),
      currency: CURRENCY,
      externalId: params.externalId,
      payer: { partyIdType: "MSISDN", partyId: params.phone.replace(/\D/g, "") },
      payerMessage: params.description,
      payeeNote: "NEWGEN STORE",
    }),
  });

  if (res.status !== 202) {
    throw new Error(`MTN request failed: ${res.status} ${await res.text()}`);
  }
  return referenceId;
}

export async function checkPaymentStatus(referenceId: string): Promise<"PENDING" | "SUCCESSFUL" | "FAILED"> {
  const token = await getAccessToken();
  const res = await fetch(`${BASE_URL}/collection/v1_0/requesttopay/${referenceId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "X-Target-Environment": ENV,
      "Ocp-Apim-Subscription-Key": SUB_KEY,
    },
  });
  if (!res.ok) throw new Error(`MTN status error: ${res.status}`);
  const data = await res.json();
  return data.status; // "PENDING" | "SUCCESSFUL" | "FAILED"
}
