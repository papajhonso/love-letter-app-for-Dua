import React from 'react';
import { notFound } from 'next/navigation';
import { getLetterBySlug, markLetterOpened } from '@/lib/storage';
import EnvelopeReveal from '@/components/EnvelopeReveal';
import PetalBackground from '@/components/PetalBackground';
import AudioPlayer from '@/components/AudioPlayer';
import Link from 'next/link';
import { Heart, ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const letter = await getLetterBySlug(slug);

  if (!letter) {
    return {
      title: 'Letter Not Found — Write a Love Letter',
    };
  }

  const recipient = letter.recipientName ? `for ${letter.recipientName}` : '';
  return {
    title: `A Love Letter ${recipient} 💌`,
    description: `A handwritten love letter was created with care. Open the wax seal to read.`,
    openGraph: {
      title: `A Love Letter ${recipient} 💌`,
      description: `Someone poured their heart into words for you. Tap to break the wax seal.`,
    },
  };
}

export default async function LetterReadPage({ params }: PageProps) {
  const { slug } = await params;
  const letter = await getLetterBySlug(slug);

  if (!letter) {
    return (
      <div className="relative min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <PetalBackground />
        <div className="relative z-10 max-w-md p-8 bg-white/90 rounded-3xl border border-[#F8E2EB] shadow-xl">
          <div className="text-4xl mb-4">🍃</div>
          <h1 className="font-display text-2xl text-[#2B2320] mb-2">
            Letter Drifted Away
          </h1>
          <p className="font-ui text-sm text-[#7A6966] mb-6">
            We couldn’t find a love letter with this link. It may have been retired or mistyped.
          </p>
          <Link
            href="/write"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-linear-to-r from-[#E8A0B8] to-[#C97D91] text-white text-sm font-medium shadow-md"
          >
            <span>Write a New Letter 💌</span>
          </Link>
        </div>
      </div>
    );
  }

  // Mark letter opened
  await markLetterOpened(slug);

  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-x-hidden">
      <PetalBackground />
      <AudioPlayer />

      {/* Top Bar */}
      <header className="relative z-10 w-full max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-medium text-[#7A6966] hover:text-[#2B2320] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Write a Love Letter</span>
        </Link>

        <div className="flex items-center gap-1.5 text-xs text-[#8B1E2F] font-medium bg-[#F8E2EB]/80 px-3 py-1 rounded-full border border-[#E8A0B8]/40">
          <Heart className="w-3.5 h-3.5 fill-[#C97D91]" />
          <span>Private Love Letter</span>
        </div>
      </header>

      {/* Envelope & Letter Reveal Experience */}
      <main className="relative z-10 w-full max-w-4xl mx-auto px-4 py-8 flex-1 flex flex-col items-center justify-center">
        <EnvelopeReveal letter={letter} />
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full py-6 text-center text-xs text-[#7A6966]">
        Write a Love Letter — free, private & romantic 💌
      </footer>
    </div>
  );
}
