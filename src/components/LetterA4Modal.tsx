'use client';

import React, { useState, useRef } from 'react';
import { Letter } from '@/types/letter';
import { fontClassMap, paperStyleMap, sealColorMap } from './LetterCard';
import { Download, X, Image as ImageIcon, Upload, Trash2, Heart, ArrowLeftRight, Check } from 'lucide-react';

interface ParagraphCustomization {
  text: string;
  imageUrl?: string;
  imageCaption?: string;
  position: 'left' | 'right';
}

interface LetterA4ModalProps {
  letter: Letter;
  onClose: () => void;
}

export default function LetterA4Modal({ letter, onClose }: LetterA4ModalProps) {
  // Split raw letter body into paragraphs
  const rawParagraphs = letter.body
    ? letter.body.split(/\n\s*\n/).filter((p) => p.trim().length > 0)
    : [letter.body];

  // Hero banner state (pre-populate with existing photoUrl if any)
  const [heroImage, setHeroImage] = useState<string | undefined>(letter.photoUrl || undefined);
  const [heroCaption, setHeroCaption] = useState<string>(letter.photoCaption || '');

  // Paragraph customization state: alternating right, left, right, left by default
  const [paragraphs, setParagraphs] = useState<ParagraphCustomization[]>(
    rawParagraphs.map((p, idx) => ({
      text: p.trim(),
      position: idx % 2 === 0 ? 'right' : 'left',
      imageUrl: undefined,
      imageCaption: '',
    }))
  );

  const [activeTab, setActiveTab] = useState<'preview' | 'customize'>('preview');
  const printRef = useRef<HTMLDivElement>(null);

  const fontStyleClass = fontClassMap[letter.fontChoice] || fontClassMap['dancing-script'];
  const paperClass = paperStyleMap[letter.paperStyle] || paperStyleMap.cream;
  const sealInfo = sealColorMap[letter.sealColor] || sealColorMap.crimson;
  const isDark = letter.paperStyle === 'midnight';

  // Handle local image upload helper to base64
  const handleImageUpload = (file: File, callback: (base64: string) => void) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        callback(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const updateParagraph = (index: number, updates: Partial<ParagraphCustomization>) => {
    setParagraphs((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], ...updates };
      return copy;
    });
  };

  // Browser Print trigger for clean, high-DPI vector A4 PDF export
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white print:static print:inset-auto">
      {/* Container Dialog */}
      <div className="relative w-full max-w-5xl bg-[#FFFDF9] rounded-2xl shadow-2xl border border-[#F8E2EB] flex flex-col my-auto max-h-[96vh] overflow-hidden print:max-h-none print:shadow-none print:border-none print:rounded-none print:w-full print:max-w-none">
        
        {/* Modal Top Bar - Hidden during print */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F8E2EB] bg-white/80 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#F8E2EB] flex items-center justify-center text-[#8B1E2F]">
              <Heart className="w-5 h-5 fill-[#E8A0B8]" />
            </div>
            <div>
              <h2 className="font-display text-lg text-[#2B2320] leading-tight">
                A4 Keepsake Letter
              </h2>
              <p className="font-ui text-xs text-[#7A6966]">
                Add photos to paragraphs & download as a printable keepsake
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View / Customize switcher */}
            <div className="flex rounded-full bg-[#FAF4ED] p-1 border border-[#E8A0B8]/30">
              <button
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                  activeTab === 'preview'
                    ? 'bg-[#C97D91] text-white shadow-xs'
                    : 'text-[#7A6966] hover:text-[#2B2320]'
                }`}
              >
                A4 Preview
              </button>
              <button
                onClick={() => setActiveTab('customize')}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                  activeTab === 'customize'
                    ? 'bg-[#C97D91] text-white shadow-xs'
                    : 'text-[#7A6966] hover:text-[#2B2320]'
                }`}
              >
                Customize Photos
              </button>
            </div>

            {/* Print / Download Button */}
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-linear-to-r from-[#E8A0B8] to-[#C97D91] hover:from-[#DF92AB] hover:to-[#BD6F84] text-white text-xs font-medium shadow-md transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download A4 PDF</span>
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 rounded-full text-[#7A6966] hover:bg-neutral-100 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#FAF4ED]/50 print:p-0 print:bg-white print:overflow-visible">
          
          {/* CUSTOMIZE TAB */}
          {activeTab === 'customize' && (
            <div className="max-w-3xl mx-auto space-y-6 print:hidden">
              {/* Hero Banner Section */}
              <div className="bg-white p-6 rounded-xl border border-[#F8E2EB] shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-display text-base text-[#2B2320]">
                      Top Hero Banner
                    </h3>
                    <p className="text-xs text-[#7A6966]">
                      Appears as a prominent banner at the very top of your letter
                    </p>
                  </div>
                  {heroImage && (
                    <button
                      onClick={() => setHeroImage(undefined)}
                      className="text-xs text-rose-600 hover:underline flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </button>
                  )}
                </div>

                {heroImage ? (
                  <div className="space-y-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={heroImage}
                      alt="Hero banner"
                      className="w-full max-h-52 object-cover rounded-lg border border-[#F8E2EB]"
                    />
                    <input
                      type="text"
                      placeholder="Optional banner caption or memory..."
                      value={heroCaption}
                      onChange={(e) => setHeroCaption(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-[#E8A0B8]/40 rounded-lg focus:outline-none focus:border-[#C97D91]"
                    />
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-[#E8A0B8]/50 rounded-xl p-6 cursor-pointer hover:bg-[#FAF4ED] transition-colors">
                    <Upload className="w-6 h-6 text-[#C97D91] mb-2" />
                    <span className="text-xs font-medium text-[#2B2320]">
                      Upload Hero Banner Photo
                    </span>
                    <span className="text-[10px] text-[#A39694] mt-1">
                      PNG, JPG, WebP supported
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file, (b64) => setHeroImage(b64));
                      }}
                    />
                  </label>
                )}
              </div>

              {/* Paragraph Side Images Section */}
              <div className="bg-white p-6 rounded-xl border border-[#F8E2EB] shadow-xs space-y-5">
                <div>
                  <h3 className="font-display text-base text-[#2B2320]">
                    Paragraph Side Images
                  </h3>
                  <p className="text-xs text-[#7A6966]">
                    Attach memory photos alongside specific paragraphs. Positions alternate right and left automatically.
                  </p>
                </div>

                {paragraphs.map((p, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-[#F8E2EB] bg-[#FFFDF9] space-y-3"
                  >
                    <div className="flex items-center justify-between text-xs font-medium text-[#7A6966]">
                      <span>Paragraph {idx + 1}</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            updateParagraph(idx, {
                              position: p.position === 'right' ? 'left' : 'right',
                            })
                          }
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#FAF4ED] hover:bg-[#F8E2EB] text-[11px] text-[#8B1E2F] border border-[#E8A0B8]/30 transition-colors"
                        >
                          <ArrowLeftRight className="w-3 h-3" />
                          <span>Side: {p.position.toUpperCase()}</span>
                        </button>
                        {p.imageUrl && (
                          <button
                            type="button"
                            onClick={() => updateParagraph(idx, { imageUrl: undefined, imageCaption: '' })}
                            className="text-rose-600 hover:underline inline-flex items-center gap-0.5 text-[11px]"
                          >
                            <Trash2 className="w-3 h-3" /> Remove
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-[#4A3E3C] line-clamp-2 italic bg-white p-2 rounded-md border border-[#F8E2EB]">
                      &ldquo;{p.text}&rdquo;
                    </p>

                    {p.imageUrl ? (
                      <div className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={p.imageUrl}
                          alt={`Paragraph ${idx + 1} photo`}
                          className="w-16 h-16 object-cover rounded-md border border-[#E8A0B8]/40"
                        />
                        <input
                          type="text"
                          placeholder="Optional short caption..."
                          value={p.imageCaption || ''}
                          onChange={(e) => updateParagraph(idx, { imageCaption: e.target.value })}
                          className="flex-1 text-xs px-3 py-1.5 border border-[#E8A0B8]/40 rounded-lg focus:outline-none focus:border-[#C97D91]"
                        />
                      </div>
                    ) : (
                      <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-dashed border-[#E8A0B8]/60 text-xs font-medium text-[#C97D91] hover:bg-[#FAF4ED] cursor-pointer transition-colors">
                        <ImageIcon className="w-4 h-4" />
                        <span>Add photo for this paragraph</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleImageUpload(file, (b64) =>
                                updateParagraph(idx, { imageUrl: b64 })
                              );
                            }
                          }}
                        />
                      </label>
                    )}
                  </div>
                ))}
              </div>

              <div className="text-center pt-2">
                <button
                  onClick={() => setActiveTab('preview')}
                  className="px-6 py-2.5 rounded-full bg-[#8B1E2F] text-white text-xs font-medium shadow-md hover:bg-[#721523] transition-colors"
                >
                  Done Customizing — View A4 Preview ✨
                </button>
              </div>
            </div>
          )}

          {/* PREVIEW TAB (The printable A4 sheet) */}
          <div className={`${activeTab === 'preview' ? 'block' : 'hidden print:block'}`}>
            <div className="flex justify-center">
              {/* 
                A4 Container:
                Standard A4 is 210mm x 297mm (approx 1:1.414 aspect ratio).
                Max width ~794px matches 96dpi A4 width.
              */}
              <div
                ref={printRef}
                id="a4-letter-sheet"
                className={`w-full max-w-[794px] min-h-[1123px] bg-[#FFFDF9] rounded-xl shadow-xl p-8 sm:p-14 relative transition-all duration-300 border border-[#F8E2EB] ${paperClass} print:shadow-none print:border-none print:m-0 print:p-10 print:w-full print:max-w-none print:rounded-none`}
                style={{
                  pageBreakInside: 'avoid',
                }}
              >
                {/* Vintage postal stamp in corner */}
                {letter.stickers.includes('vintage-stamp') && (
                  <div className="absolute top-6 right-6 sm:top-10 sm:right-10 transform rotate-3 select-none">
                    <div className="postage-stamp w-14 h-18 rounded-xs p-1.5 flex flex-col items-center justify-between text-center bg-white">
                      <div className="text-[8px] uppercase tracking-widest text-[#8B1E2F] font-serif font-bold">
                        Air Mail
                      </div>
                      <Heart className="w-4 h-4 text-[#C97D91] fill-[#F8E2EB]" />
                      <div className="text-[7px] text-[#A35870] font-mono font-medium">
                        LOVE • 14¢
                      </div>
                    </div>
                  </div>
                )}

                {/* Date header */}
                <div className="flex justify-between items-start mb-6">
                  <div
                    className={`text-xs tracking-wider uppercase font-ui opacity-60 ${
                      isDark ? 'text-pink-200' : 'text-[#7A6966]'
                    }`}
                  >
                    {new Date(letter.createdAt).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </div>
                </div>

                {/* Hero Banner (Top) if set */}
                {heroImage && (
                  <div className="mb-8 rounded-xl overflow-hidden border border-[#E8A0B8]/40 shadow-sm relative group bg-white p-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={heroImage}
                      alt="Hero banner"
                      className="w-full max-h-[260px] object-cover rounded-lg"
                    />
                    {heroCaption && (
                      <p className="mt-2 text-center text-xs font-letter-caveat text-neutral-600">
                        {heroCaption}
                      </p>
                    )}
                  </div>
                )}

                {/* Recipient Greeting */}
                <div className="mb-6">
                  <div
                    className={`${fontStyleClass} font-semibold ${
                      isDark ? 'text-pink-100' : 'text-[#2B2320]'
                    }`}
                  >
                    Dear {letter.recipientName || 'Someone Special'},
                  </div>
                </div>

                {/* Paragraphs with side-by-side alternating photos */}
                <div className="space-y-6">
                  {paragraphs.map((p, idx) => {
                    const hasImage = Boolean(p.imageUrl);
                    const isRight = p.position === 'right';

                    return (
                      <div
                        key={idx}
                        className={`clearfix relative ${
                          hasImage ? 'min-h-[140px]' : ''
                        }`}
                      >
                        {/* Side attached Polaroid-style photo */}
                        {hasImage && (
                          <div
                            className={`mb-2 sm:mb-0 max-w-[170px] ${
                              isRight
                                ? 'float-right ml-4 sm:ml-6 rotate-2'
                                : 'float-left mr-4 sm:mr-6 -rotate-2'
                            } polaroid-frame p-2 bg-white rounded-xs shadow-md border border-[#F8E2EB] text-center select-none`}
                            style={{ shapeOutside: 'margin-box' }}
                          >
                            <div className="washi-tape" />
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={p.imageUrl}
                              alt={`Memory ${idx + 1}`}
                              className="w-full h-28 object-cover rounded-xs"
                            />
                            {p.imageCaption ? (
                              <p className="mt-1.5 text-[10px] font-letter-caveat text-neutral-600 leading-tight">
                                {p.imageCaption}
                              </p>
                            ) : (
                              <div className="mt-1 flex items-center justify-center gap-1 text-[9px] text-pink-400">
                                <Heart className="w-2.5 h-2.5 fill-pink-300" />
                                <span className="font-letter-caveat">cherished</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Paragraph Text */}
                        <p
                          className={`${fontStyleClass} ${
                            isDark ? 'text-pink-100' : 'text-[#2B2320]'
                          } whitespace-pre-wrap text-justify`}
                        >
                          {p.text}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Sign-off & Signature & Wax Seal */}
                <div className="mt-12 pt-6 flex justify-between items-end gap-6 clear-both border-t border-[#E8A0B8]/20">
                  <div>
                    <div
                      className={`${fontStyleClass} opacity-80 ${
                        isDark ? 'text-pink-200' : 'text-[#5C4A47]'
                      }`}
                    >
                      Forever & always,
                    </div>
                    <div
                      className={`${fontStyleClass} mt-1 font-semibold ${
                        isDark ? 'text-pink-100' : 'text-[#2B2320]'
                      }`}
                    >
                      {letter.senderName || 'Yours Truly'}
                    </div>
                  </div>

                  {/* Decorative Stickers & Wax Seal */}
                  <div className="flex items-center gap-3">
                    {letter.stickers.includes('dried-rose') && (
                      <div className="text-2xl select-none transform rotate-12">
                        🌹
                      </div>
                    )}
                    {letter.stickers.includes('kiss-mark') && (
                      <div className="text-2xl select-none transform -rotate-12">
                        💋
                      </div>
                    )}
                    {letter.stickers.includes('wax-seal') && (
                      <div
                        className={`w-14 h-14 rounded-full flex items-center justify-center text-white text-xl shadow-lg relative ${sealInfo.class}`}
                      >
                        <span className="font-serif italic font-bold">
                          {letter.senderName
                            ? letter.senderName.charAt(0).toUpperCase()
                            : '♥'}
                        </span>
                        <span className="absolute -inset-1 rounded-full border border-[#D4AF37]/50" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
