import { NextRequest, NextResponse } from 'next/server';
import { saveLetter } from '@/lib/storage';
import { CreateLetterPayload } from '@/types/letter';
import { sendLetterEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body: CreateLetterPayload = await request.json();

    if (!body.body || !body.body.trim()) {
      return NextResponse.json(
        { error: 'Letter body cannot be empty' },
        { status: 400 }
      );
    }

    // Default values if unspecified
    const payload: CreateLetterPayload = {
      recipientName: body.recipientName || '',
      senderName: body.senderName || '',
      body: body.body.trim(),
      fontChoice: body.fontChoice || 'dancing-script',
      paperStyle: body.paperStyle || 'cream',
      photoUrl: body.photoUrl,
      photoCaption: body.photoCaption,
      stickers: body.stickers || ['wax-seal'],
      sealColor: body.sealColor || 'crimson',
      sendMethod: body.sendMethod || 'link',
      recipientEmail: body.recipientEmail,
    };

    const savedLetter = await saveLetter(payload);

    // Get origin URL
    const origin =
      request.headers.get('origin') ||
      request.headers.get('referer')?.split('/write')[0] ||
      request.nextUrl.origin ||
      'http://localhost:3000';

    let emailResult = null;
    if (
      (payload.sendMethod === 'email' || payload.sendMethod === 'both') &&
      payload.recipientEmail
    ) {
      emailResult = await sendLetterEmail(savedLetter, payload.recipientEmail, origin);
    }

    return NextResponse.json(
      {
        success: true,
        letter: savedLetter,
        slug: savedLetter.slug,
        shareUrl: `${origin}/l/${savedLetter.slug}`,
        emailResult,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating letter:', error);
    return NextResponse.json(
      { error: 'Failed to create letter', details: error?.message },
      { status: 500 }
    );
  }
}
