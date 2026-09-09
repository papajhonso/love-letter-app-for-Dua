'use client';

import React from 'react';
import Link from 'next/link';
import PetalBackground from '@/components/PetalBackground';
import AudioPlayer from '@/components/AudioPlayer';
import {
  Heart,
  Feather,
  Palette,
  Send,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export default function LandingPage() {
  return (
    <main className="relative min-h-screen flex flex-col justify-between overflow-x-hidden">
      {/* Gentle falling petals & heart dust in background */}
      <PetalBackground />

      {/* Romantic Audio Player */}
      <AudioPlayer />

      {/* Navigation / Header */}
      <header className="relative z-10 w-full max-w-6xl mx-auto px-6 py-8 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-linear-to-br from-[#E8A0B8] to-[#C97D91] flex items-center justify-center text-white shadow-md shadow-[#C97D91]/30">
            <Heart className="w-4 h-4 fill-white" />
          </div>
          <span className="font-display text-xl font-medium text-[#2B2320] tracking-tight">
            Write a Love Letter
          </span>
        </div>

        <Link
          href="/write"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-medium tracking-wide bg-[#F8E2EB] hover:bg-[#F3D3E2] text-[#8B1E2F] border border-[#E8A0B8]/40 transition-all duration-200 shadow-xs"
        >
          <span>Write a Letter</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 w-full max-w-4xl mx-auto px-6 pt-8 pb-16 text-center flex flex-col items-center">
        {/* Soft tag */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F8E2EB]/80 text-[#8B1E2F] border border-[#E8A0B8]/40 text-xs font-medium tracking-wide mb-6 backdrop-blur-xs">
          <Sparkles className="w-3.5 h-3.5 text-[#C97D91]" />
          <span>Free • No signup • Shareable link or email</span>
        </div>

        {/* Hero Title */}
        <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-normal text-[#2B2320] tracking-tight leading-[1.15] max-w-3xl">
          Some words deserve to be{' '}
          <span className="italic font-normal bg-linear-to-r from-[#C97D91] to-[#8B1E2F] bg-clip-text text-transparent underline decoration-[#E8A0B8]/50 decoration-wavy decoration-1 underline-offset-8">
            written down
          </span>
          .
        </h1>

        {/* Subtitle */}
        <p className="font-ui text-base sm:text-xl text-[#7A6966] mt-6 max-w-xl font-normal leading-relaxed">
          Pour your feelings into timeless stationery. Pick your handwriting style, attach a polaroid memory, and send a love letter to someone you adore.
        </p>

        {/* Hero CTA Button */}
        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
          <Link
            href="/write"
            className="group relative inline-flex items-center justify-center gap-3 px-9 py-4 rounded-full bg-linear-to-r from-[#E8A0B8] to-[#C97D91] hover:from-[#DF92AB] hover:to-[#BD6F84] text-white font-medium text-base shadow-lg shadow-[#C97D91]/30 hover:shadow-xl hover:shadow-[#C97D91]/40 transition-all duration-300 transform hover:-translate-y-0.5"
          >
            <Heart className="w-5 h-5 fill-white group-hover:scale-110 transition-transform" />
            <span>Start Writing</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Interactive stationery hero preview */}
        <div className="mt-16 w-full max-w-lg mx-auto transform -rotate-1 hover:rotate-0 transition-transform duration-500">
          <div className="paper-card rounded-2xl p-7 sm:p-9 paper-style-cream text-left relative">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[11px] font-ui text-[#7A6966] tracking-widest uppercase">
                Forever Note
              </span>
              <div className="w-8 h-8 rounded-full wax-seal-crimson flex items-center justify-center text-white text-xs shadow-sm">
                ♥
              </div>
            </div>
            <div className="font-letter-dancing-script text-2xl text-[#2B2320] mb-2 font-semibold">
              Dear you,
            </div>
            <p className="font-letter-dancing-script text-xl text-[#4A3E3C] leading-relaxed">
              If I had a flower for every time I thought of you, I could walk through my garden forever.
            </p>
            <div className="mt-6 text-right font-letter-caveat text-xl text-[#7A6966]">
              — always yours
            </div>
          </div>
        </div>
      </section>

      {/* "How It Works" Section */}
      <section className="relative z-10 w-full max-w-5xl mx-auto px-6 py-20 border-t border-[#F8E2EB]/70">
        <div className="text-center mb-14">
          <span className="text-xs uppercase tracking-widest font-ui text-[#C97D91] font-semibold">
            Simple & Heartfelt
          </span>
          <h2 className="font-display text-3xl sm:text-4xl text-[#2B2320] mt-2">
            How it works
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="bg-white/80 rounded-2xl p-8 border border-[#F8E2EB] shadow-sm hover:shadow-md transition-shadow relative text-center flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-[#FFF0F5] text-[#8B1E2F] flex items-center justify-center mb-6 border border-[#E8A0B8]/30 font-display font-bold text-lg">
              1
            </div>
            <h3 className="font-display text-xl text-[#2B2320] mb-3">
              Write your letter
            </h3>
            <p className="font-ui text-sm text-[#7A6966] leading-relaxed">
              Pour your thoughts onto the page. Address it to your special someone, or sign off with your favorite pet name.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white/80 rounded-2xl p-8 border border-[#F8E2EB] shadow-sm hover:shadow-md transition-shadow relative text-center flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-[#FFF0F5] text-[#8B1E2F] flex items-center justify-center mb-6 border border-[#E8A0B8]/30 font-display font-bold text-lg">
              2
            </div>
            <h3 className="font-display text-xl text-[#2B2320] mb-3">
              Customize the look
            </h3>
            <p className="font-ui text-sm text-[#7A6966] leading-relaxed">
              Pick from 6 romantic handwriting fonts, paper textures (blush, parchment, cream), attach a polaroid photo, and stamp a wax seal.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white/80 rounded-2xl p-8 border border-[#F8E2EB] shadow-sm hover:shadow-md transition-shadow relative text-center flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-[#FFF0F5] text-[#8B1E2F] flex items-center justify-center mb-6 border border-[#E8A0B8]/30 font-display font-bold text-lg">
              3
            </div>
            <h3 className="font-display text-xl text-[#2B2320] mb-3">
              Send it your way
            </h3>
            <p className="font-ui text-sm text-[#7A6966] leading-relaxed">
              Generate a cute, private shareable link, send straight to their email inbox with a surprise card, or both!
            </p>
          </div>
        </div>

        <div className="mt-14 text-center">
          <Link
            href="/write"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#2B2320] text-white hover:bg-[#403430] font-medium text-sm transition-colors shadow-md"
          >
            <span>Write your letter now</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 w-full border-t border-[#F8E2EB] py-8 text-center px-6 bg-[#FFFDF9]/80 backdrop-blur-xs">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#7A6966]">
          <div className="flex items-center gap-2">
            <Heart className="w-3.5 h-3.5 text-[#C97D91] fill-[#F8E2EB]" />
            <span>Completely free • No paywalls • No signup needed</span>
          </div>

          <div>
            Made for lovers, dreamers, and kind hearts 💌
          </div>
        </div>
      </footer>
    </main>
  );
}
