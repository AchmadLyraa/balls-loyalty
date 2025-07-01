// Email utility functions for notifications
// This would integrate with services like SendGrid, Mailgun, or AWS SES

interface EmailData {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmail(data: EmailData) {
  // In production, integrate with actual email service
  console.log("Sending email:", data)

  // Example integration with SendGrid:
  /*
  const sgMail = require('@sendgrid/mail')
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
  
  const msg = {
    to: data.to,
    from: 'noreply@balls.com',
    subject: data.subject,
    text: data.text,
    html: data.html,
  }
  
  try {
    await sgMail.send(msg)
    return { success: true }
  } catch (error) {
    console.error('Email send error:', error)
    return { success: false, error: error.message }
  }
  */

  return { success: true }
}

export function generatePaymentApprovedEmail(customerName: string, points: number) {
  return {
    subject: "Pembayaran Anda Telah Disetujui - BALLS Loyalty",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #16a34a;">Pembayaran Disetujui!</h2>
        <p>Halo ${customerName},</p>
        <p>Pembayaran booking Anda telah disetujui dan Anda mendapatkan <strong>${points} poin loyalty</strong>!</p>
        <p>Poin ini dapat Anda gunakan untuk menukar berbagai hadiah menarik di aplikasi BALLS Loyalty.</p>
        <p>Terima kasih telah menggunakan layanan kami!</p>
        <hr>
        <p style="color: #666; font-size: 12px;">
          Email ini dikirim otomatis oleh sistem BALLS Loyalty Program.
        </p>
      </div>
    `,
    text: `Halo ${customerName}, pembayaran booking Anda telah disetujui dan Anda mendapatkan ${points} poin loyalty!`,
  }
}

export function generateRedemptionApprovedEmail(customerName: string, programName: string, qrCode: string) {
  return {
    subject: "Penukaran Hadiah Disetujui - BALLS Loyalty",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #16a34a;">Penukaran Hadiah Disetujui!</h2>
        <p>Halo ${customerName},</p>
        <p>Penukaran hadiah <strong>${programName}</strong> Anda telah disetujui!</p>
        <p>Silakan tunjukkan QR Code berikut kepada admin untuk mengambil hadiah:</p>
        <div style="text-align: center; margin: 20px 0;">
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px;">
            <p style="font-family: monospace; font-size: 18px; font-weight: bold;">${qrCode}</p>
          </div>
        </div>
        <p><strong>Catatan:</strong> QR Code ini berlaku selama 24 jam.</p>
        <hr>
        <p style="color: #666; font-size: 12px;">
          Email ini dikirim otomatis oleh sistem BALLS Loyalty Program.
        </p>
      </div>
    `,
    text: `Halo ${customerName}, penukaran hadiah ${programName} Anda telah disetujui! QR Code: ${qrCode}`,
  }
}
