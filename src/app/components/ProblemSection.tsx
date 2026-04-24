'use client';

import React, { useEffect, useRef, useState } from 'react';

const problemLines = [
  { text: 'Your product shoots take', accent: false },
  { text: '6 weeks.', accent: true },
  { text: 'Cost you', accent: false },
  { text: '$80,000.', accent: true },
  { text: 'Deliver', accent: false },
  { text: '20 assets.', accent: true },
  { text: 'And go', accent: false },
  { text: 'out of date in months.', accent: true },
];

const painPoints = [
  { label: 'Studio rental', value: '$4,200/day', color: '#ff6b6b' },
  { label: 'Photographer fees', value: '$8,000+', color: '#ffa94d' },
  { label: 'Reshoots & revisions', value: 'Endless', color: '#ff6b6b' },
  { label: 'Final asset count', value: '≈20 images', color: '#ffa94d' },
];

export default function ProblemSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const textLinesRef = useRef<(HTMLDivElement | null)[]>([]);
  const [visibleLines, setVisibleLines] = useState<boolean[]>(new Array(problemLines.length).fill(false));
  const [distortLevel, setDistortLevel] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const vh = window.innerHeight;
      const progress = Math.max(0, Math.min(1, 1 - rect.top / vh));

      // Reveal lines progressively
      const newVisible = problemLines.map((_, i) => {
        const threshold = i / problemLines.length;
        return progress > threshold * 0.7;
      });
      setVisibleLines(newVisible);

      // Increase distortion as we scroll in
      setDistortLevel(Math.min(progress * 1.5, 1));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden py-28 sm:py-40 px-6 sm:px-10"
      style={{
        background: `linear-gradient(to bottom, #04040A 0%, #080810 30%, #0A0508 70%, #060408 100%)`,
      }}
    >
      {/* Animated noise grain overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: 0.04 + distortLevel * 0.03,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '150px 150px',
          animation: 'noise-shift 0.5s steps(3) infinite',
        }}
      />

      {/* Subtle red tint veil */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(180,30,30,0.04) 0%, transparent 70%)',
          opacity: distortLevel,
        }}
      />

      {/* Glitch scanlines */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.04) 2px, rgba(0,0,0,0.04) 4px)',
          opacity: 0.4 + distortLevel * 0.3,
        }}
      />

      {/* Corner accent */}
      <div
        className="absolute top-0 left-0 pointer-events-none"
        style={{
          width: '300px',
          height: '300px',
          background: 'radial-gradient(ellipse at 0% 0%, rgba(255,80,80,0.06) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto">

        {/* Section label */}
        <div
          className="mb-16 flex items-center gap-3"
          style={{
            opacity: distortLevel > 0.1 ? 1 : 0,
            transform: `translateY(${distortLevel > 0.1 ? 0 : 16}px)`,
            transition: 'all 0.8s cubic-bezier(0.16,1,0.3,1)',
          }}
        >
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{
              background: '#ff6b6b',
              boxShadow: '0 0 8px rgba(255,80,80,0.8)',
              animation: 'flicker-dot 1.8s ease-in-out infinite',
            }}
          />
          <span
            className="text-[10px] tracking-[0.3em] uppercase"
            style={{ color: 'rgba(255,107,107,0.6)' }}
          >
            The Reality Check
          </span>
        </div>

        {/* Main headline lines — mask reveal */}
        <div className="mb-20">
          {problemLines.map((line, i) => (
            <div
              key={i}
              ref={(el: HTMLDivElement | null) => { textLinesRef.current[i] = el; }}
              className="overflow-hidden"
              style={{ display: i % 2 === 0 ? 'inline' : 'inline', marginRight: '0.3em' }}
            >
              <span
                className="inline-block"
                style={{
                  fontSize: 'clamp(2.2rem, 5.5vw, 4.8rem)',
                  fontWeight: i % 2 === 0 ? 300 : 800,
                  letterSpacing: '-0.03em',
                  lineHeight: 1.05,
                  color: line.accent ? '#ff6b6b' : 'rgba(237,233,227,0.85)',
                  transform: visibleLines[i] ? 'translateY(0)' : 'translateY(110%)',
                  opacity: visibleLines[i] ? 1 : 0,
                  transition: `transform 0.7s cubic-bezier(0.16,1,0.3,1) ${i * 0.06}s, opacity 0.5s ease ${i * 0.06}s`,
                  display: 'inline-block',
                  textShadow: line.accent ? '0 0 30px rgba(255,80,80,0.35)' : 'none',
                  filter: line.accent && distortLevel > 0.6 ? `drop-shadow(0 0 6px rgba(255,80,80,0.5))` : 'none',
                  animation: line.accent && distortLevel > 0.7 ? 'glitch-text 3s ease-in-out infinite' : 'none',
                }}
              >
                {line.text}&nbsp;
              </span>
            </div>
          ))}
        </div>

        {/* Pain point stat grid */}
        <div
          className="grid grid-cols-2 sm:grid-cols-4 gap-4"
          style={{
            opacity: distortLevel > 0.5 ? 1 : 0,
            transform: `translateY(${distortLevel > 0.5 ? 0 : 24}px)`,
            transition: 'all 1s cubic-bezier(0.16,1,0.3,1) 0.2s',
          }}
        >
          {painPoints.map((point, i) => (
            <div
              key={i}
              className="rounded-2xl p-5 relative overflow-hidden"
              style={{
                background: 'rgba(255,80,80,0.03)',
                border: '1px solid rgba(255,80,80,0.1)',
                animation: `pain-flicker ${2 + i * 0.7}s ease-in-out infinite`,
                animationDelay: `${i * 0.4}s`,
              }}
            >
              <div
                className="text-[9px] tracking-widest uppercase mb-2"
                style={{ color: 'rgba(237,233,227,0.3)' }}
              >
                {point.label}
              </div>
              <div
                className="text-xl font-bold"
                style={{
                  color: point.color,
                  textShadow: `0 0 20px ${point.color}60`,
                  animation: 'value-flicker 2.5s ease-in-out infinite',
                  animationDelay: `${i * 0.3}s`,
                }}
              >
                {point.value}
              </div>
            </div>
          ))}
        </div>

        {/* Transition question */}
        <div
          className="mt-20 text-center"
          style={{
            opacity: distortLevel > 0.7 ? 1 : 0,
            transform: `translateY(${distortLevel > 0.7 ? 0 : 20}px)`,
            transition: 'all 0.9s cubic-bezier(0.16,1,0.3,1) 0.3s',
          }}
        >
          <p
            style={{
              fontSize: 'clamp(1rem, 2.5vw, 1.4rem)',
              color: 'rgba(201,169,110,0.7)',
              fontWeight: 300,
              letterSpacing: '0.04em',
            }}
          >
            There is a better way. &darr;
          </p>
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
          40%       { opacity: 0.3; transform: scale(0.7); }
          60%       { opacity: 0.8; transform: scale(1.2); }
        }
        @keyframes glitch-text {
          0%, 90%, 100% { transform: translateX(0); filter: none; }
          92%  { transform: translateX(-3px); filter: hue-rotate(15deg); }
          94%  { transform: translateX(3px); filter: hue-rotate(-15deg); }
          96%  { transform: translateX(-2px); filter: hue-rotate(10deg); }
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
      `}</style>
    </section>
  );
}
