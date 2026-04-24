'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';

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

const revealWords = [
  { word: 'There', type: 'plain' },
  { word: 'is', type: 'plain' },
  { word: 'a', type: 'plain' },
  { word: 'Better', type: 'highlight' },
  { word: 'Way', type: 'highlight' },
  { word: 'with', type: 'plain' },
  { word: 'MotionGrace.', type: 'brand' },
];

export default function ProblemSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const revealRef = useRef<HTMLDivElement>(null);
  const [visibleLines, setVisibleLines] = useState<boolean[]>(new Array(problemWords.length).fill(false));
  const [distortLevel, setDistortLevel] = useState(0);
  const [wordProgress, setWordProgress] = useState(0);
  const [glowPulse, setGlowPulse] = useState(false);
  const glowTriggered = useRef(false);

  const handleScroll = useCallback(() => {
    if (!sectionRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    const vh = window.innerHeight;
    const progress = Math.max(0, Math.min(1, 1 - rect.top / vh));

    setVisibleLines(problemWords.map((_, i) => progress > (i / problemWords.length) * 0.7));
    setDistortLevel(Math.min(progress * 1.5, 1));

    if (revealRef.current) {
      const rr = revealRef.current.getBoundingClientRect();
      const start = vh * 0.9;
      const end = vh * 0.15;
      const wp = Math.max(0, Math.min(1, (start - rr.top) / (start - end)));
      setWordProgress(wp);
      if (wp > 0.92 && !glowTriggered.current) {
        glowTriggered.current = true;
        setTimeout(() => setGlowPulse(true), 500);
      }
    }
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden py-20 sm:py-28 px-6 sm:px-10"
      style={{ background: 'linear-gradient(to bottom, #04040A 0%, #080810 30%, #0A0508 70%, #060408 100%)' }}
    >
      <div className="absolute inset-0 pointer-events-none" style={{
        opacity: 0.04 + distortLevel * 0.03,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundSize: '150px 150px',
        animation: 'noise-shift 0.5s steps(3) infinite',
      }} />
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(180,30,30,0.04) 0%, transparent 70%)',
        opacity: distortLevel,
      }} />
      <div className="absolute top-0 left-0 pointer-events-none" style={{
        width: '300px', height: '300px',
        background: 'radial-gradient(ellipse at 0% 0%, rgba(255,80,80,0.06) 0%, transparent 70%)',
      }} />

      <div className="relative z-10 max-w-5xl mx-auto">
        <div className="mb-10 flex items-center gap-3" style={{
          opacity: distortLevel > 0.1 ? 1 : 0,
          transform: `translateY(${distortLevel > 0.1 ? 0 : 16}px)`,
          transition: 'all 0.8s cubic-bezier(0.16,1,0.3,1)',
        }}>
          <div className="w-1.5 h-1.5 rounded-full" style={{
            background: '#ff6b6b', boxShadow: '0 0 8px rgba(255,80,80,0.8)',
            animation: 'flicker-dot 1.8s ease-in-out infinite',
          }} />
          <span className="text-[10px] tracking-[0.3em] uppercase" style={{ color: 'rgba(255,107,107,0.6)' }}>
            The Reality Check
          </span>
        </div>

        {/* Problem text — continuous inline flow, no extra gaps */}
        <div className="mb-14" style={{ lineHeight: 1.15 }}>
          {problemWords.map((word, i) => (
            <span
              key={i}
              style={{
                fontSize: 'clamp(1.6rem, 3.8vw, 3.2rem)',
                fontWeight: word.accent ? 800 : 300,
                letterSpacing: '-0.02em',
                color: word.accent ? '#ff6b6b' : 'rgba(237,233,227,0.85)',
                transform: visibleLines[i] ? 'translateY(0)' : 'translateY(110%)',
                opacity: visibleLines[i] ? 1 : 0,
                transition: `transform 0.7s cubic-bezier(0.16,1,0.3,1) ${i * 0.06}s, opacity 0.5s ease ${i * 0.06}s`,
                display: 'inline-block',
                textShadow: word.accent ? '0 0 30px rgba(255,80,80,0.35)' : 'none',
                filter: word.accent && distortLevel > 0.6 ? 'drop-shadow(0 0 6px rgba(255,80,80,0.5))' : 'none',
                animation: word.accent && distortLevel > 0.7 ? 'glitch-text 3s ease-in-out infinite' : 'none',
                marginRight: '0.22em',
              }}
            >
              {word.text}
            </span>
          ))}
        </div>

        {/* Pain points */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3" style={{
          opacity: distortLevel > 0.5 ? 1 : 0,
          transform: `translateY(${distortLevel > 0.5 ? 0 : 24}px)`,
          transition: 'all 1s cubic-bezier(0.16,1,0.3,1) 0.2s',
        }}>
          {painPoints.map((point, i) => (
            <div key={i} className="rounded-xl p-4 relative overflow-hidden" style={{
              background: 'rgba(255,80,80,0.03)',
              border: '1px solid rgba(255,80,80,0.1)',
              animation: `pain-flicker ${2 + i * 0.7}s ease-in-out infinite`,
              animationDelay: `${i * 0.4}s`,
            }}>
              <div className="text-[9px] tracking-widest uppercase mb-1.5" style={{ color: 'rgba(237,233,227,0.3)' }}>
                {point.label}
              </div>
              <div className="text-lg font-bold" style={{
                color: point.color,
                textShadow: `0 0 20px ${point.color}60`,
                animation: 'value-flicker 2.5s ease-in-out infinite',
                animationDelay: `${i * 0.3}s`,
              }}>{point.value}</div>
            </div>
          ))}
        </div>

        {/* Word-by-word reveal — no separator lines or dots */}
        <div ref={revealRef} className="mt-20 sm:mt-24 relative pb-4">
          <div className="absolute inset-0 pointer-events-none -z-10" style={{
            background: `radial-gradient(ellipse 80% 70% at 50% 60%, rgba(201,169,110,${glowPulse ? 0.09 : 0.02}) 0%, transparent 70%)`,
            transition: 'all 1.4s ease',
            filter: 'blur(40px)',
            animation: glowPulse ? 'reveal-glow-pulse 3.5s ease-in-out infinite 0.8s' : 'none',
          }} />

          <div
            className="flex flex-wrap justify-center items-baseline text-center"
            style={{ perspective: '900px', perspectiveOrigin: '50% 100%', gap: '0 0.22em' }}
          >
            {revealWords.map((seg, i) => {
              const totalWords = revealWords.length;
              const wordStart = (i / totalWords) * 0.65;
              const wordWindow = 0.22;
              const localP = Math.max(0, Math.min(1, (wordProgress - wordStart) / wordWindow));
              const isHighlight = seg.type === 'highlight';
              const isBrand = seg.type === 'brand';

              return (
                <span key={i} className="inline-block overflow-visible" style={{ verticalAlign: 'bottom' }}>
                  <span style={{
                    display: 'inline-block',
                    fontSize: 'clamp(1.5rem, 3.6vw, 2.8rem)',
                    fontWeight: isBrand ? 900 : isHighlight ? 800 : 300,
                    letterSpacing: isBrand ? '-0.03em' : isHighlight ? '-0.025em' : '-0.01em',
                    lineHeight: 1.1,
                    filter: `blur(${(1 - localP) * 14}px)`,
                    transform: `translateY(${(1 - localP) * 55}%) rotateX(${(1 - localP) * -28}deg) scale(${0.88 + localP * 0.12})`,
                    opacity: localP,
                    transition: `transform 0.85s cubic-bezier(0.16,1,0.3,1) ${i * 60}ms, opacity 0.65s ease ${i * 60}ms, filter 0.75s ease ${i * 60}ms`,
                    color: isBrand ? 'transparent' : isHighlight ? 'rgba(237,233,227,1)' : 'rgba(237,233,227,0.52)',
                    background: isBrand ? 'linear-gradient(135deg, #B8935A 0%, #F2E09E 42%, #D6BA7C 68%, #C9A96E 100%)' : 'none',
                    WebkitBackgroundClip: isBrand ? 'text' : 'unset',
                    backgroundClip: isBrand ? 'text' : 'unset',
                    textShadow: isBrand ? 'none' : isHighlight && localP > 0.85 ? '0 0 50px rgba(237,233,227,0.12)' : 'none',
                  }}>
                    {seg.word}
                  </span>
                </span>
              );
            })}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes noise-shift {
          0%   { background-position: 0 0 }
          33%  { background-position: -8px 12px }
          66%  { background-position: 5px -8px }
          100% { background-position: 0 0 }
        }
        @keyframes flicker-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          40% { opacity: 0.3; transform: scale(0.7); }
          60% { opacity: 0.8; transform: scale(1.2); }
        }
        @keyframes glitch-text {
          0%, 90%, 100% { transform: translateX(0); filter: none; }
          92% { transform: translateX(-3px); filter: hue-rotate(15deg); }
          94% { transform: translateX(3px); filter: hue-rotate(-15deg); }
          96% { transform: translateX(-2px); filter: hue-rotate(10deg); }
        }
        @keyframes pain-flicker {
          0%, 95%, 100% { opacity: 1; border-color: rgba(255,80,80,0.1); }
          97% { opacity: 0.85; border-color: rgba(255,80,80,0.2); }
        }
        @keyframes value-flicker {
          0%, 88%, 100% { opacity: 1; }
          90% { opacity: 0.6; }
          93% { opacity: 1; }
        }
        @keyframes reveal-glow-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.55; }
        }
      `}</style>
    </section>
  );
}
