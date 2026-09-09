import { NextRequest, NextResponse } from 'next/server';
import { getLetterBySlug, markLetterOpened } from '@/lib/storage';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;

    if (!slug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
    }

    const letter = await getLetterBySlug(slug);

    if (!letter) {
      return NextResponse.json({ error: 'Letter not found' }, { status: 404 });
    }

    // Mark opened in background
    markLetterOpened(slug).catch((err) =>
      console.error('Error updating opened status:', err)
    );

    return NextResponse.json({ letter });
  } catch (error: any) {
    console.error('Error fetching letter:', error);
    return NextResponse.json(
      { error: 'Failed to fetch letter', details: error?.message },
      { status: 500 }
    );
  }
}
