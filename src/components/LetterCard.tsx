'use client';

import React from 'react';
import {
  HandwritingFont,
  PaperStyle,
  SealColor,
  StickerType,
} from '@/types/letter';
import { Heart, Sparkles } from 'lucide-react';

interface LetterCardProps {
  recipientName: string;
  senderName: string;
  body: string;
  fontChoice: HandwritingFont;
  paperStyle: PaperStyle;
  photoUrl?: string;
  photoCaption?: string;
  stickers?: StickerType[];
  sealColor?: SealColor;
  dateStr?: string;
  isEditable?: boolean;
  onRecipientChange?: (val: string) => void;
  onSenderChange?: (val: string) => void;
  onBodyChange?: (val: string) => void;
}

export const fontClassMap: Record<HandwritingFont, string> = {
  'caveat': 'font-letter-caveat text-2xl sm:text-3xl leading-relaxed',
  'dancing-script': 'font-letter-dancing-script text-2xl sm:text-3xl leading-relaxed',
  'sacramento': 'font-letter-sacramento text-3xl sm:text-4xl leading-loose',
  'homemade-apple': 'font-letter-homemade-apple text-xl sm:text-2xl leading-loose',
  'shadows-into-light': 'font-letter-shadows-into-light text-2xl sm:text-3xl leading-relaxed',
  'patrick-hand': 'font-letter-patrick-hand text-2xl sm:text-3xl leading-relaxed',
};

export const paperStyleMap: Record<PaperStyle, string> = {
  cream: 'paper-style-cream',
  blush: 'paper-style-blush',
  celestial: 'paper-style-celestial',
  parchment: 'paper-style-parchment',
  midnight: 'paper-style-midnight',
};

export const sealColorMap: Record<SealColor, { class: string; label: string; hex: string }> = {
  'crimson': { class: 'wax-seal-crimson', label: 'Crimson Red', hex: '#8B1E2F' },
  'rose-gold': { class: 'wax-seal-rose-gold', label: 'Rose Gold', hex: '#E8A0B8' },
  'royal-navy': { class: 'wax-seal-royal-navy', label: 'Royal Navy', hex: '#2B4C7E' },
  'emerald': { class: 'wax-seal-emerald', label: 'Emerald', hex: '#2E7D5E' },
  'antique-gold': { class: 'wax-seal-antique-gold', label: 'Antique Gold', hex: '#D4AF37' },
};

