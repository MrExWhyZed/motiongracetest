'use client';

import React, { useEffect, useRef, useState } from 'react';

const transformPairs = [
  {
    before: { label: '6 weeks', sub: 'production timeline', color: '#666680' },
    after: { label: '5 days', sub: 'from brief to delivery', color: '#C9A96E' },
    icon: '⏱',
  },
  {
    before: { label: '$80,000', sub: 'per campaign shoot', color: '#666680' },
    after: { label: '$8,000', sub: 'full campaign output', color: '#4A9EFF' },
    icon: '💸',
  },
  {
    before: { label: '20 assets', sub: 'from one shoot', color: '#666680' },
    after: { label: '100+ assets', sub: 'from one digital twin', color: '#8B5CF6' },
    icon: '🗂',
  },
  {
    before: { label: 'Reshoots', sub: 'every time you change', color: '#666680' },
    after: { label: 'Instant', sub: 'render any variant now', color: '#C9A96E' },
    icon: '♾',
  },
];

function TransformCard({ pair, index, sectionProgress }: {
  pair: typeof transformPairs[0];
  index: number;
  sectionProgress: number;
}) {
  const delay = index * 0.12;
  const cardProgress = Math.max(0, Math.min(1, (sectionProgress - delay) / 0.4));

  return (
    <div
      style={{
        opacity: cardProgress,
        transform: `translateY(${(1 - cardProgress) * 40}px) scale(${0.94 + cardProgress * 0.06})`,
        transition: 'none',
      }}
    >
      <div
        className="relative overflow-hidden rounded-2xl p-6"
        style={{
          background: 'rgba(8,8,16,0.8)',
          border: '1px solid rgba(255,255,255,0.04)',
        }}
      >
        {/* Before panel */}
        <div
          className="mb-6 p-4 rounded-xl relative overflow-hidden"
          style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.04)',
          }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(255,255,255,0.01) 4px, rgba(255,255,255,0.01) 8px)',
            }}
          />
          <div className="text-[9px] tracking-[0.25em] uppercase mb-2" style={{ color: 'rgba(255,255,255,0.2)' }}>
            Before
          </div>
          <div
            className="text-2xl font-black tracking-tight"
            style={{
              color: pair.before.color,
              textDecoration: 'line-through',
              textDecorationColor: 'rgba(255,80,80,0.5)',
            }}
          >
            {pair.before.label}
          </div>
          <div className="text-[11px] mt-1" style={{ color: 'rgba(255,255,255,0.2)' }}>
            {pair.before.sub}
          </div>
        </div>

        {/* Arrow */}
        <div className="flex justify-center mb-6">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
            style={{
              background: `${pair.after.color}12`,
              border: `1px solid ${pair.after.color}25`,
              color: pair.after.color,
              animation: 'arrow-pulse 2s ease-in-out infinite',
              animationDelay: `${index * 0.3}s`,
            }}
          >
            ↓
          </div>
        </div>

        {/* After panel */}
        <div
          className="p-4 rounded-xl relative overflow-hidden"
          style={{
            background: `${pair.after.color}06`,
            border: `1px solid ${pair.after.color}18`,
            boxShadow: `0 0 30px ${pair.after.color}08`,
          }}
        >
          <div className="text-[9px] tracking-[0.25em] uppercase mb-2" style={{ color: `${pair.after.color}70` }}>
            After MotionGrace
          </div>
          <div
            className="text-2xl font-black tracking-tight"
            style={{
              color: pair.after.color,
              textShadow: `0 0 20px ${pair.after.color}50`,
            }}
          >
            {pair.after.label}
          </div>
          <div className="text-[11px] mt-1" style={{ color: `${pair.after.color}70` }}>
            {pair.after.sub}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TransformationSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [sectionProgress, setSectionProgress] = useState<number>(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const vh = window.innerHeight;
      const progress = Math.max(0, Math.min(1, 1 - rect.top / (vh * 0.8)));
      setSectionProgress(progress);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden py-32 sm:py-48 px-6 sm:px-10"
      style={{
        background: 'linear-gradient(to bottom, #06060C 0%, #080A12 50%, #0A0C14 100%)',
      }}
    >
      {/* Subtle purple/blue ambient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 70% 50% at 50% 60%, rgba(139,92,246,0.04) 0%, transparent 70%)',
          opacity: sectionProgress,
        }}
      />

      {/* Flowing lines background */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ opacity: 0.03 }}
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="line-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="50%" stopColor="#C9A96E" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
        {Array.from({ length: 8 }, (_, i) => (
          <line
            key={i}
            x1="0" y1={`${10 + i * 12}%`}
            x2="100%" y2={`${10 + i * 12}%`}
            stroke="url(#line-grad)"
            strokeWidth="1"
          />
        ))}
      </svg>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <div
          className="text-center mb-20"
          style={{
            opacity: sectionProgress > 0.05 ? 1 : 0,
            transform: `translateY(${sectionProgress > 0.05 ? 0 : 24}px)`,
            transition: 'all 1s cubic-bezier(0.16,1,0.3,1)',
          }}
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-px w-16" style={{ background: 'linear-gradient(90deg, transparent, rgba(201,169,110,0.3))' }} />
            <span className="text-[9px] tracking-[0.3em] uppercase" style={{ color: 'rgba(201,169,110,0.5)' }}>
              The Transformation
            </span>
            <div className="h-px w-16" style={{ background: 'linear-gradient(90deg, rgba(201,169,110,0.3), transparent)' }} />
          </div>

          <h2
            className="font-black tracking-tighter leading-none"
            style={{ fontSize: 'clamp(2.2rem, 6vw, 5rem)', letterSpacing: '-0.04em' }}
          >
            <span style={{ color: 'rgba(237,233,227,0.85)' }}>This is </span>
            <span
              style={{
                background: 'linear-gradient(135deg, #8B6F3E 0%, #F2E4C4 40%, #D4A96A 70%, #C9956E 100%)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              the upgrade.
            </span>
          </h2>
        </div>

        {/* Transform grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {transformPairs.map((pair, i) => (
          {/* @ts-expect-error React 19 key prop inference */
            <TransformCard
              key={i}
              pair={pair}
              index={i}
              sectionProgress={sectionProgress as number}
            />
          ))}
        </div>

        {/* Bottom summary statement */}
        <div
          className="text-center mt-20"
          style={{
            opacity: sectionProgress > 0.6 ? 1 : 0,
            transform: `translateY(${sectionProgress > 0.6 ? 0 : 20}px)`,
            transition: 'all 0.9s cubic-bezier(0.16,1,0.3,1) 0.4s',
          }}
        >
          <p
            className="font-light"
            style={{
              fontSize: 'clamp(1.1rem, 2.5vw, 1.6rem)',
              color: 'rgba(237,233,227,0.5)',
              letterSpacing: '-0.01em',
              maxWidth: '600px',
              margin: '0 auto',
            }}
          >
            One digital twin. Every campaign.{' '}
            <span style={{ color: 'rgba(201,169,110,0.85)', fontWeight: 600 }}>Forever.</span>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes arrow-pulse {
          0%, 100% { transform: translateY(0); opacity: 1; }
          50%       { transform: translateY(3px); opacity: 0.7; }
        }
      `}</style>
    </section>
  );
}
