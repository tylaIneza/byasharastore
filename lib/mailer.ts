import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendOTPEmail(email: string, otp: string, name?: string): Promise<void> {
  const from = process.env.SMTP_FROM ?? "BYASHARA STORE <noreply@byashara.com>";
  await transporter.sendMail({
    from,
    to: email,
    subject: "Your BYASHARA Admin Login Code",
    html: `
      <div style="font-family:Inter,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#fff;border-radius:12px;border:1px solid #e2e8f0;">
        <div style="text-align:center;margin-bottom:32px;">
          <h1 style="font-size:24px;font-weight:800;color:#0F172A;margin:0;">
            BY<span style="color:#2563EB;">ASHARA</span>
          </h1>
          <p style="color:#64748b;font-size:13px;margin:4px 0 0;">Admin Portal</p>
        </div>
        <h2 style="font-size:18px;font-weight:600;color:#0F172A;margin:0 0 8px;">Your login code</h2>
        <p style="color:#475569;font-size:14px;margin:0 0 24px;">
          Hi ${name ?? "Admin"}, use the code below to log in. It expires in <strong>5 minutes</strong>.
        </p>
        <div style="background:#F8FAFC;border:2px dashed #CBD5E1;border-radius:8px;padding:24px;text-align:center;margin:0 0 24px;">
          <span style="font-size:36px;font-weight:800;letter-spacing:12px;color:#2563EB;">${otp}</span>
        </div>
        <p style="color:#94a3b8;font-size:12px;margin:0;">
          If you didn't request this code, you can safely ignore this email.
        </p>
      </div>
    `,
  });
}

export async function sendAdminOrderNotification(opts: {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  items: { productName: string; quantity: number; totalPrice: number }[];
  total: number;
  deliveryAddress: string;
  paymentMethod: string;
}): Promise<void> {
  const from = process.env.SMTP_FROM ?? "BYASHARA STORE <noreply@byashara.com>";
  const { orderNumber, customerName, customerPhone, items, total, deliveryAddress, paymentMethod } = opts;

  const itemRows = items
    .map(
      (i) =>
        `<tr>
          <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;">${i.productName}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;text-align:center;">${i.quantity}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;text-align:right;font-weight:600;">${i.totalPrice.toLocaleString()} RWF</td>
        </tr>`
    )
    .join("");

  await transporter.sendMail({
    from,
    to: "inezapaccy45@gmail.com, nyanafaith122@gmail.com",
    subject: `🛒 New Order ${orderNumber} — ${total.toLocaleString()} RWF`,
    html: `
      <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px;background:#fff;border-radius:12px;border:1px solid #e2e8f0;">
        <h1 style="font-size:22px;font-weight:800;color:#0F172A;margin:0 0 24px;">
          BY<span style="color:#2563EB;">ASHARA</span> STORE
        </h1>
        <div style="background:#EFF6FF;border-left:4px solid #2563EB;border-radius:8px;padding:16px 20px;margin-bottom:24px;">
          <p style="margin:0;font-size:16px;font-weight:700;color:#1e3a8a;">🛒 New Order Received!</p>
          <p style="margin:4px 0 0;font-size:13px;color:#3b82f6;">Order <strong>${orderNumber}</strong></p>
        </div>
        <table style="width:100%;border-collapse:collapse;margin-bottom:20px;font-size:14px;">
          <tr>
            <td style="padding:8px 0;color:#64748b;width:140px;">Customer</td>
            <td style="padding:8px 0;font-weight:600;color:#0f172a;">${customerName}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#64748b;">Phone</td>
            <td style="padding:8px 0;font-weight:600;color:#0f172a;">${customerPhone}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#64748b;">Delivery Address</td>
            <td style="padding:8px 0;font-weight:600;color:#0f172a;">${deliveryAddress}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#64748b;">Payment Method</td>
            <td style="padding:8px 0;font-weight:600;color:#0f172a;">${paymentMethod}</td>
          </tr>
        </table>
        <p style="font-size:13px;font-weight:700;color:#0f172a;margin:0 0 8px;">Items Ordered</p>
        <table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:20px;">
          <thead>
            <tr style="background:#f8fafc;">
              <th style="padding:8px 12px;text-align:left;color:#64748b;font-weight:600;border-bottom:2px solid #e2e8f0;">Product</th>
              <th style="padding:8px 12px;text-align:center;color:#64748b;font-weight:600;border-bottom:2px solid #e2e8f0;">Qty</th>
              <th style="padding:8px 12px;text-align:right;color:#64748b;font-weight:600;border-bottom:2px solid #e2e8f0;">Total</th>
            </tr>
          </thead>
          <tbody>${itemRows}</tbody>
        </table>
        <div style="background:#f0fdf4;border-radius:8px;padding:16px 20px;text-align:right;">
          <span style="font-size:13px;color:#166534;">Order Total &nbsp;</span>
          <span style="font-size:20px;font-weight:800;color:#16a34a;">${total.toLocaleString()} RWF</span>
        </div>
        <p style="font-size:12px;color:#94a3b8;margin:24px 0 0;text-align:center;">
          BYASHARA STORE — Rwanda &amp; Eastern DRC
        </p>
      </div>
    `,
  });
}

export async function sendOrderConfirmationEmail(
  email: string,
  customerName: string,
  orderNumber: string,
  total: number
): Promise<void> {
  const from = process.env.SMTP_FROM ?? "BYASHARA STORE <noreply@byashara.com>";
  await transporter.sendMail({
    from,
    to: email,
    subject: `Order Confirmation — ${orderNumber}`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#fff;border-radius:12px;border:1px solid #e2e8f0;">
        <h1 style="font-size:24px;font-weight:800;color:#0F172A;">BY<span style="color:#2563EB;">ASHARA</span></h1>
        <h2 style="color:#10B981;">✓ Order Confirmed</h2>
        <p>Dear ${customerName},</p>
        <p>Your order <strong>${orderNumber}</strong> has been received and is being processed.</p>
        <p><strong>Total: ${total.toLocaleString()} RWF</strong></p>
        <p>We will contact you shortly to arrange delivery.</p>
        <p style="color:#64748b;font-size:12px;">BYASHARA STORE — Rwanda & Eastern DRC</p>
      </div>
    `,
  });
}
