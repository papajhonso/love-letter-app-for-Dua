import { NextRequest, NextResponse } from 'next/server';
import { getLetterBySlug } from '@/lib/storage';
import { sendLetterEmail } from '@/lib/email';
import { checkRateLimit } from '@/lib/rateLimit';
import { SendEmailPayload } from '@/types/letter';

export async function POST(request: NextRequest) {
  try {
    // Rate limit by IP or forwarded header
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      request.headers.get('x-real-ip') ||
      'anonymous';

    const rateCheck = checkRateLimit(ip, 5, 60 * 1000); // 5 emails per minute
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: 'Too many email requests. Please wait a moment before sending another.',
          resetMs: rateCheck.resetMs,
        },
        { status: 429 }
      );
    }

    const body: SendEmailPayload = await request.json();

    if (!body.slug || !body.recipientEmail) {
      return NextResponse.json(
        { error: 'Letter slug and recipient email are required' },
        { status: 400 }
      );
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.recipientEmail)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    const letter = await getLetterBySlug(body.slug);
    if (!letter) {
      return NextResponse.json({ error: 'Letter not found' }, { status: 404 });
    }

    const origin =
      request.headers.get('origin') ||
      request.nextUrl.origin ||
      'http://localhost:3000';

    const result = await sendLetterEmail(letter, body.recipientEmail, origin);

    return NextResponse.json({
      success: result.success,
      mode: result.mode,
      messageId: result.messageId,
      previewUrl: result.previewUrl,
      htmlPreview: result.htmlPreview,
      error: result.error,
    });
  } catch (error: any) {
    console.error('Error sending letter email:', error);
    return NextResponse.json(
      { error: 'Failed to send email', details: error?.message },
      { status: 500 }
    );
  }
}
