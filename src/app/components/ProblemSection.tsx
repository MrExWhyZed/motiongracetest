'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';

/* ─────────────── data ─────────────── */

const problemWords = [
  { text: 'Your', accent: false },
  { text: 'product', accent: false },
  { text: 'shoots', accent: false },
  { text: 'take', accent: false },
  { text: '6 weeks.', accent: true },
  { text: 'Cost you', accent: false },
  { text: '$80,000.', accent: true },
  { text: 'Deliver', accent: false },
  { text: '20 assets.', accent: true },
  { text: 'And go', accent: false },
  { text: 'out of date', accent: false },
  { text: 'in months.', accent: true },
];

const painPoints = [
  { label: 'Studio rental', value: '$4,200/day', color: '#ff6b6b' },
  { label: 'Photographer fees', value: '$8,000+', color: '#ffa94d' },
  { label: 'Reshoots & revisions', value: 'Endless', color: '#ff6b6b' },
  { label: 'Final asset count', value: '≈20 images', color: '#ffa94d' },
];

const revealPhrases = [
  { word: 'There', type: 'plain' },
  { word: 'is', type: 'plain' },
  { word: 'a', type: 'plain' },
  { word: 'Better', type: 'highlight' },
  { word: 'Way.', type: 'highlight' },
  { word: 'Try', type: 'plain' },
  { word: 'MotionGrace.', type: 'brand' },
];

/* ─────────────── COMPONENT ─────────────── */

export default function ProblemSection() {
  const screen1Ref = useRef<HTMLElement>(null);
  const screen2Ref = useRef<HTMLElement>(null);

  const [visibleLines, setVisibleLines] = useState<boolean[]>(new Array(problemWords.length).fill(false));
  const [distortLevel, setDistortLevel] = useState(0);
  const [wordProgress, setWordProgress] = useState(0);

  /* ───────── SCROLL LOGIC ───────── */

  const handleScroll = useCallback(() => {
    if (screen1Ref.current) {
      const rect = screen1Ref.current.getBoundingClientRect();
      const vh = window.innerHeight;

      const prog = Math.max(0, Math.min(1, 1 - rect.top / vh));

      setVisibleLines(problemWords.map((_, i) => prog > (i / problemWords.length) * 0.7));
      setDistortLevel(Math.min(prog * 1.5, 1));
    }

    if (screen2Ref.current) {
      const rect = screen2Ref.current.getBoundingClientRect();
      const vh = window.innerHeight;

      const total = screen2Ref.current.offsetHeight - vh;
      const scrolled = -rect.top;

      const raw = Math.max(0, Math.min(1, total > 0 ? scrolled / total : 0));

      setWordProgress(Math.max(0, Math.min(1, raw * 2)));
    }
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return (
    <>
      {/* ═══ SCREEN 1 ═══ */}
      <section
        ref={screen1Ref}
        className="relative overflow-hidden flex flex-col justify-center px-6 sm:px-10"
        style={{ minHeight: '100vh', background: 'linear-gradient(to bottom, #04040A, #080810, #0A0508)' }}
      >
        <div className="relative z-10 w-full py-20" style={{ maxWidth: '96vw', margin: '0 auto' }}>
          <div className="mb-12" style={{ lineHeight: 1.05 }}>
            {problemWords.map((word, i) => (
              <span
                key={i}
                style={{
                  fontSize: 'clamp(2.8rem, 7.2vw, 7rem)',
                  fontWeight: word.accent ? 800 : 300,
                  color: word.accent ? '#ff6b6b' : 'rgba(237,233,227,0.88)',
                  transform: visibleLines[i] ? 'translateY(0)' : 'translateY(110%)',
                  opacity: visibleLines[i] ? 1 : 0,
                  transition: `all 0.7s cubic-bezier(0.16,1,0.3,1) ${i * 0.06}s`,
                  display: 'inline-block',
                  marginRight: '0.25em',
                }}
              >
                {word.text}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {painPoints.map((point, i) => (
              <div
                key={i}
                className="rounded-xl p-5"
                style={{
                  background: 'rgba(255,80,80,0.03)',
                  border: '1px solid rgba(255,80,80,0.1)',
                }}
              >
                <div className="text-[9px] uppercase mb-2">{point.label}</div>
                <div className="text-2xl font-bold" style={{ color: point.color }}>
                  {point.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SCREEN 2 ═══ */}
      <section ref={screen2Ref} style={{ height: '300vh' }}>
        <div className="sticky top-0 h-screen flex items-center justify-center">
          
          {/* ✨ FIXED PREMIUM TEXT REVEAL */}
          <div
            className="flex flex-wrap justify-center text-center"
            style={{ perspective: '900px', gap: '0.2em' }}
          >
            {revealPhrases.map((seg, i) => {
              const n = revealPhrases.length;

              const start = (i / n) * 0.75;
              const end = start + 0.28;

              let raw = (wordProgress - start) / (end - start);
              raw = Math.max(0, Math.min(1, raw));

              const ease = (t: number) => 1 - Math.pow(1 - t, 3);
              const p = ease(raw);

              const isH = seg.type === 'highlight';
              const isB = seg.type === 'brand';

              return (
                <span key={i}>
                  <span
                    style={{
                      display: 'inline-block',
                      fontSize: 'clamp(2.2rem, 6vw, 5rem)',
                      fontWeight: isB ? 900 : isH ? 800 : 300,

                      opacity: p,

                      transform: `
                        translateY(${(1 - p) * 80}%)
                        rotateX(${(1 - p) * -40}deg)
                        scale(${0.85 + p * 0.15})
                      `,

                      filter: `
                        blur(${(1 - p) * 14}px)
                        brightness(${0.8 + p * 0.2})
                      `,

                      transition: 'none',

                      color: isB
                        ? 'transparent'
                        : isH
                        ? `rgba(237,233,227,${0.7 + p * 0.3})`
                        : `rgba(237,233,227,${0.4 + p * 0.3})`,

                      background: isB
                        ? 'linear-gradient(135deg, #B8935A, #F2E09E, #C9A96E)'
                        : 'none',

                      WebkitBackgroundClip: isB ? 'text' : 'unset',
                      backgroundClip: isB ? 'text' : 'unset',
                    }}
                  >
                    {seg.word}
                  </span>
                </span>
              );
            })}
          </div>

        </div>
      </section>
    </>
  );
}
