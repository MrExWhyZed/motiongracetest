'use client';

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';

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

// ─── OPTIMIZED HOOK FOR SCROLL PROGRESS ──────────────────────────────────────

function useScrollProgress(containerRef: React.RefObject<HTMLDivElement>) {
  const [progress, setProgress] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const rafId = useRef<number>();
  const lastProgress = useRef(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let ticking = false;

    const updateProgress = () => {
      if (!container) return;
      
      const rect = container.getBoundingClientRect();
      const totalScroll = container.offsetHeight - window.innerHeight;
      const scrolled = -rect.top;
      const newProgress = Math.max(0, Math.min(1, totalScroll > 0 ? scrolled / totalScroll : 0));
      
      // Only update if progress changed significantly (reduce re-renders)
      if (Math.abs(newProgress - lastProgress.current) > 0.001) {
        lastProgress.current = newProgress;
        setProgress(newProgress);
      }
      
      ticking = false;
      setIsScrolling(false);
    };

    const handleScroll = () => {
      if (!isScrolling) setIsScrolling(true);
      if (!ticking) {
        rafId.current = requestAnimationFrame(updateProgress);
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    
    // Initial update
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, [containerRef, isScrolling]);

  return progress;
}

// ─── PRICING CARD (MEMOIZED) ─────────────────────────────────────────────────

const PricingCard = React.memo(function PricingCard({
  plan,
  index,
  enterProgress,
}: {
  plan: (typeof plans)[0];
  index: number;
  enterProgress: number;
}) {
  const [hovered, setHovered] = useState(false);
  const delay = index * 0.18;
  const cardProgress = Math.max(0, Math.min(1, (enterProgress - delay) / 0.5));
  const isPremium = !!plan.badge;

  const eased = useMemo(() => {
    if (cardProgress < 0.5) {
      return 4 * cardProgress * cardProgress * cardProgress;
    }
    return 1 - Math.pow(-2 * cardProgress + 2, 3) / 2;
  }, [cardProgress]);

  const cardStyle = useMemo(() => ({
    opacity: eased,
    transform: `translateY(${(1 - eased) * 56}px) scale(${0.94 + eased * 0.06})`,
  }), [eased]);

  const containerStyle = useMemo(() => ({
    position: 'relative',
    borderRadius: '24px',
    overflow: 'hidden',
    background: isPremium ? 'rgba(6,10,20,0.98)' : 'rgba(8,8,16,0.88)',
    border: `1px solid ${hovered ? plan.accent + '55' : isPremium ? plan.accent + '22' : 'rgba(255,255,255,0.06)'}`,
    boxShadow: hovered
      ? `0 32px 80px ${plan.accent}18, 0 0 0 1px ${plan.accent}28, inset 0 1px 0 rgba(255,255,255,0.06)`
      : isPremium
        ? `0 20px 56px ${plan.accent}10, inset 0 1px 0 rgba(255,255,255,0.04)`
        : 'inset 0 1px 0 rgba(255,255,255,0.03)',
    padding: 0,
    height: '100%',
  }), [hovered, isPremium, plan.accent]);

  return (
    <div style={{ ...cardStyle, flex: 1, minWidth: 0 }}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={containerStyle}
      >
        {isPremium && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: `linear-gradient(145deg, ${plan.accent}16 0%, transparent 50%, ${plan.accent}08 100%)`,
              pointerEvents: 'none',
            }}
          />
        )}

        {/* Top accent line */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '1px',
            background: isPremium
              ? `linear-gradient(90deg, transparent 0%, ${plan.accent}80 40%, ${plan.accent}90 60%, transparent 100%)`
              : `linear-gradient(90deg, transparent 0%, ${plan.accent}30 50%, transparent 100%)`,
            opacity: hovered ? 1 : isPremium ? 0.9 : 0.5,
          }}
        />

        <div style={{ padding: '28px 28px 0', position: 'relative', zIndex: 1 }}>
          {plan.badge ? (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: `linear-gradient(135deg, ${plan.accent}20, ${plan.accent}10)`,
                border: `1px solid ${plan.accent}35`,
                borderRadius: '100px',
                padding: '5px 12px',
                marginBottom: '18px',
                fontSize: '9px',
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: plan.accent,
                fontWeight: 700,
              }}
            >
              <span style={{ fontSize: '8px' }}>✦</span>
              {plan.badge}
            </div>
          ) : (
            <div style={{ marginBottom: '18px', height: '26px' }} />
          )}

          <div
            style={{
              fontSize: '9px',
              letterSpacing: '0.28em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.2)',
              marginBottom: '10px',
              fontWeight: 600,
            }}
          >
            {plan.name}
          </div>

          <div style={{ marginBottom: '10px' }}>
            <div
              style={{
                fontSize: 'clamp(2.4rem, 4vw, 3.2rem)',
                fontWeight: 900,
                letterSpacing: '-0.05em',
                color: plan.accent,
                textShadow: `0 0 40px ${plan.accent}40`,
                lineHeight: 1,
              }}
            >
              {plan.price}
            </div>
            <div
              style={{
                fontSize: '10px',
                color: `${plan.accent}55`,
                letterSpacing: '0.08em',
                marginTop: '4px',
                fontWeight: 500,
              }}
            >
              one-time · includes twin setup
            </div>
          </div>

          <p
            style={{
              fontSize: '11.5px',
              color: 'rgba(255,255,255,0.28)',
              lineHeight: 1.65,
              marginBottom: '22px',
              letterSpacing: '-0.005em',
            }}
          >
            {plan.tagline}
          </p>

          <div
            style={{
              height: '1px',
              background: `linear-gradient(90deg, ${plan.accent}22, rgba(255,255,255,0.04) 60%, transparent)`,
              marginBottom: '20px',
            }}
          />
        </div>

        <div style={{ padding: '0 28px', flex: 1, position: 'relative', zIndex: 1 }}>
          <div
            style={{
              fontSize: '8.5px',
              letterSpacing: '0.28em',
              textTransform: 'uppercase',
              color: `${plan.accent}50`,
              marginBottom: '14px',
              fontWeight: 700,
            }}
          >
            What's included
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '18px' }}>
            {plan.stack.map((item, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  gap: '10px',
                  alignItems: 'flex-start',
                  padding: item.highlight ? '9px 11px' : '0',
                  borderRadius: item.highlight ? '10px' : undefined,
                  background: item.highlight
                    ? `linear-gradient(135deg, ${plan.accent}10, ${plan.accent}06)`
                    : undefined,
                  border: item.highlight ? `1px solid ${plan.accent}18` : undefined,
                }}
              >
                <span
                  style={{
                    marginTop: '3px',
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    background: item.highlight ? `${plan.accent}20` : `${plan.accent}10`,
                    border: `1px solid ${plan.accent}${item.highlight ? '35' : '22'}`,
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <svg width="7" height="6" viewBox="0 0 7 6" fill="none">
                    <path d="M1 3L2.8 5L6 1" stroke={plan.accent} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <div>
                  <div
                    style={{
                      fontSize: '12px',
                      fontWeight: 600,
                      color: item.highlight ? plan.accent : 'rgba(237,233,227,0.78)',
                      letterSpacing: '-0.01em',
                      marginBottom: '2px',
                    }}
                  >
                    {item.label}
                  </div>
                  <div
                    style={{
                      fontSize: '11px',
                      color: item.highlight ? `${plan.accent}70` : 'rgba(255,255,255,0.24)',
                      lineHeight: 1.5,
                    }}
                  >
                    {item.detail}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {plan.limits.length > 0 && (
            <>
              <div style={{ height: '1px', background: 'rgba(255,255,255,0.04)', marginBottom: '14px' }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', marginBottom: '18px' }}>
                {plan.limits.map((limit, i) => (
                  <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ color: 'rgba(255,80,80,0.32)', fontSize: '10px', flexShrink: 0 }}>✕</span>
                    <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.16)' }}>{limit}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div style={{ padding: '20px 28px 26px', position: 'relative', zIndex: 1 }}>
          <div
            style={{
              padding: '13px 18px',
              borderRadius: '12px',
              textAlign: 'center',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              background: isPremium
                ? `linear-gradient(135deg, ${plan.accent}24 0%, ${plan.accent}14 100%)`
                : 'rgba(255,255,255,0.04)',
              border: `1px solid ${plan.accent}28`,
              color: plan.accent,
              marginBottom: '10px',
            }}
          >
            Get Started
          </div>

          <a
            href="#pricing"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '5px',
              padding: '9px',
              borderRadius: '10px',
              fontSize: '10.5px',
              fontWeight: 500,
              letterSpacing: '0.04em',
              color: 'rgba(255,255,255,0.25)',
              textDecoration: 'none',
              border: '1px solid rgba(255,255,255,0.04)',
              background: 'transparent',
              cursor: 'pointer',
            }}
          >
            View full details
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ opacity: 0.6 }}>
              <path d="M2 5h6M5.5 2.5L8 5l-2.5 2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
});

