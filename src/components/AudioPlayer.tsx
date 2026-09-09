'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Music } from 'lucide-react';

export default function AudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Romantic acoustic chord progression frequencies (Hz):
  // Fmaj7 (F, A, C, E), Cmaj (C, E, G, B), Am7 (A, C, E, G), Gsus4 (G, C, D, G)
  const chords = [
    [174.61, 220.0, 261.63, 329.63, 523.25], // F3, A3, C4, E4, C5
    [130.81, 196.0, 261.63, 329.63, 392.0],  // C3, G3, C4, E4, G4
    [110.0, 164.81, 220.0, 261.63, 329.63],  // A2, E3, A3, C4, E4
    [146.83, 220.0, 293.66, 349.23, 440.0],  // D3, A3, D4, F4, A4
  ];

  const playChordNote = (ctx: AudioContext, freq: number, delay: number, duration: number) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);

    // Warm mellow acoustic sound
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, ctx.currentTime + delay);
    filter.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + delay + duration);

    // Soft gentle attack and long decay
    gain.gain.setValueAtTime(0.0001, ctx.currentTime + delay);
    gain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + delay + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + delay + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime + delay);
    osc.stop(ctx.currentTime + delay + duration + 0.1);
  };

  const startMusic = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      const ctx = audioCtxRef.current || new AudioCtx();
      audioCtxRef.current = ctx;

      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      let chordIndex = 0;

      const loopChords = () => {
        if (!audioCtxRef.current) return;
        const currentChord = chords[chordIndex];
        // Arpeggiate chord notes with soft harp timing
        currentChord.forEach((freq, idx) => {
          playChordNote(ctx, freq, idx * 0.4, 3.8);
        });

        chordIndex = (chordIndex + 1) % chords.length;
      };

      loopChords();
      timerRef.current = setInterval(loopChords, 2800);
      setIsPlaying(true);
    } catch (e) {
      console.error('Web Audio error:', e);
    }
  };

  const stopMusic = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.suspend();
    }
    setIsPlaying(false);
  };

  const toggleAudio = () => {
    if (isPlaying) {
      stopMusic();
    } else {
      startMusic();
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioCtxRef.current) audioCtxRef.current.close();
    };
  }, []);

  return (
    <button
      type="button"
      onClick={toggleAudio}
      className={`fixed bottom-5 right-5 z-40 flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-medium tracking-wide shadow-md backdrop-blur-md transition-all duration-300 border ${
        isPlaying
          ? 'bg-[#F8E2EB]/90 text-[#8B1E2F] border-[#E8A0B8] shadow-[#E8A0B8]/30 scale-105'
          : 'bg-white/80 text-[#7A6966] border-[#F8E2EB] hover:bg-[#F8E2EB]/60 hover:text-[#2B2320]'
      }`}
      title={isPlaying ? 'Pause romantic ambiance' : 'Play romantic music box ambiance'}
      aria-label="Toggle romantic music ambiance"
    >
      {isPlaying ? (
        <>
          <Volume2 className="w-3.5 h-3.5 animate-pulse text-[#C97D91]" />
          <span>Soft Melody: On</span>
          <span className="flex h-1.5 w-1.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C97D91] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#8B1E2F]"></span>
          </span>
        </>
      ) : (
        <>
          <Music className="w-3.5 h-3.5 text-[#C97D91]" />
          <span>Romantic Ambiance</span>
        </>
      )}
    </button>
  );
}
