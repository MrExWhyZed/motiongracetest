'use client';

import React, { useEffect, useRef, useState } from 'react';

// ─── DATA ────────────────────────────────────────────────────────────────────

const transformPairs = [
  {
    before: { label: '6 weeks', sub: 'production timeline', color: '#666680' },
    after: { label: '5 days', sub: 'from brief to delivery', color: '#C9A96E' },
  },
  {
    before: { label: '$80,000', sub: 'per campaign shoot', color: '#666680' },
    after: { label: '$8,000', sub: 'full campaign output', color: '#4A9EFF' },
  },
  {
    before: { label: '20 assets', sub: 'from one shoot', color: '#666680' },
    after: { label: '100+ assets', sub: 'from one digital twin', color: '#8B5CF6' },
  },
  {
    before: { label: 'Reshoots', sub: 'every time you change', color: '#666680' },
    after: { label: 'Instant', sub: 'render any variant now', color: '#C9A96E' },
  },
];

const plans = [
  {
    id: 'essentials',
    name: 'The Essentials',
    price: '₹34,999',
    tagline: 'E-commerce Listings, Web Headers & Social Teasers.',
    accent: '#C9A96E',
    badge: null as string | null,
    stack: [
      { label: '1× Cinematic Loop', detail: 'Product reveal, cinematic lighting + text overlay' },
      { label: 'Environment', detail: 'Clean Studio OR Basic Virtual Set' },
      { label: '20× Standard PNGs', detail: 'Transparent bg, e-commerce angles, virtual set renders' },
      { label: 'Digital Twin Setup', detail: 'Included — $350 Value', highlight: true },
    ],
    limits: ['No Complex Simulations', 'No AR Assets', 'No Creative / Action Angles'],
  },
  {
    id: 'viral',
    name: 'The Viral Impact',
    price: '₹74,999',
    tagline: 'Ad Campaigns, Launch Events & Hero Content.',
    accent: '#4A9EFF',
    badge: 'Most Powerful' as string | null,
    stack: [
      { label: '1× High-Energy Video', detail: 'Up to 4 cuts — liquids, peel-off, particles' },
      { label: 'Environment', detail: 'Clean Studio OR Basic Virtual Set' },
      { label: '40× Mixed PNGs', detail: 'Standard + creative action stills + simulations' },
      { label: '1× AR Asset', detail: 'Optimised .glb for e-commerce' },
      { label: 'Digital Twin Setup', detail: 'Included — $350 Value', highlight: true },
    ],
    limits: [],
  },
];

// ─── TRANSFORM CARD ───────────────────────────────────────────────────────────