// ─── TRANSFORM CARD (MEMOIZED) ───────────────────────────────────────────────

const TransformCard = React.memo(function TransformCard({
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
  const { opacity, translateY, scale } = useMemo(() => {
    const enterDelay = index * 0.12;
    const cardEnter = Math.max(0, Math.min(1, (enterProgress - enterDelay) / 0.38));
    const exitDelay = (transformPairs.length - 1 - index) * 0.08;
    const cardExit = Math.max(0, Math.min(1, (exitProgress - exitDelay) / 0.35));
    
    return {
      opacity: cardEnter * (1 - cardExit),
      translateY: (1 - cardEnter) * 44 - cardExit * 30,
      scale: 0.94 + cardEnter * 0.06 - cardExit * 0.04,
    };
  }, [enterProgress, exitProgress, index]);

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${translateY}px) scale(${scale})`,
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
            }}
          >
            ↓
          </div>
        </div>

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
});

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function TransformToPricing() {
  const outerRef = useRef<HTMLDivElement>(null);
  const scroll = useScrollProgress(outerRef);

  // Memoize phase calculations
  const phases = useMemo(() => {
    // PRICING
    const pricingEnter = Math.max(0, Math.min(1, scroll / 0.32));
    const pricingHeadingIn = Math.max(0, Math.min(1, scroll / 0.22));
    const pricingExit = Math.max(0, Math.min(1, (scroll - 0.38) / 0.2));
    const pricingHeadingOut = Math.max(0, Math.min(1, (scroll - 0.35) / 0.18));
    
    // TRANSFORM
    const transformEnter = Math.max(0, Math.min(1, (scroll - 0.45) / 0.3));
    const transformHeadingIn = Math.max(0, Math.min(1, (scroll - 0.42) / 0.22));
    const transformExit = 0;
    
    // BOTTOM TAGLINE
    const bottomTaglineIn = Math.max(0, Math.min(1, (scroll - 0.78) / 0.18));
    
    // BACKGROUND BLEND
    const bgBlend = Math.max(0, Math.min(1, (scroll - 0.38) / 0.38));

    return {
      pricingEnter,
      pricingHeadingIn,
      pricingExit,
      pricingHeadingOut,
      transformEnter,
      transformHeadingIn,
      transformExit,
      bottomTaglineIn,
      bgBlend,
    };
  }, [scroll]);

  const backgroundStyle = useMemo(() => ({
    background: `linear-gradient(to bottom,
      rgb(${6 + phases.bgBlend * 2},${6 + phases.bgBlend * 6},${12 + phases.bgBlend * 14}) 0%,
      rgb(${8 + phases.bgBlend * 2},${8 + phases.bgBlend * 8},${18 + phases.bgBlend * 14}) 60%,
      rgb(${6 + phases.bgBlend * 2},${6 + phases.bgBlend * 6},${12 + phases.bgBlend * 14}) 100%)`,
  }), [phases.bgBlend]);

  const ambientGlowStyle = useMemo(() => ({
    background: `radial-gradient(ellipse 65% 55% at 50% 55%,
      rgba(${201 - phases.bgBlend * 130},${169 - phases.bgBlend * 95},${110 + phases.bgBlend * 136},${0.04 + phases.bgBlend * 0.02}) 0%,
      transparent 70%)`,
  }), [phases.bgBlend]);

  const pricingHeadingStyle = useMemo(() => ({
    opacity: phases.pricingHeadingIn * (1 - phases.pricingHeadingOut),
    transform: `translateY(${(1 - phases.pricingHeadingIn) * 28 - phases.pricingHeadingOut * 24}px)`,
    position: phases.pricingHeadingOut > 0.99 ? 'absolute' : 'relative' as const,
    pointerEvents: 'none' as const,
  }), [phases.pricingHeadingIn, phases.pricingHeadingOut]);

  const pricingCardsStyle = useMemo(() => ({
    display: phases.pricingEnter < 0.01 ? 'none' : 'flex' as const,
    gap: 'clamp(14px, 2.2vw, 26px)',
    alignItems: 'stretch' as const,
    opacity: phases.pricingEnter * (1 - phases.pricingExit * phases.pricingExit),
    transform: `translateY(${phases.pricingExit * 32}px)`,
  }), [phases.pricingEnter, phases.pricingExit]);

  const connectorStyle = useMemo(() => ({
    textAlign: 'center' as const,
    opacity: Math.min(phases.pricingExit * 3, 1) * Math.min(phases.transformEnter * 2, 1),
    transform: `scaleX(${Math.min(phases.pricingExit * 2, 1)})`,
    transformOrigin: 'center',
    overflow: 'hidden' as const,
    height: '1px',
    background: 'linear-gradient(90deg, transparent, rgba(201,169,110,0.3) 30%, rgba(74,158,255,0.3) 70%, transparent)',
    marginTop: '-4px',
    marginBottom: '-4px',
  }), [phases.pricingExit, phases.transformEnter]);

  const transformHeadingStyle = useMemo(() => ({
    textAlign: 'center' as const,
    opacity: phases.transformHeadingIn,
    transform: `translateY(${(1 - phases.transformHeadingIn) * 28}px)`,
    display: phases.transformHeadingIn < 0.01 ? 'none' : 'block' as const,
  }), [phases.transformHeadingIn]);

  const transformCardsStyle = useMemo(() => ({
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 'clamp(10px, 1.5vw, 18px)',
    opacity: phases.transformHeadingIn > 0.01 ? 1 - phases.transformExit * phases.transformExit : 0,
  }), [phases.transformHeadingIn, phases.transformExit]);

  const bottomTaglineStyle = useMemo(() => ({
    textAlign: 'center' as const,
    opacity: phases.bottomTaglineIn,
    transform: `translateY(${(1 - phases.bottomTaglineIn) * 14}px)`,
    display: phases.bottomTaglineIn < 0.01 ? 'none' : 'block' as const,
  }), [phases.bottomTaglineIn]);

  return (
    <>
      <div ref={outerRef} style={{ height: '320vh', position: 'relative' }}>
        <div
          style={{
            position: 'sticky',
            top: 0,
            height: '100vh',
            overflow: 'hidden',
            ...backgroundStyle,
          }}
        >
          {/* Background grid lines - memoized static SVG */}
          <svg
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.025, pointerEvents: 'none' }}
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              <linearGradient id="ttl-line-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="transparent" />
                <stop offset="50%" stopColor={phases.bgBlend > 0.5 ? '#4A9EFF' : '#C9A96E'} />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
            </defs>
            {Array.from({ length: 9 }, (_, i) => (
              <line key={i} x1="0" y1={`${8 + i * 10}%`} x2="100%" y2={`${8 + i * 10}%`} stroke="url(#ttl-line-grad)" strokeWidth="1" />
            ))}
          </svg>

          {/* Ambient glow */}
          <div style={{ position: 'absolute', inset: 0, ...ambientGlowStyle, pointerEvents: 'none' }} />

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
              gap: 'clamp(16px, 2.5vh, 30px)',
            }}
          >
            {/* PRICING SECTION */}
            <div style={pricingHeadingStyle}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', marginBottom: '16px' }}>
                <div style={{ height: '1px', width: '60px', background: 'linear-gradient(90deg, transparent, rgba(201,169,110,0.35))' }} />
                <span style={{ fontSize: '9px', letterSpacing: '0.32em', textTransform: 'uppercase', color: 'rgba(201,169,110,0.5)', fontWeight: 700 }}>
                  Own the Twin
                </span>
                <div style={{ height: '1px', width: '60px', background: 'linear-gradient(90deg, rgba(201,169,110,0.35), transparent)' }} />
              </div>

              <h2 style={{
                fontSize: 'clamp(1.9rem, 4.8vw, 3.8rem)',
                fontWeight: 900,
                letterSpacing: '-0.04em',
                lineHeight: 1.05,
                margin: '0 0 10px',
              }}>
                <span style={{ color: 'rgba(237,233,227,0.82)' }}>You've seen the gap. </span>
                <span style={{
                  background: 'linear-gradient(135deg, #8B6F3E 0%, #F2E4C4 40%, #D4A96A 70%, #C9956E 100%)',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>
                  Here's how to cross it.
                </span>
              </h2>

              <p style={{ fontSize: 'clamp(0.78rem, 1.4vw, 0.95rem)', color: 'rgba(237,233,227,0.28)', margin: '0 auto', letterSpacing: '-0.01em', maxWidth: '460px', lineHeight: 1.7 }}>
                The twin is built once.{' '}
                <span style={{ color: 'rgba(201,169,110,0.65)', fontWeight: 500 }}>Everything else</span>{' '}
                is a render away — forever.
              </p>
            </div>

            <div style={pricingCardsStyle}>
              {plans.map((plan, i) => (
                <PricingCard key={plan.id} plan={plan} index={i} enterProgress={phases.pricingEnter} />
              ))}
            </div>

            <div style={connectorStyle} />

            {/* TRANSFORM SECTION */}
            <div style={transformHeadingStyle}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', marginBottom: '16px' }}>
                <div style={{ height: '1px', width: '60px', background: 'linear-gradient(90deg, transparent, rgba(74,158,255,0.35))' }} />
                <span style={{ fontSize: '9px', letterSpacing: '0.32em', textTransform: 'uppercase', color: 'rgba(74,158,255,0.5)', fontWeight: 700 }}>
                  The Transformation
                </span>
                <div style={{ height: '1px', width: '60px', background: 'linear-gradient(90deg, rgba(74,158,255,0.35), transparent)' }} />
              </div>
              <h2 style={{
                fontSize: 'clamp(2rem, 5.5vw, 4.5rem)',
                fontWeight: 900,
                letterSpacing: '-0.04em',
                lineHeight: 1.05,
                margin: 0,
              }}>
                <span style={{ color: 'rgba(237,233,227,0.85)' }}>This is </span>
                <span style={{
                  background: 'linear-gradient(135deg, #8B6F3E 0%, #F2E4C4 40%, #D4A96A 70%, #C9956E 100%)',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>
                  the upgrade.
                </span>
              </h2>
            </div>

            <div style={transformCardsStyle}>
              {transformPairs.map((pair, i) => (
                <TransformCard
                  key={i}
                  pair={pair}
                  index={i}
                  enterProgress={phases.transformEnter}
                  exitProgress={phases.transformExit}
                />
              ))}
            </div>

            <div style={bottomTaglineStyle}>
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

          {/* Scroll indicator */}
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
