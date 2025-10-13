import { Resend } from 'resend'

export async function sendDeviceVerificationEmail(
  email: string,
  token: string,
  appName: string,
) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY environment variable is not set')
  }

  const resend = new Resend(process.env.RESEND_API_KEY!)

  if (!process.env.APP_URL) {
    throw new Error('APP_URL environment variable is not set')
  }

  // Get normalized origin from request (works for all environments!)
  const origin = process.env.APP_URL!

  const verifyUrl = `${origin}/verify-device?token=${token}&email=${encodeURIComponent(email)}`

  await resend.emails.send({
    from: 'Youssef al-Tai <hello@youssefaltai.com>',
    to: [email],
    subject: `Verify new device - ${appName}`,
    html: `
      <h2>New Device Registration</h2>
      <p>A new device is trying to access your ${appName} account.</p>
      <p>If this was you, click the link below to verify:</p>
      <a href="${verifyUrl}">Verify Device</a>
      <p>This link expires in 15 minutes.</p>
      <p>If you didn't request this, ignore this email.</p>
    `,
  })
}

