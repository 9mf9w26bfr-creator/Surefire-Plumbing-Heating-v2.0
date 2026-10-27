/**
 * SUREFIRE PLUMBING & HEATING — Email Service
 * Supports Resend (Free Tier) with graceful fallback in development.
 */

interface EmailPayload {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(payload: EmailPayload): Promise<{ success: boolean; id?: string; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.log('----------------------------------------------------');
    console.log('[EMAIL MOCK - Set RESEND_API_KEY in .env for live]');
    console.log(`To: ${Array.isArray(payload.to) ? payload.to.join(', ') : payload.to}`);
    console.log(`Subject: ${payload.subject}`);
    console.log('Content preview:');
    console.log(payload.text || payload.html.replace(/<[^>]*>?/gm, '').slice(0, 200));
    console.log('----------------------------------------------------');
    return { success: true, id: `mock-${Date.now()}` };
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || 'Surefire Plumbing <onboarding@resend.dev>',
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
        text: payload.text,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('[Email Delivery Error]', err);
      return { success: false, error: err };
    }

    const data = await response.json();
    return { success: true, id: data.id };
  } catch (error) {
    console.error('[Email Network Error]', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function sendVerificationCodeEmail(to: string, name: string, code: string) {
  const subject = `Your Surefire Verification Code: ${code}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 8px;">
      <h2 style="color: #1e3a8a; margin-top: 0;">Surefire Plumbing & Heating</h2>
      <p>Hello ${name || 'Customer'},</p>
      <p>Your one-time verification code to access your account is:</p>
      <div style="background-color: #f3f4f6; padding: 16px; text-align: center; font-size: 28px; font-weight: bold; letter-spacing: 4px; color: #1d4ed8; border-radius: 6px; margin: 20px 0;">
        ${code}
      </div>
      <p style="color: #6b7280; font-size: 14px;">This code will expire in 15 minutes. If you did not request this, please disregard this email.</p>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
      <p style="color: #9ca3af; font-size: 12px; margin-bottom: 0;">Surefire Plumbing & Heating &bull; Serving North West England &bull; 20+ Years Experience</p>
    </div>
  `;
  return sendEmail({ to, subject, html });
}

export async function sendBookingConfirmationEmail(booking: {
  referenceNumber: string;
  service: string;
  date: string;
  time: string;
  name: string;
  email?: string;
  phone: string;
  address: string;
  postcode: string;
  priceEstLo?: number;
  priceEstHi?: number;
}) {
  if (!booking.email) return;

  const subject = `Booking Confirmation: ${booking.referenceNumber} — Surefire Plumbing`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 8px;">
      <div style="border-bottom: 2px solid #2563eb; padding-bottom: 12px; margin-bottom: 20px;">
        <h2 style="color: #1e3a8a; margin: 0;">Surefire Plumbing & Heating</h2>
        <p style="color: #6b7280; font-size: 14px; margin: 4px 0 0;">North West England Professional Service</p>
      </div>

      <h3 style="color: #16a34a; margin-top: 0;">Booking Received!</h3>
      <p>Thank you <strong>${booking.name}</strong>, we have received your booking request.</p>

      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px; margin: 20px 0;">
        <p style="margin: 0 0 8px;"><strong>Reference:</strong> <span style="font-family: monospace; color: #2563eb;">${booking.referenceNumber}</span></p>
        <p style="margin: 0 0 8px;"><strong>Service:</strong> ${booking.service}</p>
        <p style="margin: 0 0 8px;"><strong>Appointment Date:</strong> ${booking.date}</p>
        <p style="margin: 0 0 8px;"><strong>Time Slot:</strong> ${booking.time}</p>
        <p style="margin: 0 0 8px;"><strong>Property Address:</strong> ${booking.address}, ${booking.postcode}</p>
        ${booking.priceEstLo && booking.priceEstHi ? `
          <p style="margin: 12px 0 0; padding-top: 12px; border-top: 1px dashed #cbd5e1; font-weight: bold; color: #1e3a8a;">
            Estimated Range: &pound;${booking.priceEstLo} &ndash; &pound;${booking.priceEstHi}
          </p>
        ` : ''}
      </div>

      <p style="font-size: 14px; color: #4b5563;">
        Our team will contact you on <strong>${booking.phone}</strong> to confirm technician dispatch details.
      </p>

      <div style="background-color: #eff6ff; border-radius: 6px; padding: 12px; font-size: 12px; color: #1e40af; margin-top: 24px;">
        <strong>Pricing Note:</strong> Online estimates are free. A standard &pound;40 call-out fee applies upon on-site attendance within 10 miles. Final price will be confirmed after on-site inspection.
      </div>
    </div>
  `;
  return sendEmail({ to: booking.email, subject, html });
}
