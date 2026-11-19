'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Letter } from '@/types/letter';
import { fontClassMap, paperStyleMap, sealColorMap } from './LetterCard';
import { toPng } from 'html-to-image';
import { Download, X, Image as ImageIcon, Upload, Trash2, Heart, ArrowLeftRight, Loader2, Sparkles, ZoomIn, ZoomOut } from 'lucide-react';

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

  // Hero banner state
  const [heroImage, setHeroImage] = useState<string | undefined>(letter.photoUrl || undefined);
  const [heroCaption, setHeroCaption] = useState<string>(letter.photoCaption || '');

  // Paragraph customization state: alternating right, left, right, left
  const [paragraphs, setParagraphs] = useState<ParagraphCustomization[]>(
    rawParagraphs.map((p, idx) => ({
      text: p.trim(),
      position: idx % 2 === 0 ? 'right' : 'left',
      imageUrl: undefined,
      imageCaption: '',
    }))
  );

  const [activeTab, setActiveTab] = useState<'preview' | 'customize'>('preview');
  const [isExporting, setIsExporting] = useState(false);
  const [fontSize, setFontSize] = useState<number>(20); // starts around 20-22px
  const [autoScale, setAutoScale] = useState<boolean>(true);

  const a4ContainerRef = useRef<HTMLDivElement>(null);
  const a4ContentRef = useRef<HTMLDivElement>(null);

  const fontStyleClass = fontClassMap[letter.fontChoice] || fontClassMap['dancing-script'];
  const paperClass = paperStyleMap[letter.paperStyle] || paperStyleMap.cream;
  const sealInfo = sealColorMap[letter.sealColor] || sealColorMap.crimson;
  const isDark = letter.paperStyle === 'midnight';

  // Paper background inline styling to guarantee colors stay intact during PNG export
  const paperBackgroundStyle: React.CSSProperties = {
    blush: {
      background: 'linear-gradient(135deg, #FFF6F9 0%, #FCEAF1 100%)',
      backgroundColor: '#FFF6F9',
      color: '#351C26',
    },
    cream: {
      backgroundColor: '#FFFDF9',
      color: '#2B2320',
    },
    celestial: {
      background: 'linear-gradient(135deg, #F8FBFE 0%, #EDF3F9 100%)',
      backgroundColor: '#F8FBFE',
      color: '#1E293B',
    },
    parchment: {
      background: 'linear-gradient(145deg, #FCF8EE 0%, #F5ECDA 100%)',
      backgroundColor: '#FCF8EE',
      color: '#34281B',
    },
    midnight: {
      background: 'linear-gradient(145deg, #1A131A 0%, #110B12 100%)',
      backgroundColor: '#1A131A',
      color: '#F8E2EB',
    },
  }[letter.paperStyle] || {
    backgroundColor: '#FFFDF9',
    color: '#2B2320',
  };

  // Convert uploaded image to base64
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

  // Auto-adjust font size between 14px and 24px so the entire letter fits strictly on ONE A4 page (1123px high)
  useEffect(() => {
    if (!autoScale) return;

    const timer = setTimeout(() => {
      const container = a4ContainerRef.current;
      if (!container) return;

      const targetMaxHeight = 1123 - 40; // A4 standard 96dpi height minus inner padding safety
      let currentSize = 24;

      // Iteratively reduce font size until content height fits or reaches min 14px
      setFontSize(currentSize);

      const checkAndFit = () => {
        if (!a4ContainerRef.current) return;
        const scrollH = a4ContainerRef.current.scrollHeight;

        if (scrollH > targetMaxHeight && currentSize > 14) {
          currentSize -= 1;
          setFontSize(currentSize);
          requestAnimationFrame(checkAndFit);
        }
      };

      requestAnimationFrame(checkAndFit);
    }, 150);

    return () => clearTimeout(timer);
  }, [paragraphs, heroImage, autoScale, activeTab, letter.body]);

  // Export as high-resolution PNG
  const handleExportPNG = async () => {
    if (!a4ContainerRef.current) return;
    setIsExporting(true);

    try {
      // Ensure fonts and styles are loaded
      await document.fonts.ready;

      const dataUrl = await toPng(a4ContainerRef.current, {
        quality: 0.98,
        pixelRatio: 2.5, // Crisp high-definition output
        cacheBust: true,
        backgroundColor: paperBackgroundStyle.backgroundColor || '#FFFDF9',
        style: {
          transform: 'none',
          margin: '0',
          boxShadow: 'none',
          borderRadius: '0',
        },
      });

      // Trigger download
      const link = document.createElement('a');
      const filename = `love-letter-${letter.recipientName ? letter.recipientName.replace(/\s+/g, '-').toLowerCase() : 'keepsake'}.png`;
      link.download = filename;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export PNG:', err);
      alert('Could not export image. Please try again or use the browser print option.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
      {/* Modal Dialog */}
      <div className="relative w-full max-w-5xl bg-[#FFFDF9] rounded-2xl shadow-2xl border border-[#F8E2EB] flex flex-col my-auto max-h-[96vh] overflow-hidden">
        
        {/* Top Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-[#F8E2EB] bg-white/90">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#F8E2EB] flex items-center justify-center text-[#8B1E2F]">
              <Heart className="w-5 h-5 fill-[#E8A0B8]" />
            </div>
            <div>
              <h2 className="font-display text-lg text-[#2B2320] leading-tight flex items-center gap-2">
                A4 Keepsake Letter
                <span className="text-[10px] font-sans bg-pink-100 text-pink-700 px-2 py-0.5 rounded-full font-medium">
                  1-Page PNG
                </span>
              </h2>
              <p className="font-ui text-xs text-[#7A6966]">
                Single A4 page • Auto-scaled font ({fontSize}px) • Preserves {letter.paperStyle} color
              </p>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            {/* View / Customize Tab Switcher */}
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

            {/* Manual Font Size Adjuster */}
            <div className="hidden sm:flex items-center gap-1 bg-[#FAF4ED] px-2 py-1 rounded-full border border-[#E8A0B8]/30 text-xs text-[#7A6966]">
              <span className="text-[11px] font-medium mr-1">Font:</span>
              <button
                onClick={() => {
                  setAutoScale(false);
                  setFontSize((s) => Math.max(14, s - 1));
                }}
                disabled={fontSize <= 14}
                className="p-1 hover:text-[#2B2320] disabled:opacity-30"
                title="Decrease font size"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono w-6 text-center text-[#2B2320]">{fontSize}px</span>
              <button
                onClick={() => {
                  setAutoScale(false);
                  setFontSize((s) => Math.min(24, s + 1));
                }}
                disabled={fontSize >= 24}
                className="p-1 hover:text-[#2B2320] disabled:opacity-30"
                title="Increase font size"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Export PNG Button */}
            <button
              onClick={handleExportPNG}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-linear-to-r from-[#E8A0B8] to-[#C97D91] hover:from-[#DF92AB] hover:to-[#BD6F84] text-white text-xs font-medium shadow-md transition-all cursor-pointer disabled:opacity-60"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating PNG...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download as PNG</span>
                </>
              )}
            </button>

            {/* Close Button */}
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
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#FAF4ED]/50">
          
          {/* CUSTOMIZE PHOTOS TAB */}
          {activeTab === 'customize' && (
            <div className="max-w-3xl mx-auto space-y-6">
              {/* Hero Banner Section */}
              <div className="bg-white p-6 rounded-xl border border-[#F8E2EB] shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-display text-base text-[#2B2320]">
                      Top Hero Banner
                    </h3>
                    <p className="text-xs text-[#7A6966]">
                      Featured memory banner placed at the very top of your letter
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
                      className="w-full max-h-48 object-cover rounded-lg border border-[#F8E2EB]"
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
                      Upload Top Hero Banner
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

              {/* Paragraph Side Images */}
              <div className="bg-white p-6 rounded-xl border border-[#F8E2EB] shadow-xs space-y-5">
                <div>
                  <h3 className="font-display text-base text-[#2B2320]">
                    Paragraph Side Images
                  </h3>
                  <p className="text-xs text-[#7A6966]">
                    Attach memory photos alongside specific paragraphs. Positions alternate right and left.
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
                  View Single-Page A4 Preview ✨
                </button>
              </div>
            </div>
          )}

          {/* PREVIEW TAB (Standard Single-Page A4 Sheet) */}
          <div className={`${activeTab === 'preview' ? 'block' : 'hidden'}`}>
            <div className="flex justify-center">
              {/* 
                Standard A4 Dimensions at 96 DPI:
                Width: 794px (210mm)
                Height: 1123px (297mm)
                Strictly 1 single page!
              */}
              <div
                ref={a4ContainerRef}
                id="a4-letter-sheet"
                className={`w-[794px] h-[1123px] max-w-full rounded-lg shadow-2xl p-10 sm:p-12 relative flex flex-col justify-between overflow-hidden border border-[#E8A0B8]/40 ${paperClass}`}
                style={{
                  ...paperBackgroundStyle,
                  boxSizing: 'border-box',
                }}
              >
                {/* Top vintage postage stamp in corner */}
                {letter.stickers.includes('vintage-stamp') && (
                  <div className="absolute top-8 right-8 transform rotate-3 select-none pointer-events-none">
                    <div className="postage-stamp w-14 h-18 rounded-xs p-1.5 flex flex-col items-center justify-between text-center bg-white shadow-xs">
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

                {/* Top Section: Date & Hero Banner */}
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div
                      className={`text-xs tracking-wider uppercase font-ui opacity-75 ${
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

                  {/* Top Hero Banner */}
                  {heroImage && (
                    <div className="mb-5 rounded-xl overflow-hidden border border-[#E8A0B8]/40 shadow-xs bg-white p-2 text-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={heroImage}
                        alt="Hero banner"
                        className="w-full max-h-[160px] object-cover rounded-lg"
                      />
                      {heroCaption && (
                        <p className="mt-1 text-[11px] font-letter-caveat text-neutral-600">
                          {heroCaption}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Recipient Greeting */}
                  <div className="mb-4">
                    <div
                      className={`${fontStyleClass} font-semibold ${
                        isDark ? 'text-pink-100' : 'text-[#2B2320]'
                      }`}
                      style={{ fontSize: `${Math.min(26, fontSize + 4)}px` }}
                    >
                      Dear {letter.recipientName || 'Someone Special'},
                    </div>
                  </div>
                </div>

                {/* Main Middle Content: Paragraphs with alternating floating photos */}
                <div
                  ref={a4ContentRef}
                  className="flex-1 overflow-hidden space-y-4 pr-1"
                  style={{
                    fontSize: `${fontSize}px`,
                    lineHeight: fontSize <= 16 ? 1.45 : 1.55,
                  }}
                >
                  {paragraphs.map((p, idx) => {
                    const hasImage = Boolean(p.imageUrl);
                    const isRight = p.position === 'right';

                    return (
                      <div key={idx} className="clearfix relative">
                        {/* Side attached Polaroid photo */}
                        {hasImage && (
                          <div
                            className={`mb-1 max-w-[130px] ${
                              isRight
                                ? 'float-right ml-4 rotate-2'
                                : 'float-left mr-4 -rotate-2'
                            } polaroid-frame p-1.5 bg-white rounded-xs shadow-md border border-[#F8E2EB] text-center select-none`}
                            style={{ shapeOutside: 'margin-box' }}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={p.imageUrl}
                              alt={`Memory ${idx + 1}`}
                              className="w-full h-22 object-cover rounded-xs"
                            />
                            {p.imageCaption ? (
                              <p className="mt-1 text-[9px] font-letter-caveat text-neutral-600 leading-tight">
                                {p.imageCaption}
                              </p>
                            ) : (
                              <div className="mt-0.5 flex items-center justify-center gap-0.5 text-[8px] text-pink-400">
                                <Heart className="w-2 h-2 fill-pink-300" />
                                <span className="font-letter-caveat">cherished</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Paragraph text */}
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

                {/* Bottom Section: Signature & Wax Seal */}
                <div className="mt-4 pt-4 flex justify-between items-end gap-6 border-t border-[#E8A0B8]/25 clear-both">
                  <div>
                    <div
                      className={`${fontStyleClass} opacity-80 ${
                        isDark ? 'text-pink-200' : 'text-[#5C4A47]'
                      }`}
                      style={{ fontSize: `${Math.max(14, fontSize - 2)}px` }}
                    >
                      Forever & always,
                    </div>
                    <div
                      className={`${fontStyleClass} mt-0.5 font-semibold ${
                        isDark ? 'text-pink-100' : 'text-[#2B2320]'
                      }`}
                      style={{ fontSize: `${Math.min(26, fontSize + 2)}px` }}
                    >
                      {letter.senderName || 'Yours Truly'}
                    </div>
                  </div>

                  {/* Wax Seal & Romantic Stamps */}
                  <div className="flex items-center gap-3">
                    {letter.stickers.includes('dried-rose') && (
                      <div className="text-xl select-none transform rotate-12">
                        🌹
                      </div>
                    )}
                    {letter.stickers.includes('kiss-mark') && (
                      <div className="text-xl select-none transform -rotate-12">
                        💋
                      </div>
                    )}
                    {letter.stickers.includes('wax-seal') && (
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-lg shadow-md relative ${sealInfo.class}`}
                      >
                        <span className="font-serif italic font-bold">
                          {letter.senderName
                            ? letter.senderName.charAt(0).toUpperCase()
                            : '♥'}
                        </span>
                        <span className="absolute -inset-0.5 rounded-full border border-[#D4AF37]/50" />
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
