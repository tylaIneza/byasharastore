// WhatsApp notifications via CallMeBot (free)
// Each number must be activated once — see README or env comments for instructions.

interface WARecipient {
  phone: string;
  apiKey: string;
}

const RECIPIENTS: WARecipient[] = [
  { phone: process.env.CALLMEBOT_PHONE_1 ?? "", apiKey: process.env.CALLMEBOT_APIKEY_1 ?? "" },
  { phone: process.env.CALLMEBOT_PHONE_2 ?? "", apiKey: process.env.CALLMEBOT_APIKEY_2 ?? "" },
].filter((r) => r.phone && r.apiKey);

export async function sendWhatsAppOrderNotification(opts: {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  total: number;
  deliveryAddress: string;
  itemCount: number;
}): Promise<void> {
  const { orderNumber, customerName, customerPhone, total, deliveryAddress, itemCount } = opts;

  const message =
    `🛒 *New Order — NEWGEN STORE*\n` +
    `━━━━━━━━━━━━━━━━━\n` +
    `📦 Order: *${orderNumber}*\n` +
    `👤 Customer: ${customerName}\n` +
    `📞 Phone: ${customerPhone}\n` +
    `📍 Address: ${deliveryAddress}\n` +
    `🛍️ Items: ${itemCount}\n` +
    `💰 Total: *${total.toLocaleString()} RWF*\n` +
    `━━━━━━━━━━━━━━━━━\n` +
    `Login to admin to confirm: /admin/orders`;

  await Promise.allSettled(
    RECIPIENTS.map(({ phone, apiKey }) => {
      const url = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encodeURIComponent(message)}&apikey=${apiKey}`;
      return fetch(url);
    })
  );
}