export default function LetterCard({
  recipientName,
  senderName,
  body,
  fontChoice,
  paperStyle,
  photoUrl,
  photoCaption,
  stickers = ['wax-seal'],
  sealColor = 'crimson',
  dateStr,
  isEditable = false,
  onRecipientChange,
  onSenderChange,
  onBodyChange,
}: LetterCardProps) {
  const fontStyleClass = fontClassMap[fontChoice] || fontClassMap['dancing-script'];
  const paperClass = paperStyleMap[paperStyle] || paperStyleMap.cream;
  const sealInfo = sealColorMap[sealColor] || sealColorMap.crimson;
  const isDark = paperStyle === 'midnight';

  const formattedDate =
    dateStr ||
    new Date().toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

  return (
    <div
      className={`paper-card relative w-full max-w-2xl mx-auto rounded-2xl p-7 sm:p-12 transition-all duration-300 ${paperClass}`}
    >
      {/* Decorative vintage postage stamp in top right */}
      {stickers.includes('vintage-stamp') && (
        <div className="absolute top-5 right-5 sm:top-8 sm:right-8 transform rotate-3 z-10 select-none">
          <div className="postage-stamp w-14 h-16 sm:w-16 sm:h-20 rounded-sm p-1.5 flex flex-col items-center justify-between text-center">
            <div className="text-[9px] uppercase tracking-widest text-[#8B1E2F] font-serif font-bold">
              Air Mail
            </div>
            <Heart className="w-5 h-5 text-[#C97D91] fill-[#F8E2EB]" />
            <div className="text-[8px] text-[#A35870] font-mono font-medium">
              LOVE • 14¢
            </div>
          </div>
        </div>
      )}

      {/* Date header */}
      <div className="flex justify-between items-start mb-6">
        <div
          className={`text-xs sm:text-sm tracking-wider uppercase font-ui opacity-60 ${
            isDark ? 'text-pink-200' : 'text-[#7A6966]'
          }`}
        >
          {formattedDate}
        </div>
      </div>

      {/* Recipient Greeting */}
      <div className="mb-6">
        {isEditable ? (
          <div className="flex items-baseline gap-2">
            <span
              className={`${fontStyleClass} select-none opacity-80 ${
                isDark ? 'text-pink-100' : 'text-[#4A3E3C]'
              }`}
            >
              Dear
            </span>
            <input
              type="text"
              value={recipientName}
              onChange={(e) => onRecipientChange?.(e.target.value)}
              placeholder="my love,"
              className={`${fontStyleClass} bg-transparent border-b border-dashed border-[#E8A0B8]/60 focus:border-[#C97D91] focus:outline-none w-full max-w-xs transition-colors px-1 ${
                isDark
                  ? 'text-pink-100 placeholder-pink-400/40'
                  : 'text-[#2B2320] placeholder-[#2B2320]/40'
              }`}
            />
          </div>
        ) : (
          <div
            className={`${fontStyleClass} font-semibold ${
              isDark ? 'text-pink-100' : 'text-[#2B2320]'
            }`}
          >
            Dear {recipientName || 'Someone Special'},
          </div>
        )}
      </div>

      {/* Letter Body */}
      <div className="relative mb-10 min-h-[180px]">
        {isEditable ? (
          <textarea
            value={body}
            onChange={(e) => onBodyChange?.(e.target.value)}
            rows={7}
            placeholder="Write the words you carry in your heart..."
            className={`${fontStyleClass} w-full bg-transparent resize-y border-none focus:outline-none focus:ring-0 leading-relaxed sm:leading-loose ${
              isDark
                ? 'text-pink-100 placeholder-pink-300/30'
                : 'text-[#2B2320] placeholder-[#2B2320]/30'
            }`}
            style={{ minHeight: '180px' }}
          />
        ) : (
          <div
            className={`${fontStyleClass} whitespace-pre-wrap ${
              isDark ? 'text-pink-100' : 'text-[#2B2320]'
            }`}
          >
            {body || 'Your words will bloom here...'}
          </div>
        )}

        {/* Optional Polaroid Photo Pinned to Card */}
        {photoUrl && (
          <div className="mt-8 sm:mt-6 flex justify-center sm:justify-end">
            <div className="polaroid-frame relative transform rotate-[-2.5deg] max-w-[210px] rounded-sm text-center">
              <div className="washi-tape" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photoUrl}
                alt="Cherished memory"
                className="w-full h-36 sm:h-40 object-cover rounded-xs"
              />
              {photoCaption ? (
                <p className="mt-2 text-xs font-letter-caveat text-neutral-700 tracking-wide">
                  {photoCaption}
                </p>
              ) : (
                <div className="mt-2 flex items-center justify-center gap-1 text-[11px] text-pink-400">
                  <Heart className="w-3 h-3 fill-pink-300" />
                  <span className="font-letter-caveat">forever & always</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Sign-off & Signature */}
      <div className="mt-8 pt-4 flex flex-col sm:flex-row justify-between items-end gap-6">
        <div className="w-full sm:w-auto">
          <div
            className={`${fontStyleClass} opacity-80 ${
              isDark ? 'text-pink-200' : 'text-[#5C4A47]'
            }`}
          >
            Forever & always,
          </div>
          {isEditable ? (
            <input
              type="text"
              value={senderName}
              onChange={(e) => onSenderChange?.(e.target.value)}
              placeholder="Your name or initials"
              className={`${fontStyleClass} mt-1 bg-transparent border-b border-dashed border-[#E8A0B8]/60 focus:border-[#C97D91] focus:outline-none w-48 transition-colors px-1 ${
                isDark
                  ? 'text-pink-100 placeholder-pink-400/40'
                  : 'text-[#2B2320] placeholder-[#2B2320]/40'
              }`}
            />
          ) : (
            <div
              className={`${fontStyleClass} mt-1 font-semibold ${
                isDark ? 'text-pink-100' : 'text-[#2B2320]'
              }`}
            >
              {senderName || 'Yours Truly'}
            </div>
          )}
        </div>

        {/* Decorative elements: Wax Seal / Dried Rose / Stickers */}
        <div className="flex items-center gap-3 self-end">
          {stickers.includes('dried-rose') && (
            <div
              className="text-2xl select-none transform rotate-12 hover:rotate-0 transition-transform"
              title="Dried Rose"
            >
              🌹
            </div>
          )}

          {stickers.includes('kiss-mark') && (
            <div
              className="text-2xl select-none transform -rotate-12 hover:scale-110 transition-transform"
              title="Sealed with a kiss"
            >
              💋
            </div>
          )}

          {stickers.includes('cupid-heart') && (
            <div
              className="text-2xl select-none transform hover:scale-125 transition-transform"
              title="Cupid's arrow"
            >
              💘
            </div>
          )}

          {stickers.includes('sparkle') && (
            <Sparkles className="w-5 h-5 text-[#D4AF37] animate-pulse" />
          )}

          {/* Official Wax Seal */}
          {stickers.includes('wax-seal') && (
            <div
              className={`w-13 h-13 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-white text-xl shadow-lg border border-white/20 select-none ${sealInfo.class}`}
              title={`Wax Seal: ${sealInfo.label}`}
            >
              <span className="font-serif italic font-bold">
                {senderName ? senderName.charAt(0).toUpperCase() : '♥'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
