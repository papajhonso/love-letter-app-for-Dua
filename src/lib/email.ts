import { Letter } from '@/types/letter';

export interface EmailSendResult {
  success: boolean;
  mode: 'resend' | 'simulated';
  messageId?: string;
  previewUrl?: string;
  error?: string;
  htmlPreview?: string;
}

export function generateLetterEmailHtml(letter: Letter, letterUrl: string): string {
  const recipient = letter.recipientName || 'Someone Special';
  const sender = letter.senderName || 'Someone who cares deeply';
  const snippet =
    letter.body.length > 180
      ? letter.body.substring(0, 180) + '...'
      : letter.body;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You've received a love letter</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #FFFDF9;
      font-family: 'Playfair Display', Georgia, 'Times New Roman', serif;
      color: #2B2320;
    }
    .wrapper {
      width: 100%;
      table-layout: fixed;
      background-color: #FFFDF9;
      padding: 40px 0;
    }
    .card {
      max-width: 540px;
      margin: 0 auto;
      background-color: #FFFFFF;
      border: 1px solid #F8E2EB;
      border-radius: 16px;
      padding: 48px 36px;
      box-shadow: 0 10px 30px rgba(232, 160, 184, 0.15);
      text-align: center;
    }
    .wax-seal {
      width: 64px;
      height: 64px;
      margin: 0 auto 24px auto;
      background: radial-gradient(circle at 35% 35%, #C97D91, #8B1E2F);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #FFF;
      font-size: 28px;
      box-shadow: 0 4px 12px rgba(139, 30, 47, 0.35);
      line-height: 64px;
    }
    h1 {
      font-size: 26px;
      font-weight: 500;
      margin: 0 0 12px 0;
      color: #2B2320;
      letter-spacing: 0.5px;
    }
    .subtitle {
      font-size: 15px;
      color: #7A6966;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      margin-bottom: 28px;
    }
    .excerpt-box {
      background: #FFFDF9;
      border-left: 3px solid #E8A0B8;
      border-radius: 8px;
      padding: 20px 24px;
      margin: 28px 0;
      text-align: left;
      font-style: italic;
      font-size: 17px;
      line-height: 1.6;
      color: #4A3E3C;
    }
    .btn-container {
      margin: 32px 0 24px 0;
    }
    .btn {
      background: linear-gradient(135deg, #E8A0B8 0%, #C97D91 100%);
      color: #FFFFFF !important;
      text-decoration: none;
      padding: 15px 36px;
      border-radius: 9999px;
      font-weight: 600;
      font-size: 16px;
      display: inline-block;
      letter-spacing: 0.5px;
      box-shadow: 0 4px 15px rgba(201, 125, 145, 0.35);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    .footer {
      font-size: 13px;
      color: #A39694;
      margin-top: 36px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    .footer a {
      color: #C97D91;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="wax-seal">💌</div>
      <h1>A letter written for you</h1>
      <p class="subtitle">Dear <strong>${recipient}</strong>, ${sender} poured their heart into words for you.</p>
      
      <div class="excerpt-box">
        "${snippet}"
      </div>

      <div class="btn-container">
        <a href="${letterUrl}" class="btn" target="_blank">Open Your Letter 💌</a>
      </div>

      <p class="footer">
        Written with love on <a href="${letterUrl.split('/l/')[0]}">Write a Love Letter</a> — free & romantic.
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

export async function sendLetterEmail(
  letter: Letter,
  recipientEmail: string,
  baseUrl: string
): Promise<EmailSendResult> {
  const letterUrl = `${baseUrl.replace(/\/$/, '')}/l/${letter.slug}`;
  const htmlContent = generateLetterEmailHtml(letter, letterUrl);
  const subject = letter.senderName
    ? `${letter.senderName} sent you a love letter 💌`
    : "You've received a love letter 💌";

  const resendApiKey = process.env.RESEND_API_KEY;

  if (resendApiKey) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || 'Love Letter <letters@janapasabi.com>',
          to: [recipientEmail],
          subject: subject,
          html: htmlContent,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Resend API error:', errorData);
        return {
          success: false,
          mode: 'resend',
          error: errorData.message || 'Failed to send email via Resend',
          htmlPreview: htmlContent,
        };
      }

      const resData = await response.json();
      return {
        success: true,
        mode: 'resend',
        messageId: resData.id,
        htmlPreview: htmlContent,
      };
    } catch (err: any) {
      console.error('Network error sending email via Resend:', err);
      return {
        success: false,
        mode: 'resend',
        error: err?.message || 'Network error sending email',
        htmlPreview: htmlContent,
      };
    }
  }

  // Simulated delivery mode (Development / Zero-config standalone)
  console.log('--- [SIMULATED EMAIL DELIVERY] ---');
  console.log(`To: ${recipientEmail}`);
  console.log(`Subject: ${subject}`);
  console.log(`Letter Link: ${letterUrl}`);
  console.log('-----------------------------------');

  return {
    success: true,
    mode: 'simulated',
    previewUrl: letterUrl,
    htmlPreview: htmlContent,
  };
}
