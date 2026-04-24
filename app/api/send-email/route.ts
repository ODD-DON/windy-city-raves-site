import { NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      company,
      eventName,
      eventDate,
      venue,
      instagram,
      email,
      packageName,
      packagePrice,
      addons,
      totalPrice,
      assetsLink,
      message,
    } = body

    const addonsHtml = addons?.length 
      ? addons.map((a: { name: string; price: number }) => 
          `<div style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">
            <span style="color: #333;">${a.name}</span>
            <span style="float: right; color: #ef4444; font-weight: 600;">+$${a.price}</span>
          </div>`
        ).join("")
      : '<div style="color: #888; padding: 8px 0;">None selected</div>'

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 32px 24px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">New Promotion Inquiry</h1>
              <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Windy City Raves Media Kit</p>
            </td>
          </tr>
          
          <!-- Contact Info -->
          <tr>
            <td style="padding: 24px;">
              <h2 style="margin: 0 0 16px; font-size: 14px; font-weight: 600; color: #888; text-transform: uppercase; letter-spacing: 1px;">Contact Information</h2>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 12px 16px; background-color: #fafafa; border-radius: 8px; margin-bottom: 8px;">
                    <div style="color: #888; font-size: 12px; margin-bottom: 4px;">Name</div>
                    <div style="color: #333; font-size: 16px; font-weight: 600;">${name}</div>
                  </td>
                </tr>
                <tr><td style="height: 8px;"></td></tr>
                <tr>
                  <td style="padding: 12px 16px; background-color: #fafafa; border-radius: 8px;">
                    <div style="color: #888; font-size: 12px; margin-bottom: 4px;">Email</div>
                    <div style="color: #ef4444; font-size: 16px; font-weight: 600;">${email}</div>
                  </td>
                </tr>
                <tr><td style="height: 8px;"></td></tr>
                <tr>
                  <td style="padding: 12px 16px; background-color: #fafafa; border-radius: 8px;">
                    <div style="color: #888; font-size: 12px; margin-bottom: 4px;">Company / Brand</div>
                    <div style="color: #333; font-size: 16px;">${company || "Not provided"}</div>
                  </td>
                </tr>
                <tr><td style="height: 8px;"></td></tr>
                <tr>
                  <td style="padding: 12px 16px; background-color: #fafafa; border-radius: 8px;">
                    <div style="color: #888; font-size: 12px; margin-bottom: 4px;">Instagram</div>
                    <div style="color: #333; font-size: 16px;">${instagram ? `@${instagram.replace("@", "")}` : "Not provided"}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Event Details -->
          <tr>
            <td style="padding: 0 24px 24px;">
              <h2 style="margin: 0 0 16px; font-size: 14px; font-weight: 600; color: #888; text-transform: uppercase; letter-spacing: 1px;">Event Details</h2>
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fafafa; border-radius: 8px; padding: 16px;">
                <tr>
                  <td style="padding: 12px 16px;">
                    <div style="color: #888; font-size: 12px; margin-bottom: 4px;">Event Name</div>
                    <div style="color: #333; font-size: 18px; font-weight: 700;">${eventName}</div>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; border-top: 1px solid #e5e5e5;">
                    <div style="color: #888; font-size: 12px; margin-bottom: 4px;">Date</div>
                    <div style="color: #333; font-size: 16px;">${eventDate || "Not specified"}</div>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; border-top: 1px solid #e5e5e5;">
                    <div style="color: #888; font-size: 12px; margin-bottom: 4px;">Venue</div>
                    <div style="color: #333; font-size: 16px;">${venue || "Not provided"}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Package Selection -->
          <tr>
            <td style="padding: 0 24px 24px;">
              <h2 style="margin: 0 0 16px; font-size: 14px; font-weight: 600; color: #888; text-transform: uppercase; letter-spacing: 1px;">Package Selection</h2>
              <div style="background: linear-gradient(135deg, #fef2f2 0%, #fff 100%); border: 2px solid #ef4444; border-radius: 12px; padding: 20px; text-align: center;">
                <div style="font-size: 24px; font-weight: 700; color: #333;">${packageName}</div>
                <div style="font-size: 32px; font-weight: 800; color: #ef4444; margin: 8px 0;">${packagePrice > 0 ? `$${packagePrice}` : "Custom"}</div>
              </div>
            </td>
          </tr>
          
          <!-- Add-ons -->
          <tr>
            <td style="padding: 0 24px 24px;">
              <h2 style="margin: 0 0 16px; font-size: 14px; font-weight: 600; color: #888; text-transform: uppercase; letter-spacing: 1px;">Add-Ons</h2>
              <div style="background-color: #fafafa; border-radius: 8px; padding: 16px;">
                ${addonsHtml}
              </div>
            </td>
          </tr>
          
          <!-- Total -->
          <tr>
            <td style="padding: 0 24px 24px;">
              <div style="background-color: #1a1a1a; border-radius: 12px; padding: 24px; text-align: center;">
                <div style="color: rgba(255,255,255,0.7); font-size: 14px; margin-bottom: 4px;">Estimated Total</div>
                <div style="color: #ffffff; font-size: 40px; font-weight: 800;">$${totalPrice}</div>
              </div>
            </td>
          </tr>
          
          <!-- Assets Link -->
          ${assetsLink ? `
          <tr>
            <td style="padding: 0 24px 24px;">
              <h2 style="margin: 0 0 16px; font-size: 14px; font-weight: 600; color: #888; text-transform: uppercase; letter-spacing: 1px;">Assets Link</h2>
              <div style="background-color: #fafafa; border-radius: 8px; padding: 16px;">
                <a href="${assetsLink}" style="color: #ef4444; word-break: break-all;">${assetsLink}</a>
              </div>
            </td>
          </tr>
          ` : ""}
          
          <!-- Message -->
          ${message ? `
          <tr>
            <td style="padding: 0 24px 24px;">
              <h2 style="margin: 0 0 16px; font-size: 14px; font-weight: 600; color: #888; text-transform: uppercase; letter-spacing: 1px;">Message</h2>
              <div style="background-color: #fafafa; border-radius: 8px; padding: 16px; color: #333; line-height: 1.6;">
                ${message.replace(/\n/g, "<br>")}
              </div>
            </td>
          </tr>
          ` : ""}
          
          <!-- Footer -->
          <tr>
            <td style="padding: 24px; background-color: #fafafa; text-align: center; border-top: 1px solid #e5e5e5;">
              <p style="margin: 0; color: #888; font-size: 14px;">
                Reply directly to this email to respond to <strong style="color: #333;">${name}</strong>
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`.trim()

    await transporter.sendMail({
      from: `"Windy City Raves" <${process.env.GMAIL_USER}>`,
      to: process.env.CONTACT_EMAIL,
      replyTo: email,
      subject: "Promotion Inquiry",
      html: emailHtml,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Email send error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to send email" },
      { status: 500 }
    )
  }
}
