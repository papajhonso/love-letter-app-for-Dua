'use client';

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Letter } from '@/types/letter';
import LetterCard, { sealColorMap } from './LetterCard';
import LetterA4Modal from './LetterA4Modal';
import { Heart, Sparkles, Send, Share2, Copy, Check, Download } from 'lucide-react';
import Link from 'next/link';

interface EnvelopeRevealProps {
  letter: Letter;
}

export default function EnvelopeReveal({ letter }: EnvelopeRevealProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showA4Modal, setShowA4Modal] = useState(false);
  const sealInfo = sealColorMap[letter.sealColor] || sealColorMap.crimson;

  const handleOpenEnvelope = () => {
    if (isOpen) return;

    // Trigger sweet heart & petal confetti burst
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#E8A0B8', '#F8E2EB', '#C97D91', '#D4AF37', '#FFF0F5'],
      shapes: ['circle'],
    });

    // Play subtle soft chime via Web Audio
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.15); // E5
        osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.3); // G5
        gain.gain.setValueAtTime(0.001, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.85);
      }
    } catch (e) {
      // Audio optional
    }

    setIsOpen(true);
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col items-center">
      {!isOpen ? (
        /* The Sealed Envelope View */
        <div className="flex flex-col items-center animate-fade-in w-full px-4">
          <div className="text-center mb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium tracking-wide bg-[#F8E2EB] text-[#8B1E2F] border border-[#E8A0B8]/40 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-[#C97D91]" />
              Special Delivery for You
            </span>
            <h1 className="font-display text-3xl sm:text-4xl text-[#2B2320]">
              You have received a love letter
            </h1>
            <p className="font-ui text-sm text-[#7A6966] mt-2">
              From {letter.senderName || 'Someone who loves you dearly'}
            </p>
          </div>

          {/* Interactive Envelope Container */}
          <div
            onClick={handleOpenEnvelope}
            className="group relative cursor-pointer w-full max-w-md bg-[#FAF4ED] rounded-xl shadow-2xl border border-[#E8A0B8]/40 p-8 sm:p-10 transition-all duration-500 hover:scale-[1.02] hover:shadow-[#E8A0B8]/30 overflow-hidden"
            role="button"
            tabIndex={0}
            aria-label="Click to break the wax seal and open the letter"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') handleOpenEnvelope();
            }}
          >
            {/* Vintage postal stamp in corner */}
            <div className="absolute top-4 right-4 rotate-3 select-none">
              <div className="postage-stamp w-12 h-14 rounded-xs p-1 flex flex-col items-center justify-between text-center bg-white">
                <span className="text-[7px] uppercase tracking-widest text-[#8B1E2F] font-bold">
                  POST
                </span>
                <Heart className="w-4 h-4 text-[#C97D91] fill-[#F8E2EB]" />
                <span className="text-[7px] text-[#A35870] font-mono">14¢</span>
              </div>
            </div>

            {/* Postal wavy stamp cancellation mark */}
            <div className="absolute top-8 right-18 opacity-40 select-none pointer-events-none">
              <div className="w-16 h-8 border-y border-dashed border-[#8B1E2F] rotate-[-8deg] flex items-center justify-center text-[8px] font-mono tracking-widest text-[#8B1E2F]">
                AIR MAIL
              </div>
            </div>

            {/* Envelope Recipient Address */}
            <div className="my-8 text-center sm:text-left sm:pl-4">
              <div className="text-xs uppercase tracking-widest text-[#A39694] font-ui font-medium mb-1">
                For:
              </div>
              <div className="font-letter-dancing-script text-3xl sm:text-4xl text-[#2B2320] leading-tight">
                {letter.recipientName || 'My Beloved'}
              </div>
              <div className="font-letter-caveat text-base text-[#7A6966] mt-1">
                Sent with all my affection
              </div>
            </div>

            {/* Wax Seal in Center Bottom */}
            <div className="flex flex-col items-center justify-center pt-4">
              <div
                className={`relative w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl shadow-xl transition-transform duration-300 group-hover:scale-110 ${sealInfo.class}`}
              >
                <span className="font-serif italic font-bold">
                  {letter.senderName ? letter.senderName.charAt(0).toUpperCase() : '♥'}
                </span>
                <span className="absolute -inset-1 rounded-full border-2 border-[#D4AF37]/50 animate-pulse-soft" />
              </div>

              <div className="mt-4 flex items-center gap-1.5 text-xs text-[#8B1E2F] font-medium tracking-wide">
                <Heart className="w-3.5 h-3.5 fill-[#E8A0B8] text-[#8B1E2F] animate-bounce" />
                <span>Tap seal to break & open letter</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* The Unfolded Revealed Letter View */
        <div className="w-full flex flex-col items-center animate-fade-in">
          {/* Top subtle controls */}
          <div className="w-full max-w-2xl flex items-center justify-between px-2 mb-4">
            <span className="text-xs text-[#7A6966] font-ui flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              Letter opened with love
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowA4Modal(true)}
                className="flex items-center gap-1.5 text-xs font-medium text-[#8B1E2F] hover:text-[#721523] bg-[#F8E2EB]/80 hover:bg-[#F8E2EB] px-3 py-1.5 rounded-full border border-[#E8A0B8]/40 shadow-xs transition-colors cursor-pointer"
                title="Download / customize as A4 printable letter"
              >
                <Download className="w-3.5 h-3.5 text-[#C97D91]" />
                <span>Download A4 Letter</span>
              </button>

              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 text-xs font-medium text-[#7A6966] hover:text-[#2B2320] bg-white/70 hover:bg-white px-3 py-1.5 rounded-full border border-[#F8E2EB] shadow-xs transition-colors cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Link copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Share link</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Render Full Stylized Letter Card */}
          <LetterCard
            recipientName={letter.recipientName}
            senderName={letter.senderName}
            body={letter.body}
            fontChoice={letter.fontChoice}
            paperStyle={letter.paperStyle}
            photoUrl={letter.photoUrl}
            photoCaption={letter.photoCaption}
            stickers={letter.stickers}
            sealColor={letter.sealColor}
            dateStr={new Date(letter.createdAt).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
            isEditable={false}
          />

          {/* Loop CTA to write your own letter */}
          <div className="mt-12 text-center p-8 bg-white/80 rounded-2xl border border-[#F8E2EB] shadow-lg max-w-md w-full">
            <h3 className="font-display text-xl text-[#2B2320] mb-2">
              Touched by these words?
            </h3>
            <p className="font-ui text-sm text-[#7A6966] mb-6">
              Write your own letter and send it to someone you care about. Completely free, no account needed.
            </p>
            <Link
              href="/write"
              className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-6 rounded-full bg-linear-to-r from-[#E8A0B8] to-[#C97D91] hover:from-[#DF92AB] hover:to-[#BD6F84] text-white font-medium text-sm shadow-md shadow-[#C97D91]/25 hover:shadow-lg transition-all duration-200"
            >
              <Send className="w-4 h-4" />
              <span>Write a Love Letter 💌</span>
            </Link>
          </div>
          {/* A4 Download & Customizer Modal */}
          {showA4Modal && (
            <LetterA4Modal
              letter={letter}
              onClose={() => setShowA4Modal(false)}
            />
          )}
        </div>
      )}
    </div>
  );
}
