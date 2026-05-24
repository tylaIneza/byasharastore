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