function TransformCard({
  pair,
  index,
  enterProgress,
  exitProgress,
}: {
  pair: (typeof transformPairs)[0];
  index: number;
  enterProgress: number;
  exitProgress: number;
}) {
  const enterDelay = index * 0.12;
  const cardEnter = Math.max(0, Math.min(1, (enterProgress - enterDelay) / 0.38));

  // staggered exit — later cards exit first (reverse stagger)
  const exitDelay = (transformPairs.length - 1 - index) * 0.08;
  const cardExit = Math.max(0, Math.min(1, (exitProgress - exitDelay) / 0.35));

  const opacity = cardEnter * (1 - cardExit);
  const translateY = (1 - cardEnter) * 44 - cardExit * 30;
  const scale = 0.94 + cardEnter * 0.06 - cardExit * 0.04;

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${translateY}px) scale(${scale})`,
        transition: 'none',
        willChange: 'transform, opacity',
      }}
    >
      <div
        style={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: '18px',
          padding: '22px',
          background: 'rgba(8,8,16,0.8)',
          border: '1px solid rgba(255,255,255,0.04)',
        }}
      >
        {/* Before */}
        <div
          style={{
            marginBottom: '18px',
            padding: '14px',
            borderRadius: '10px',
            position: 'relative',
            overflow: 'hidden',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.04)',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage:
                'repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(255,255,255,0.01) 4px, rgba(255,255,255,0.01) 8px)',
              pointerEvents: 'none',
            }}
          />
          <div style={{ fontSize: '9px', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)', marginBottom: '6px' }}>
            Before
          </div>
          <div
            style={{
              fontSize: 'clamp(1.2rem, 2.5vw, 1.6rem)',
              fontWeight: 900,
              letterSpacing: '-0.03em',
              color: pair.before.color,
              textDecoration: 'line-through',
              textDecorationColor: 'rgba(255,80,80,0.45)',
            }}
          >
            {pair.before.label}
          </div>
          <div style={{ fontSize: '11px', marginTop: '2px', color: 'rgba(255,255,255,0.2)' }}>{pair.before.sub}</div>
        </div>

        {/* Arrow */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '18px' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: `${pair.after.color}12`,
              border: `1px solid ${pair.after.color}25`,
              color: pair.after.color,
              fontSize: '13px',
              animation: 'arrowPulse 2s ease-in-out infinite',
              animationDelay: `${index * 0.3}s`,
            }}
          >
            ↓
          </div>
        </div>

        {/* After */}
        <div
          style={{
            padding: '14px',
            borderRadius: '10px',
            background: `${pair.after.color}06`,
            border: `1px solid ${pair.after.color}18`,
            boxShadow: `0 0 24px ${pair.after.color}08`,
          }}
        >
          <div style={{ fontSize: '9px', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: '6px', color: `${pair.after.color}70` }}>
            After MotionGrace
          </div>
          <div
            style={{
              fontSize: 'clamp(1.2rem, 2.5vw, 1.6rem)',
              fontWeight: 900,
              letterSpacing: '-0.03em',
              color: pair.after.color,
              textShadow: `0 0 18px ${pair.after.color}50`,
            }}
          >
            {pair.after.label}
          </div>
          <div style={{ fontSize: '11px', marginTop: '2px', color: `${pair.after.color}70` }}>{pair.after.sub}</div>
        </div>
      </div>
    </div>
  );
}

// ─── PRICING CARD ─────────────────────────────────────────────────────────────

function PricingCard({
  plan,
  index,
  enterProgress,
}: {
  plan: (typeof plans)[0];
  index: number;
  enterProgress: number;
}) {
  const [hovered, setHovered] = useState(false);
  const delay = index * 0.15;
  const cardProgress = Math.max(0, Math.min(1, (enterProgress - delay) / 0.45));
  const isPremium = !!plan.badge;

  return (
    <div
      style={{
        opacity: cardProgress,
        transform: `translateY(${(1 - cardProgress) * 48}px) scale(${0.95 + cardProgress * 0.05})`,
        transition: 'none',
        flex: 1,
        minWidth: 0,
        willChange: 'transform, opacity',
      }}
    >
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          position: 'relative',
          borderRadius: '20px',
          overflow: 'hidden',
          background: isPremium ? 'rgba(8,12,22,0.97)' : 'rgba(8,8,16,0.88)',
          border: `1px solid ${hovered ? plan.accent + '40' : isPremium ? plan.accent + '18' : 'rgba(255,255,255,0.05)'}`,
          boxShadow: hovered ? `0 28px 72px ${plan.accent}14, 0 0 0 1px ${plan.accent}22` : isPremium ? `0 16px 48px ${plan.accent}08` : 'none',
          transform: hovered ? 'translateY(-6px) scale(1.012)' : 'translateY(0) scale(1)',
          transition: 'border 0.3s ease, box-shadow 0.3s ease, transform 0.3s cubic-bezier(0.16,1,0.3,1)',
          padding: '28px 24px 24px',
          height: '100%',
          boxSizing: 'border-box',
        }}
      >
        {isPremium && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: `linear-gradient(135deg, ${plan.accent}14 0%, transparent 55%, ${plan.accent}08 100%)`,
              pointerEvents: 'none',
            }}
          />
        )}

        <div style={{ position: 'relative', zIndex: 1 }}>
          {plan.badge && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                background: `${plan.accent}14`,
                border: `1px solid ${plan.accent}28`,
                borderRadius: '100px',
                padding: '4px 11px',
                marginBottom: '16px',
                fontSize: '9px',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: plan.accent,
                fontWeight: 600,
              }}
            >
              <span style={{ fontSize: '7px' }}>✦</span>
              {plan.badge}
            </div>
          )}

          <div style={{ fontSize: '10px', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.22)', marginBottom: '6px' }}>
            {plan.name}
          </div>

          <div
            style={{
              fontSize: 'clamp(2rem, 3.5vw, 2.6rem)',
              fontWeight: 900,
              letterSpacing: '-0.04em',
              color: plan.accent,
              textShadow: `0 0 32px ${plan.accent}38`,
              lineHeight: 1,
              marginBottom: '8px',
            }}
          >
            {plan.price}
          </div>

          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', lineHeight: 1.6, marginBottom: '20px' }}>
            {plan.tagline}
          </p>

          <div style={{ height: '1px', background: `linear-gradient(90deg, ${plan.accent}18, transparent)`, marginBottom: '18px' }} />

          <div style={{ fontSize: '9px', letterSpacing: '0.25em', textTransform: 'uppercase', color: `${plan.accent}55`, marginBottom: '12px', fontWeight: 600 }}>
            The Stack
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '9px', marginBottom: '18px' }}>
            {plan.stack.map((item, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  gap: '9px',
                  alignItems: 'flex-start',
                  padding: item.highlight ? '7px 9px' : '0',
                  borderRadius: item.highlight ? '8px' : '0',
                  background: item.highlight ? `${plan.accent}08` : 'transparent',
                  border: item.highlight ? `1px solid ${plan.accent}15` : 'none',
                }}
              >
                <span
                  style={{
                    marginTop: '3px',
                    width: '13px',
                    height: '13px',
                    borderRadius: '50%',
                    background: `${plan.accent}15`,
                    border: `1px solid ${plan.accent}28`,
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <svg width="7" height="6" viewBox="0 0 7 6" fill="none">
                    <path d="M1 3L2.8 5L6 1" stroke={plan.accent} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: item.highlight ? plan.accent : 'rgba(237,233,227,0.75)', letterSpacing: '-0.01em', marginBottom: '1px' }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: '11px', color: item.highlight ? `${plan.accent}75` : 'rgba(255,255,255,0.26)', lineHeight: 1.5 }}>
                    {item.detail}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {plan.limits.length > 0 && (
            <>
              <div style={{ height: '1px', background: 'rgba(255,255,255,0.04)', marginBottom: '14px' }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '20px' }}>
                {plan.limits.map((limit, i) => (
                  <div key={i} style={{ display: 'flex', gap: '7px', alignItems: 'center' }}>
                    <span style={{ color: 'rgba(255,80,80,0.38)', fontSize: '10px', flexShrink: 0 }}>✕</span>
                    <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.18)' }}>{limit}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          <div
            style={{
              marginTop: plan.limits.length === 0 ? '8px' : '0',
              padding: '13px 18px',
              borderRadius: '10px',
              textAlign: 'center',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              background: isPremium ? `linear-gradient(135deg, ${plan.accent}20 0%, ${plan.accent}12 100%)` : 'rgba(255,255,255,0.04)',
              border: `1px solid ${plan.accent}25`,
              color: plan.accent,
              transition: 'all 0.25s ease',
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLDivElement;
              el.style.background = `${plan.accent}22`;
              el.style.borderColor = `${plan.accent}48`;
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLDivElement;
              el.style.background = isPremium ? `linear-gradient(135deg, ${plan.accent}20 0%, ${plan.accent}12 100%)` : 'rgba(255,255,255,0.04)';
              el.style.borderColor = `${plan.accent}25`;
            }}
          >
            Get Started
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function TransformToPricing() {
  const outerRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const [scroll, setScroll] = useState(0); // 0 → 1 over full outer height

  useEffect(() => {
    const handleScroll = () => {
      if (!outerRef.current) return;
      const rect = outerRef.current.getBoundingClientRect();
      const totalScroll = outerRef.current.offsetHeight - window.innerHeight;
      const scrolled = -rect.top;
      const progress = Math.max(0, Math.min(1, scrolled / totalScroll));
      setScroll(progress);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Phase 0 → 0.35 : transform cards enter
  // Phase 0.35 → 0.55 : transition — transform exits, pricing enters
  // Phase 0.55 → 1.0 : pricing is fully visible

  const transformEnter = Math.max(0, Math.min(1, scroll / 0.35));

  // exit starts at 0.38, fully done at 0.58
  const transformExit = Math.max(0, Math.min(1, (scroll - 0.38) / 0.2));

  // pricing enter: starts 0.45, done 0.72
  const pricingEnter = Math.max(0, Math.min(1, (scroll - 0.45) / 0.27));

  // heading morph: transform heading fades out 0.35–0.5, pricing heading fades in 0.48–0.65
  const transformHeadingOut = Math.max(0, Math.min(1, (scroll - 0.32) / 0.18));
  const transformHeadingIn = Math.max(0, Math.min(1, scroll / 0.25));
  const pricingHeadingIn = Math.max(0, Math.min(1, (scroll - 0.42) / 0.22));

  // bottom tagline fades in after pricing is settled
  const bottomTaglineIn = Math.max(0, Math.min(1, (scroll - 0.75) / 0.2));

  // background color shift: dark navy tints toward deeper blue as pricing arrives
  const bgBlend = Math.max(0, Math.min(1, (scroll - 0.4) / 0.4));

  return (
    <>
      <style>{`
        @keyframes arrowPulse {
          0%, 100% { transform: translateY(0); opacity: 1; }
          50%       { transform: translateY(3px); opacity: 0.65; }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
      `}</style>

      {/* Outer scroll container — 300vh gives ample scroll room */}
      <div ref={outerRef} style={{ height: '300vh', position: 'relative' }}>
        {/* Sticky viewport */}
        <div
          ref={stickyRef}
          style={{
            position: 'sticky',
            top: 0,
            height: '100vh',
            overflow: 'hidden',
            background: `linear-gradient(to bottom,
              rgb(${6 + bgBlend * 2},${6 + bgBlend * 6},${12 + bgBlend * 14}) 0%,
              rgb(${8 + bgBlend * 2},${8 + bgBlend * 8},${18 + bgBlend * 14}) 60%,
              rgb(${6 + bgBlend * 2},${6 + bgBlend * 6},${12 + bgBlend * 14}) 100%)`,
          }}
        >
          {/* Background horizontal lines */}
          <svg
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.025, pointerEvents: 'none' }}
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              <linearGradient id="ttl-line-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="transparent" />
                <stop offset="50%" stopColor={bgBlend > 0.5 ? '#4A9EFF' : '#C9A96E'} />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
            </defs>
            {Array.from({ length: 9 }, (_, i) => (
              <line key={i} x1="0" y1={`${8 + i * 10}%`} x2="100%" y2={`${8 + i * 10}%`} stroke="url(#ttl-line-grad)" strokeWidth="1" />
            ))}
          </svg>

          {/* Ambient glow */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: `radial-gradient(ellipse 65% 55% at 50% 55%,
                rgba(${139 - bgBlend * 65},${92 + bgBlend * 66},${246 - bgBlend * 90},${0.04 + bgBlend * 0.03}) 0%,
                transparent 70%)`,
              pointerEvents: 'none',
              transition: 'none',
            }}
          />

          {/* ── CONTENT ── */}
          <div
            style={{
              position: 'relative',
              zIndex: 10,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              padding: 'clamp(20px, 4vw, 48px) clamp(20px, 5vw, 56px)',
              maxWidth: '1280px',
              margin: '0 auto',
              gap: 'clamp(20px, 3vh, 36px)',
            }}
          >
            {/* ─── TRANSFORMATION HEADING ─── */}
            <div
              style={{
                textAlign: 'center',
                opacity: transformHeadingIn * (1 - transformHeadingOut),
                transform: `translateY(${(1 - transformHeadingIn) * 20 - transformHeadingOut * 24}px)`,
                position: transformHeadingOut > 0.99 ? 'absolute' : 'relative',
                pointerEvents: 'none',
                transition: 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '14px' }}>
                <div style={{ height: '1px', width: '52px', background: 'linear-gradient(90deg, transparent, rgba(201,169,110,0.3))' }} />
                <span style={{ fontSize: '9px', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(201,169,110,0.5)', fontWeight: 600 }}>
                  The Transformation
                </span>
                <div style={{ height: '1px', width: '52px', background: 'linear-gradient(90deg, rgba(201,169,110,0.3), transparent)' }} />
              </div>
              <h2
                style={{
                  fontSize: 'clamp(2rem, 5.5vw, 4.5rem)',
                  fontWeight: 900,
                  letterSpacing: '-0.04em',
                  lineHeight: 1.05,
                  margin: 0,
                }}
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

            {/* ─── TRANSFORM CARDS ─── */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 'clamp(10px, 1.5vw, 18px)',
                opacity: 1 - transformExit * transformExit, // ease out
              }}
            >
              {transformPairs.map((pair, i) => (
                <TransformCard
                  key={i}
                  pair={pair}
                  index={i}
                  enterProgress={transformEnter}
                  exitProgress={transformExit}
                />
              ))}
            </div>

            {/* ─── TRANSITION CONNECTOR ─── */}
            {/* Appears mid-transition as a bridge element */}
            <div
              style={{
                textAlign: 'center',
                opacity: Math.min(transformExit * 3, 1) * Math.min(pricingEnter * 2, 1),
                transform: `scaleX(${Math.min(transformExit * 2, 1)})`,
                transformOrigin: 'center',
                transition: 'none',
                overflow: 'hidden',
                height: '1px',
                background: 'linear-gradient(90deg, transparent, rgba(201,169,110,0.3) 30%, rgba(74,158,255,0.3) 70%, transparent)',
                marginTop: '-4px',
                marginBottom: '-4px',
              }}
            />

            {/* ─── PRICING HEADING ─── */}
            <div
              style={{
                textAlign: 'center',
                opacity: pricingHeadingIn,
                transform: `translateY(${(1 - pricingHeadingIn) * 28}px)`,
                transition: 'none',
                display: pricingHeadingIn < 0.01 ? 'none' : 'block',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '10px' }}>
                <div style={{ height: '1px', width: '48px', background: 'linear-gradient(90deg, transparent, rgba(74,158,255,0.3))' }} />
                <span style={{ fontSize: '9px', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(74,158,255,0.5)', fontWeight: 600 }}>
                  Own the Twin
                </span>
                <div style={{ height: '1px', width: '48px', background: 'linear-gradient(90deg, rgba(74,158,255,0.3), transparent)' }} />
              </div>
              <h2
                style={{
                  fontSize: 'clamp(1.8rem, 4.5vw, 3.6rem)',
                  fontWeight: 900,
                  letterSpacing: '-0.04em',
                  lineHeight: 1.05,
                  margin: '0 0 6px',
                }}
              >
                <span style={{ color: 'rgba(237,233,227,0.82)' }}>Choose your </span>
                <span
                  style={{
                    background: 'linear-gradient(135deg, #3A7FCC 0%, #7DC4FF 45%, #4A9EFF 80%, #6BB8FF 100%)',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  starting point.
                </span>
              </h2>
              <p style={{ fontSize: 'clamp(0.8rem, 1.5vw, 1rem)', color: 'rgba(237,233,227,0.3)', margin: 0, letterSpacing: '-0.01em' }}>
                The twin is built once.{' '}
                <span style={{ color: 'rgba(201,169,110,0.65)', fontWeight: 500 }}>Everything else</span> is a render away — forever.
              </p>
            </div>

            {/* ─── PRICING CARDS ─── */}
            <div
              style={{
                display: 'flex',
                gap: 'clamp(12px, 2vw, 22px)',
                alignItems: 'stretch',
                opacity: pricingEnter > 0.01 ? 1 : 0,
                display: pricingEnter < 0.01 ? 'none' : 'flex',
              }}
            >
              {plans.map((plan, i) => (
                <PricingCard key={plan.id} plan={plan} index={i} enterProgress={pricingEnter} />
              ))}
            </div>

            {/* ─── BOTTOM TAGLINE ─── */}
            <div
              style={{
                textAlign: 'center',
                opacity: bottomTaglineIn,
                transform: `translateY(${(1 - bottomTaglineIn) * 14}px)`,
                transition: 'none',
              }}
            >
              <p style={{ fontSize: 'clamp(0.85rem, 1.8vw, 1.1rem)', color: 'rgba(237,233,227,0.32)', margin: '0 auto', letterSpacing: '-0.01em', maxWidth: '520px' }}>
                One digital twin. Every campaign.{' '}
                <span style={{ color: 'rgba(201,169,110,0.8)', fontWeight: 600 }}>Forever.</span>
              </p>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.15)', marginTop: '8px', letterSpacing: '0.04em' }}>
                All packages include Digital Twin Setup.{' '}
                <span style={{ color: 'rgba(201,169,110,0.35)' }}>Additional renders à la carte.</span>
              </p>
            </div>
          </div>

          {/* Scroll progress indicator */}
          <div
            style={{
              position: 'absolute',
              bottom: '28px',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
              opacity: scroll < 0.92 ? 0.4 : 0,
              transition: 'opacity 0.4s ease',
            }}
          >
            <div
              style={{
                width: '1px',
                height: '36px',
                background: 'linear-gradient(to bottom, rgba(255,255,255,0.3), transparent)',
                animation: 'arrowPulse 1.8s ease-in-out infinite',
              }}
            />
            <span style={{ fontSize: '8px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)' }}>
              Scroll
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
