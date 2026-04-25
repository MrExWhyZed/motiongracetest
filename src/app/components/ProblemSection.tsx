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
  { word: 'There  ', type: 'plain' },
  { word: 'is  ', type: 'plain' },
  { word: 'a  ', type: 'plain' },
  { word: 'Better  ', type: 'highlight' },
  { word: 'Way  ', type: 'highlight' },
  { word: 'with  ', type: 'plain' },
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
    <>
      {/* ── SCREEN 1: Problem statement + pain point widgets ── */}
      <section
        ref={sectionRef}
        className="relative overflow-hidden flex flex-col justify-center px-6 sm:px-10"
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(to bottom, #04040A 0%, #080810 50%, #0A0508 100%)',
        }}
      >
        {/* Noise */}
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
          width: '350px', height: '350px',
          background: 'radial-gradient(ellipse at 0% 0%, rgba(255,80,80,0.07) 0%, transparent 70%)',
        }} />

        <div className="relative z-10 w-full py-20" style={{ maxWidth: '96vw', margin: '0 auto' }}>
          {/* Label */}
          <div className="mb-8 flex items-center gap-3" style={{
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

          {/* Problem headline — fills the screen */}
          <div className="mb-12" style={{ lineHeight: 1.05 }}>
            {problemWords.map((word, i) => (
              <span
                key={i}
                style={{
                  fontSize: 'clamp(2.8rem, 7.2vw, 7rem)',
                  fontWeight: word.accent ? 800 : 300,
                  letterSpacing: '-0.03em',
                  color: word.accent ? '#ff6b6b' : 'rgba(237,233,227,0.88)',
                  transform: visibleLines[i] ? 'translateY(0)' : 'translateY(110%)',
                  opacity: visibleLines[i] ? 1 : 0,
                  transition: `transform 0.7s cubic-bezier(0.16,1,0.3,1) ${i * 0.06}s, opacity 0.5s ease ${i * 0.06}s`,
                  display: 'inline-block',
                  textShadow: word.accent ? '0 0 40px rgba(255,80,80,0.4)' : 'none',
                  filter: word.accent && distortLevel > 0.6 ? 'drop-shadow(0 0 8px rgba(255,80,80,0.55))' : 'none',
                  animation: word.accent && distortLevel > 0.7 ? 'glitch-text 3s ease-in-out infinite' : 'none',
                  marginRight: '0.25em',
                }}
              >
                {word.text}
              </span>
            ))}
          </div>

          {/* Floating pain point widgets */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3" style={{
            opacity: distortLevel > 0.4 ? 1 : 0,
            transform: `translateY(${distortLevel > 0.4 ? 0 : 24}px)`,
            transition: 'all 1s cubic-bezier(0.16,1,0.3,1) 0.2s',
          }}>
            {painPoints.map((point, i) => (
              <div key={i} className="rounded-xl p-5 relative overflow-hidden" style={{
                background: 'rgba(255,80,80,0.03)',
                border: '1px solid rgba(255,80,80,0.1)',
                animation: `pain-flicker ${2 + i * 0.7}s ease-in-out infinite, widget-float ${6 + i * 1.1}s ease-in-out infinite`,
                animationDelay: `${i * 0.4}s, ${i * 0.7}s`,
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              }}>
                <div className="text-[9px] tracking-widest uppercase mb-2" style={{ color: 'rgba(237,233,227,0.3)' }}>
                  {point.label}
                </div>
                <div className="text-2xl font-bold" style={{
                  color: point.color,
                  textShadow: `0 0 20px ${point.color}60`,
                  animation: 'value-flicker 2.5s ease-in-out infinite',
                  animationDelay: `${i * 0.3}s`,
                }}>{point.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SCREEN 2: "There is a Better Way" reveal — full viewport ── */}
      <section
        className="relative overflow-hidden flex items-center justify-center px-6 sm:px-10"
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(to bottom, #060408 0%, #080810 50%, #06060E 100%)',
        }}
      >
        {/* Soft ambient glow */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(201,169,110,0.04) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }} />

        <div ref={revealRef} className="relative z-10 w-full max-w-4xl mx-auto text-center">
          {/* Atmospheric bloom */}
          <div className="absolute inset-0 pointer-events-none -z-10" style={{
            background: `radial-gradient(ellipse 80% 70% at 50% 50%, rgba(201,169,110,${glowPulse ? 0.1 : 0.02}) 0%, transparent 70%)`,
            transition: 'all 1.4s ease',
            filter: 'blur(50px)',
            animation: glowPulse ? 'reveal-glow-pulse 3.5s ease-in-out infinite 0.8s' : 'none',
          }} />

          <div
            className="flex flex-wrap justify-center items-baseline text-center"
            style={{ perspective: '900px', perspectiveOrigin: '50% 50%', gap: '0.12em 0.35em' }}
          >
            {revealWords.map((seg, i) => {
              const totalWords = revealWords.length;
              const wordStart = (i / totalWords) * 0.65;
              const wordWindow = 0.22;
              const localP = Math.max(0, Math.min(1, (wordProgress - wordStart) / wordWindow));
              const isHighlight = seg.type === 'highlight';
              const isBrand = seg.type === 'brand';

              return (
                <span key={i} className="inline-block overflow-visible" style={{ verticalAlign: 'baseline' }}>
                  <span style={{
                    display: 'inline-block',
                    fontSize: 'clamp(2rem, 5.5vw, 4.2rem)',
                    fontWeight: isBrand ? 900 : isHighlight ? 800 : 300,
                    letterSpacing: isBrand ? '-0.03em' : isHighlight ? '-0.025em' : '-0.01em',
                    lineHeight: 1.15,
                    filter: `blur(${(1 - localP) * 14}px)`,
                    transform: `translateY(${(1 - localP) * 55}%) rotateX(${(1 - localP) * -28}deg) scale(${0.88 + localP * 0.12})`,
                    opacity: localP,
                    transition: `transform 0.85s cubic-bezier(0.16,1,0.3,1) ${i * 70}ms, opacity 0.65s ease ${i * 70}ms, filter 0.75s ease ${i * 70}ms`,
                    color: isBrand ? 'transparent' : isHighlight ? 'rgba(237,233,227,1)' : 'rgba(237,233,227,0.55)',
                    background: isBrand ? 'linear-gradient(135deg, #B8935A 0%, #F2E09E 42%, #D6BA7C 68%, #C9A96E 100%)' : 'none',
                    WebkitBackgroundClip: isBrand ? 'text' : 'unset',
                    backgroundClip: isBrand ? 'text' : 'unset',
                    textShadow: isBrand ? 'none' : isHighlight && localP > 0.85 ? '0 0 50px rgba(237,233,227,0.15)' : 'none',
                  }}>
                    {seg.word}
                  </span>
                </span>
              );
            })}
          </div>

          {/* Subtle underline after full reveal */}
          <div className="flex justify-center mt-8">
            <div style={{ height: '1px', width: '320px', overflow: 'hidden', opacity: wordProgress > 0.9 ? 1 : 0, transition: 'opacity 0.6s ease 0.3s' }}>
              <div style={{
                height: '1px',
                width: wordProgress > 0.9 ? '100%' : '0%',
                background: 'linear-gradient(90deg, transparent 0%, rgba(201,169,110,0.3) 20%, rgba(201,169,110,0.6) 50%, rgba(201,169,110,0.3) 80%, transparent 100%)',
                transition: 'width 1.4s cubic-bezier(0.16,1,0.3,1) 0.2s',
              }} />
            </div>
          </div>
        </div>
      </section>

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
        @keyframes widget-float {
          0%, 100% { transform: translateY(0px); }
          40% { transform: translateY(-8px); }
          70% { transform: translateY(-4px); }
        }
        @keyframes value-flicker {
          0%, 88%, 100% { opacity: 1; }
          90% { opacity: 0.6; }
          93% { opacity: 1; }
        }
        @keyframes reveal-glow-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </>
  );
}
