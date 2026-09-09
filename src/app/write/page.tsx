'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import PetalBackground from '@/components/PetalBackground';
import AudioPlayer from '@/components/AudioPlayer';
import LetterCard, { sealColorMap } from '@/components/LetterCard';
import {
  HandwritingFont,
  PaperStyle,
  SealColor,
  StickerType,
  SendMethod,
} from '@/types/letter';
import {
  Heart,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  PenTool,
  Palette,
  Send,
  Upload,
  Image as ImageIcon,
  Check,
  Copy,
  Mail,
  Link as LinkIcon,
  ExternalLink,
  Eye,
  RefreshCw,
  X,
} from 'lucide-react';

export default function WritePage() {
  // Stepper state: 1 = Write, 2 = Customize, 3 = Send
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Letter content state
  const [recipientName, setRecipientName] = useState('');
  const [senderName, setSenderName] = useState('');
  const [body, setBody] = useState('');

  // Customization state
  const [fontChoice, setFontChoice] = useState<HandwritingFont>('dancing-script');
  const [paperStyle, setPaperStyle] = useState<PaperStyle>('cream');
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(undefined);
  const [photoCaption, setPhotoCaption] = useState('');
  const [stickers, setStickers] = useState<StickerType[]>([
    'wax-seal',
    'vintage-stamp',
  ]);
  const [sealColor, setSealColor] = useState<SealColor>('crimson');

  // Send settings
  const [wantLink, setWantLink] = useState(true);
  const [wantEmail, setWantEmail] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [emailSubject, setEmailSubject] = useState("You've received a love letter 💌");

  // Submission & Confirmation state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [sentResult, setSentResult] = useState<{
    slug: string;
    shareUrl: string;
    emailResult?: any;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [showEmailPreviewModal, setShowEmailPreviewModal] = useState(false);

  // File upload input ref
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Handwriting font options
  const fontOptions: { id: HandwritingFont; name: string; sample: string; cssClass: string }[] = [
    {
      id: 'caveat',
      name: 'Caveat',
      sample: 'You make my heart smile',
      cssClass: 'font-letter-caveat',
    },
    {
      id: 'dancing-script',
      name: 'Dancing Script',
      sample: 'Forever in love with you',
      cssClass: 'font-letter-dancing-script',
    },
    {
      id: 'sacramento',
      name: 'Sacramento',
      sample: 'Yours completely & always',
      cssClass: 'font-letter-sacramento',
    },
    {
      id: 'homemade-apple',
      name: 'Homemade Apple',
      sample: 'Every thought leads to you',
      cssClass: 'font-letter-homemade-apple',
    },
    {
      id: 'shadows-into-light',
      name: 'Shadows Into Light',
      sample: 'My favorite hello, hardest goodbye',
      cssClass: 'font-letter-shadows-into-light',
    },
    {
      id: 'patrick-hand',
      name: 'Patrick Hand',
      sample: 'Love note from the heart',
      cssClass: 'font-letter-patrick-hand',
    },
  ];

  // Paper options
  const paperOptions: { id: PaperStyle; name: string; bgClass: string; desc: string }[] = [
    { id: 'cream', name: 'Warm Cream', bgClass: 'bg-[#FFFDF9] border-[#E8A0B8]/40', desc: 'Classic vintage stationery' },
    { id: 'blush', name: 'Blush Pink', bgClass: 'bg-[#FFF0F5] border-[#E8A0B8]', desc: 'Romantic soft petal tone' },
    { id: 'celestial', name: 'Celestial Blue', bgClass: 'bg-[#F0F5FA] border-[#BAE6FD]', desc: 'Dreamy starlight sky' },
    { id: 'parchment', name: 'Aged Parchment', bgClass: 'bg-[#F9F4E8] border-[#D4AF37]/50', desc: 'Antique tea-stained paper' },
    { id: 'midnight', name: 'Midnight Rose', bgClass: 'bg-[#1C161E] text-pink-100 border-pink-900', desc: 'Velvet dark romance' },
  ];

  // Sticker options
  const stickerOptions: { id: StickerType; label: string; icon: string }[] = [
    { id: 'wax-seal', label: 'Wax Seal', icon: '💌' },
    { id: 'dried-rose', label: 'Dried Rose', icon: '🌹' },
    { id: 'vintage-stamp', label: 'Postage Stamp', icon: '📬' },
    { id: 'cupid-heart', label: 'Cupid Heart', icon: '💘' },
    { id: 'kiss-mark', label: 'Kiss Mark', icon: '💋' },
    { id: 'sparkle', label: 'Golden Sparkle', icon: '✨' },
  ];

  const handleToggleSticker = (id: StickerType) => {
    if (stickers.includes(id)) {
      setStickers(stickers.filter((s) => s !== id));
    } else {
      setStickers([...stickers, id]);
    }
  };

  // Photo upload handling (client-side base64)
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Photo is too large. Please select an image under 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Send submission
  const handleSend = async () => {
    if (!body.trim()) {
      setErrorMsg('Please write your letter before sending!');
      setCurrentStep(1);
      return;
    }

    if (!wantLink && !wantEmail) {
      setErrorMsg('Please select at least one delivery option (Shareable Link or Email).');
      return;
    }

    if (wantEmail && !recipientEmail.trim()) {
      setErrorMsg('Please provide the recipient’s email address.');
      return;
    }

    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      let sendMethod: SendMethod = 'link';
      if (wantLink && wantEmail) sendMethod = 'both';
      else if (wantEmail) sendMethod = 'email';

      const response = await fetch('/api/letters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientName,
          senderName,
          body,
          fontChoice,
          paperStyle,
          photoUrl,
          photoCaption,
          stickers,
          sealColor,
          sendMethod,
          recipientEmail: wantEmail ? recipientEmail : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create your letter');
      }

      setSentResult(data);

      // Trigger celebration confetti
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#E8A0B8', '#F8E2EB', '#C97D91', '#D4AF37', '#FFF0F5'],
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyLink = () => {
    if (sentResult?.shareUrl) {
      navigator.clipboard.writeText(sentResult.shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-x-hidden">
      <PetalBackground />
      <AudioPlayer />

      {/* Header */}
      <header className="relative z-10 w-full max-w-5xl mx-auto px-6 py-6 flex items-center justify-between border-b border-[#F8E2EB]/60">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-[#7A6966] hover:text-[#2B2320] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Home</span>
        </Link>

        {/* Stepper indicator */}
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={() => setCurrentStep(1)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              currentStep === 1
                ? 'bg-[#E8A0B8] text-white shadow-xs'
                : 'text-[#7A6966] hover:text-[#2B2320]'
            }`}
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>1. Write</span>
          </button>

          <span className="text-[#E8A0B8] text-xs">/</span>

          <button
            onClick={() => setCurrentStep(2)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              currentStep === 2
                ? 'bg-[#E8A0B8] text-white shadow-xs'
                : 'text-[#7A6966] hover:text-[#2B2320]'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>2. Customize</span>
          </button>

          <span className="text-[#E8A0B8] text-xs">/</span>

          <button
            onClick={() => setCurrentStep(3)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              currentStep === 3
                ? 'bg-[#E8A0B8] text-white shadow-xs'
                : 'text-[#7A6966] hover:text-[#2B2320]'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>3. Send</span>
          </button>
        </div>

        <div className="w-12 text-right">
          <Heart className="w-4 h-4 text-[#C97D91] fill-[#F8E2EB] inline-block" />
        </div>
      </header>

      {/* Main Studio Area */}
      <main className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 flex-1">
        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center justify-between shadow-xs">
            <span>{errorMsg}</span>
            <button
              onClick={() => setErrorMsg(null)}
              className="text-rose-500 hover:text-rose-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Confirmation Modal / Screen */}
        {sentResult ? (
          <div className="max-w-lg mx-auto bg-white rounded-3xl p-8 sm:p-10 border border-[#F8E2EB] shadow-2xl text-center animate-fade-in my-8">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#FFF0F5] text-[#8B1E2F] flex items-center justify-center text-3xl shadow-md border border-[#E8A0B8]/40 mb-6 animate-bounce">
              💌
            </div>

            <h2 className="font-display text-3xl text-[#2B2320] mb-2">
              Your letter is on its way
            </h2>
            <p className="font-ui text-sm text-[#7A6966] mb-8">
              A private romantic delivery has been sealed with love.
            </p>

            {/* Generated Cute Link Box */}
            <div className="bg-[#FFFDF9] rounded-2xl p-4 border border-[#E8A0B8]/40 text-left mb-6">
              <label className="text-[11px] font-ui uppercase tracking-wider text-[#7A6966] font-semibold block mb-1">
                Your Shareable Link
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={sentResult.shareUrl}
                  className="bg-transparent text-sm text-[#2B2320] font-mono w-full focus:outline-none select-all"
                />
                <button
                  onClick={handleCopyLink}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[#E8A0B8] hover:bg-[#C97D91] text-white shadow-xs transition-colors shrink-0"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Email delivery confirmation badge */}
            {wantEmail && (
              <div className="mb-6 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs text-left flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Email sent to <strong>{recipientEmail}</strong>
                    {sentResult.emailResult?.mode === 'simulated' && (
                      <span className="text-emerald-700 block text-[11px] opacity-80">
                        (Simulated delivery preview available)
                      </span>
                    )}
                  </span>
                </div>

                {sentResult.emailResult?.htmlPreview && (
                  <button
                    onClick={() => setShowEmailPreviewModal(true)}
                    className="text-xs font-semibold text-emerald-700 underline ml-2 shrink-0 hover:text-emerald-900"
                  >
                    View Email
                  </button>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href={`/l/${sentResult.slug}`}
                className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-5 rounded-full bg-linear-to-r from-[#E8A0B8] to-[#C97D91] hover:from-[#DF92AB] hover:to-[#BD6F84] text-white font-medium text-sm shadow-md transition-all"
              >
                <Eye className="w-4 h-4" />
                <span>Open Letter View 💌</span>
              </Link>

              <button
                onClick={() => {
                  setSentResult(null);
                  setBody('');
                  setRecipientName('');
                  setSenderName('');
                  setPhotoUrl(undefined);
                  setCurrentStep(1);
                }}
                className="inline-flex items-center justify-center gap-1.5 py-3 px-5 rounded-full border border-[#E8A0B8] text-[#7A6966] hover:text-[#2B2320] hover:bg-[#FFF0F5] text-sm font-medium transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Write Another</span>
              </button>
            </div>
          </div>
        ) : (
          /* Editor Work Area */
          <div className="space-y-8">
            {/* STEP 1: WRITE */}
            {currentStep === 1 && (
              <div className="animate-fade-in">
                <div className="text-center mb-6">
                  <h1 className="font-display text-3xl sm:text-4xl text-[#2B2320]">
                    Write your letter
                  </h1>
                  <p className="font-ui text-sm text-[#7A6966] mt-1">
                    Pour your thoughts onto the paper. You can customize the styling next.
                  </p>
                </div>

                {/* Direct interactive writing stationery */}
                <LetterCard
                  recipientName={recipientName}
                  senderName={senderName}
                  body={body}
                  fontChoice={fontChoice}
                  paperStyle={paperStyle}
                  photoUrl={photoUrl}
                  photoCaption={photoCaption}
                  stickers={stickers}
                  sealColor={sealColor}
                  isEditable={true}
                  onRecipientChange={setRecipientName}
                  onSenderChange={setSenderName}
                  onBodyChange={setBody}
                />

                {/* Bottom Navigation */}
                <div className="mt-8 flex justify-end">
                  <button
                    onClick={() => {
                      if (!body.trim()) {
                        setErrorMsg('Please write a few words before proceeding.');
                        return;
                      }
                      setErrorMsg(null);
                      setCurrentStep(2);
                    }}
                    className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-linear-to-r from-[#E8A0B8] to-[#C97D91] hover:from-[#DF92AB] hover:to-[#BD6F84] text-white font-medium text-sm shadow-md transition-all"
                  >
                    <span>Next: Customize Styling</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: CUSTOMIZE */}
            {currentStep === 2 && (
              <div className="animate-fade-in space-y-8">
                <div className="text-center">
                  <h1 className="font-display text-3xl sm:text-4xl text-[#2B2320]">
                    Personalize your stationery
                  </h1>
                  <p className="font-ui text-sm text-[#7A6966] mt-1">
                    Select your handwriting font, paper texture, photo memory, and wax seal.
                  </p>
                </div>

                {/* Customization controls in clean romantic card */}
                <div className="bg-white/90 rounded-3xl p-6 sm:p-8 border border-[#F8E2EB] shadow-lg space-y-8">
                  {/* 1. Handwriting Font Picker */}
                  <div>
                    <label className="text-xs font-ui uppercase tracking-widest text-[#7A6966] font-semibold block mb-3">
                      1. Handwriting Font
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {fontOptions.map((font) => {
                        const isSelected = fontChoice === font.id;
                        return (
                          <button
                            key={font.id}
                            type="button"
                            onClick={() => setFontChoice(font.id)}
                            className={`p-4 rounded-2xl border text-left transition-all ${
                              isSelected
                                ? 'border-[#C97D91] bg-[#FFF0F5] ring-2 ring-[#E8A0B8]/40 shadow-xs'
                                : 'border-neutral-200 hover:border-[#E8A0B8] bg-[#FFFDF9]/60'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-ui text-[#7A6966] font-medium">
                                {font.name}
                              </span>
                              {isSelected && (
                                <Check className="w-3.5 h-3.5 text-[#C97D91]" />
                              )}
                            </div>
                            <div
                              className={`${font.cssClass} text-xl text-[#2B2320] truncate`}
                            >
                              {font.sample}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 2. Paper Style Picker */}
                  <div>
                    <label className="text-xs font-ui uppercase tracking-widest text-[#7A6966] font-semibold block mb-3">
                      2. Paper Style & Texture
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                      {paperOptions.map((paper) => {
                        const isSelected = paperStyle === paper.id;
                        return (
                          <button
                            key={paper.id}
                            type="button"
                            onClick={() => setPaperStyle(paper.id)}
                            className={`p-3.5 rounded-2xl border text-left transition-all ${paper.bgClass} ${
                              isSelected
                                ? 'ring-2 ring-[#C97D91] shadow-md scale-105'
                                : 'hover:opacity-90'
                            }`}
                          >
                            <div className="font-ui text-xs font-semibold mb-1">
                              {paper.name}
                            </div>
                            <div className="text-[10px] opacity-75 leading-tight">
                              {paper.desc}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 3. Attach Polaroid Photo */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-xs font-ui uppercase tracking-widest text-[#7A6966] font-semibold">
                        3. Polaroid Photo Memory (Optional)
                      </label>
                      {photoUrl && (
                        <button
                          type="button"
                          onClick={() => setPhotoUrl(undefined)}
                          className="text-xs text-rose-500 hover:text-rose-700 underline"
                        >
                          Remove Photo
                        </button>
                      )}
                    </div>

                    {!photoUrl ? (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="cursor-pointer border-2 border-dashed border-[#E8A0B8]/60 hover:border-[#C97D91] rounded-2xl p-6 text-center bg-[#FFFDF9]/60 hover:bg-[#FFF0F5]/50 transition-colors"
                      >
                        <ImageIcon className="w-8 h-8 text-[#C97D91] mx-auto mb-2 opacity-70" />
                        <span className="text-xs font-ui text-[#2B2320] font-medium block">
                          Click to upload a special photo
                        </span>
                        <span className="text-[11px] text-[#7A6966] mt-1 block">
                          PNG, JPG or WEBP under 5MB • Renders as a vintage polaroid
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-[#FFFDF9] rounded-2xl border border-[#E8A0B8]/40">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={photoUrl}
                          alt="Uploaded memory"
                          className="w-20 h-20 object-cover rounded-lg border border-white shadow-xs"
                        />
                        <div className="flex-1 w-full">
                          <label className="text-xs text-[#7A6966] font-ui block mb-1">
                            Polaroid caption:
                          </label>
                          <input
                            type="text"
                            value={photoCaption}
                            onChange={(e) => setPhotoCaption(e.target.value)}
                            placeholder="e.g. That rainy evening in Paris..."
                            className="w-full text-xs font-letter-caveat text-lg border border-[#E8A0B8]/50 rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#C97D91] bg-white"
                          />
                        </div>
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </div>

                  {/* 4. Wax Seal & Stickers */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Wax Seal Color */}
                    <div>
                      <label className="text-xs font-ui uppercase tracking-widest text-[#7A6966] font-semibold block mb-3">
                        4. Wax Seal Color
                      </label>
                      <div className="flex flex-wrap gap-2.5">
                        {(Object.keys(sealColorMap) as SealColor[]).map((colorKey) => {
                          const info = sealColorMap[colorKey];
                          const isSelected = sealColor === colorKey;
                          return (
                            <button
                              key={colorKey}
                              type="button"
                              onClick={() => setSealColor(colorKey)}
                              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                                isSelected
                                  ? 'border-[#2B2320] ring-2 ring-[#C97D91]/40 shadow-xs'
                                  : 'border-neutral-200 hover:border-neutral-400 bg-white'
                              }`}
                            >
                              <span
                                className={`w-3.5 h-3.5 rounded-full ${info.class}`}
                              />
                              <span>{info.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Stickers */}
                    <div>
                      <label className="text-xs font-ui uppercase tracking-widest text-[#7A6966] font-semibold block mb-3">
                        5. Stamps & Stickers
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {stickerOptions.map((sticker) => {
                          const isSelected = stickers.includes(sticker.id);
                          return (
                            <button
                              key={sticker.id}
                              type="button"
                              onClick={() => handleToggleSticker(sticker.id)}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all ${
                                isSelected
                                  ? 'bg-[#E8A0B8] text-white shadow-xs'
                                  : 'bg-[#FFFDF9] border border-neutral-200 text-[#7A6966] hover:border-[#E8A0B8]'
                              }`}
                            >
                              <span>{sticker.icon}</span>
                              <span>{sticker.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Live Preview Display */}
                <div className="mt-8">
                  <div className="text-center mb-4">
                    <span className="text-xs uppercase tracking-widest font-ui text-[#C97D91] font-semibold">
                      Live Preview
                    </span>
                  </div>
                  <LetterCard
                    recipientName={recipientName}
                    senderName={senderName}
                    body={body}
                    fontChoice={fontChoice}
                    paperStyle={paperStyle}
                    photoUrl={photoUrl}
                    photoCaption={photoCaption}
                    stickers={stickers}
                    sealColor={sealColor}
                    isEditable={false}
                  />
                </div>

                {/* Stepper Navigation */}
                <div className="flex justify-between items-center pt-4">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-[#E8A0B8] text-[#7A6966] hover:text-[#2B2320] text-sm font-medium transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Writing</span>
                  </button>

                  <button
                    onClick={() => setCurrentStep(3)}
                    className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-linear-to-r from-[#E8A0B8] to-[#C97D91] hover:from-[#DF92AB] hover:to-[#BD6F84] text-white font-medium text-sm shadow-md transition-all"
                  >
                    <span>Next: Send Letter</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: SEND (DUAL DELIVERY SPEC) */}
            {currentStep === 3 && (
              <div className="animate-fade-in space-y-8">
                <div className="text-center">
                  <h1 className="font-display text-3xl sm:text-4xl text-[#2B2320]">
                    Send your letter
                  </h1>
                  <p className="font-ui text-sm text-[#7A6966] mt-1">
                    Choose how you want to deliver your words. Select either or both — 100% free!
                  </p>
                </div>

                <div className="bg-white/90 rounded-3xl p-6 sm:p-10 border border-[#F8E2EB] shadow-xl space-y-6 max-w-2xl mx-auto">
                  {/* Option 1: Shareable Cute Link */}
                  <div
                    onClick={() => setWantLink(!wantLink)}
                    className={`cursor-pointer rounded-2xl p-5 border transition-all ${
                      wantLink
                        ? 'border-[#C97D91] bg-[#FFF6F9] ring-2 ring-[#E8A0B8]/40 shadow-xs'
                        : 'border-neutral-200 bg-[#FFFDF9]/60 hover:border-[#E8A0B8]'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-6 h-6 rounded-md flex items-center justify-center mt-0.5 border transition-colors ${
                          wantLink
                            ? 'bg-[#C97D91] border-[#C97D91] text-white'
                            : 'border-neutral-300 bg-white'
                        }`}
                      >
                        {wantLink && <Check className="w-4 h-4" />}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <LinkIcon className="w-4 h-4 text-[#C97D91]" />
                          <h3 className="font-display text-lg text-[#2B2320] font-medium">
                            Generate a cute shareable link
                          </h3>
                        </div>
                        <p className="font-ui text-xs text-[#7A6966] mt-1 leading-relaxed">
                          Creates a unique, private URL (e.g. <code>loveletter.app/l/sunflower-42</code>) that opens into an animated envelope reveal. Perfect for texting, WhatsApp, or Instagram DMs.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Option 2: Send by Email */}
                  <div
                    className={`rounded-2xl p-5 border transition-all ${
                      wantEmail
                        ? 'border-[#C97D91] bg-[#FFF6F9] ring-2 ring-[#E8A0B8]/40 shadow-xs'
                        : 'border-neutral-200 bg-[#FFFDF9]/60 hover:border-[#E8A0B8]'
                    }`}
                  >
                    <div
                      onClick={() => setWantEmail(!wantEmail)}
                      className="cursor-pointer flex items-start gap-4"
                    >
                      <div
                        className={`w-6 h-6 rounded-md flex items-center justify-center mt-0.5 border transition-colors ${
                          wantEmail
                            ? 'bg-[#C97D91] border-[#C97D91] text-white'
                            : 'border-neutral-300 bg-white'
                        }`}
                      >
                        {wantEmail && <Check className="w-4 h-4" />}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-[#C97D91]" />
                          <h3 className="font-display text-lg text-[#2B2320] font-medium">
                            Send directly by email
                          </h3>
                        </div>
                        <p className="font-ui text-xs text-[#7A6966] mt-1 leading-relaxed">
                          Delivers an exquisite romantic email notification to their inbox with a sneak peek and a button to open their personal wax-sealed letter.
                        </p>
                      </div>
                    </div>

                    {/* Expandable Email Fields */}
                    {wantEmail && (
                      <div className="mt-5 pt-4 border-t border-[#E8A0B8]/30 space-y-3 animate-fade-in">
                        <div>
                          <label className="text-xs font-ui text-[#2B2320] font-medium block mb-1">
                            Recipient’s Email Address *
                          </label>
                          <input
                            type="email"
                            required
                            value={recipientEmail}
                            onChange={(e) => setRecipientEmail(e.target.value)}
                            placeholder="sweetheart@example.com"
                            className="w-full text-sm font-ui border border-[#E8A0B8]/60 rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#C97D91] bg-white"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-ui text-[#2B2320] font-medium block mb-1">
                            Email Subject
                          </label>
                          <input
                            type="text"
                            value={emailSubject}
                            onChange={(e) => setEmailSubject(e.target.value)}
                            className="w-full text-sm font-ui border border-[#E8A0B8]/60 rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#C97D91] bg-white"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Pricing / Guarantee badge */}
                  <div className="text-center py-2">
                    <span className="inline-flex items-center gap-1.5 text-xs text-[#7A6966]">
                      <Heart className="w-3.5 h-3.5 text-[#C97D91] fill-[#F8E2EB]" />
                      <span>Always 100% free • No payment • No account required</span>
                    </span>
                  </div>

                  {/* Send Action Button */}
                  <button
                    onClick={handleSend}
                    disabled={isSubmitting}
                    className="w-full inline-flex items-center justify-center gap-2 py-4 px-6 rounded-full bg-linear-to-r from-[#E8A0B8] to-[#C97D91] hover:from-[#DF92AB] hover:to-[#BD6F84] text-white font-medium text-base shadow-lg shadow-[#C97D91]/30 hover:shadow-xl transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        <span>Sealing with Love...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        <span>Seal & Send Letter 💌</span>
                      </>
                    )}
                  </button>

                  <div className="text-center">
                    <button
                      onClick={() => setCurrentStep(2)}
                      className="text-xs font-ui text-[#7A6966] hover:text-[#2B2320] underline"
                    >
                      ← Back to Customize
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Email Preview Modal (For simulated / live preview) */}
      {showEmailPreviewModal && sentResult?.emailResult?.htmlPreview && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-neutral-200 flex items-center justify-between bg-[#FFFDF9]">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#C97D91]" />
                <span className="text-sm font-semibold text-[#2B2320]">
                  Recipient Email Preview
                </span>
              </div>
              <button
                onClick={() => setShowEmailPreviewModal(false)}
                className="text-neutral-500 hover:text-neutral-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-1 bg-[#F9F9F9]">
              <iframe
                title="Email Preview"
                srcDoc={sentResult.emailResult.htmlPreview}
                className="w-full min-h-[480px] border border-neutral-200 rounded-lg bg-white"
              />
            </div>
            <div className="p-3 bg-[#FFFDF9] border-t border-neutral-200 text-right">
              <button
                onClick={() => setShowEmailPreviewModal(false)}
                className="px-4 py-1.5 text-xs font-medium rounded-full bg-[#E8A0B8] text-white"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="relative z-10 w-full py-6 text-center text-xs text-[#7A6966]">
        Made with love • Completely free & open
      </footer>
    </div>
  );
}
