'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';

// ─── DATA ─────────────────────────────────────────────────────────────────────

const transformPairs = [
  {
    before: { label: '6 weeks', sub: 'production timeline' },
    after: { label: '5 days', sub: 'brief to delivery', color: '#C9A96E' },
  },
  {
    before: { label: '$80,000', sub: 'per campaign shoot' },
    after: { label: '$8,000', sub: 'full campaign output', color: '#4A9EFF' },
  },
  {
    before: { label: '20 assets', sub: 'from one shoot' },
    after: { label: '100+', sub: 'from one digital twin', color: '#8B5CF6' },
  },
  {
    before: { label: 'Reshoots', sub: 'every time you change' },
    after: { label: 'Instant', sub: 'render any variant', color: '#34D399' },
  },
];

const plans = [
  {
    id: 'essentials',
    name: 'The Essentials',
    price: '₹34,999',
    tagline: 'E-commerce listings, web headers & social teasers.',
    accent: '#C9A96E',
    badge: null as string | null,
    stack: [
      { label: '1× Cinematic Loop', detail: 'Product reveal, cinematic lighting + text overlay' },
      { label: 'Environment', detail: 'Clean Studio or Basic Virtual Set' },
      { label: '20× Standard PNGs', detail: 'Transparent bg, e-commerce angles' },
      { label: 'Digital Twin Setup', detail: 'Included — $350 Value', highlight: true },
    ],
    limits: ['No Complex Simulations', 'No AR Assets', 'No Action Angles'],
  },
  {
    id: 'viral',
    name: 'The Viral Impact',
    price: '₹74,999',
    tagline: 'Ad campaigns, launch events & hero content.',
    accent: '#4A9EFF',
    badge: 'Most Powerful' as string | null,
    stack: [
      { label: '1× High-Energy Video', detail: 'Up to 4 cuts — liquids, peel-off, particles' },
      { label: 'Environment', detail: 'Clean Studio or Basic Virtual Set' },
      { label: '40× Mixed PNGs', detail: 'Standard + creative action stills' },
      { label: '1× AR Asset', detail: 'Optimised .glb for e-commerce' },
      { label: 'Digital Twin Setup', detail: 'Included — $350 Value', highlight: true },
    ],
    limits: [],
  },
];

// ─── SCROLL HOOK ──────────────────────────────────────────────────────────────

function useScrollProgress(ref: React.RefObject<HTMLDivElement>) {
  const [progress, setProgress] = useState(0);
  const raf = useRef<number>();
  const last = useRef(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let ticking = false;

    const tick = () => {
      const rect = el.getBoundingClientRect();
      const total = el.offsetHeight - window.innerHeight;
      const val = total > 0 ? Math.max(0, Math.min(1, -rect.top / total)) : 0;
      if (Math.abs(val - last.current) > 0.0005) {
        last.current = val;
        setProgress(val);
      }
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) { raf.current = requestAnimationFrame(tick); ticking = true; }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [ref]);

  return progress;
}

function easeOut(t: number) {
  const c = Math.max(0, Math.min(1, t));
  return 1 - Math.pow(1 - c, 3);
}

// ─── PRICING CARD ─────────────────────────────────────────────────────────────

const PricingCard = React.memo(function PricingCard({
  plan, index, sceneProgress,
}: { plan: typeof plans[0]; index: number; sceneProgress: number }) {
  const [hovered, setHovered] = useState(false);
  const p = easeOut((sceneProgress - index * 0.12) / 0.5);
  const isPremium = !!plan.badge;

  return (
    <div style={{
      flex: 1, minWidth: 0,
      opacity: p,
      transform: `translateY(${(1 - p) * 28}px)`,
    }}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          height: '100%', display: 'flex', flexDirection: 'column',
          borderRadius: '18px', overflow: 'hidden', position: 'relative',
          background: isPremium ? '#09090f' : '#07070d',
          border: `1px solid ${hovered ? plan.accent + '38' : isPremium ? plan.accent + '16' : 'rgba(255,255,255,0.05)'}`,
          boxShadow: hovered ? `0 20px 56px ${plan.accent}12` : isPremium ? `0 10px 36px ${plan.accent}07` : 'none',
          transition: 'border-color 0.25s, box-shadow 0.25s',
        }}
      >
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '1px',
          background: `linear-gradient(90deg, transparent, ${plan.accent}${isPremium ? '60' : '22'} 50%, transparent)`,
        }} />
        {isPremium && (
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: `radial-gradient(ellipse 80% 55% at 50% 0%, ${plan.accent}09 0%, transparent 65%)`,
          }} />
        )}

        <div style={{ padding: '18px 18px 0', position: 'relative', zIndex: 1 }}>
          <div style={{ minHeight: '20px', marginBottom: '12px' }}>
            {plan.badge && (
              <span style={{
                fontSize: '7.5px', letterSpacing: '0.2em', textTransform: 'uppercase',
                color: plan.accent, fontWeight: 700,
                background: `${plan.accent}10`, border: `1px solid ${plan.accent}22`,
                borderRadius: '100px', padding: '3px 8px', display: 'inline-block',
              }}>✦ {plan.badge}</span>
            )}
          </div>

          <div style={{ fontSize: '7.5px', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.14)', marginBottom: '5px', fontWeight: 600 }}>
            {plan.name}
          </div>
          <div style={{ fontSize: 'clamp(1.7rem, 2.8vw, 2.3rem)', fontWeight: 900, letterSpacing: '-0.05em', color: plan.accent, lineHeight: 1, marginBottom: '3px' }}>
            {plan.price}
          </div>
          <div style={{ fontSize: '9px', color: `${plan.accent}38`, letterSpacing: '0.05em', marginBottom: '9px' }}>
            one-time · includes twin setup
          </div>
          <p style={{ fontSize: '10.5px', color: 'rgba(255,255,255,0.2)', lineHeight: 1.55, marginBottom: '12px' }}>
            {plan.tagline}
          </p>
          <div style={{ height: '1px', background: `linear-gradient(90deg, ${plan.accent}12, transparent)`, marginBottom: '12px' }} />
        </div>

        <div style={{ padding: '0 18px', flex: 1, position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '7.5px', letterSpacing: '0.28em', textTransform: 'uppercase', color: `${plan.accent}38`, marginBottom: '9px', fontWeight: 700 }}>
            What's included
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', marginBottom: '9px' }}>
            {plan.stack.map((item, i) => (
              <div key={i} style={{
                display: 'flex', gap: '8px', alignItems: 'flex-start',
                padding: item.highlight ? '6px 8px' : '0',
                borderRadius: item.highlight ? '8px' : undefined,
                background: item.highlight ? `${plan.accent}09` : undefined,
                border: item.highlight ? `1px solid ${plan.accent}13` : undefined,
              }}>
                <span style={{
                  marginTop: '2px', width: '11px', height: '11px', borderRadius: '50%', flexShrink: 0,
                  background: `${plan.accent}0c`, border: `1px solid ${plan.accent}1e`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="6" height="5" viewBox="0 0 6 5" fill="none">
                    <path d="M0.75 2.5L2.25 4L5.25 1" stroke={plan.accent} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                <div>
                  <div style={{ fontSize: '10.5px', fontWeight: 600, color: item.highlight ? plan.accent : 'rgba(237,233,227,0.65)', marginBottom: '1px' }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: '9.5px', color: item.highlight ? `${plan.accent}50` : 'rgba(255,255,255,0.16)', lineHeight: 1.4 }}>
                    {item.detail}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {plan.limits.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '9px', paddingTop: '7px', borderTop: '1px solid rgba(255,255,255,0.03)' }}>
              {plan.limits.map((l, i) => (
                <div key={i} style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <span style={{ color: 'rgba(255,70,70,0.22)', fontSize: '8.5px' }}>✕</span>
                  <span style={{ fontSize: '9.5px', color: 'rgba(255,255,255,0.12)' }}>{l}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ padding: '12px 18px 16px', position: 'relative', zIndex: 1 }}>
          <div style={{
            padding: '9px', borderRadius: '9px', textAlign: 'center',
            fontSize: '9.5px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase',
            cursor: 'pointer', color: plan.accent,
            background: isPremium ? `${plan.accent}14` : 'rgba(255,255,255,0.03)',
            border: `1px solid ${plan.accent}1e`,
            marginBottom: '6px',
          }}>
            Get Started
          </div>
          <div style={{ textAlign: 'center', fontSize: '9px', color: 'rgba(255,255,255,0.16)', cursor: 'pointer' }}>
            View full details →
          </div>
        </div>
      </div>
    </div>
  );
});

// ─── TRANSFORM CARD ───────────────────────────────────────────────────────────

const TransformCard = React.memo(function TransformCard({
  pair, index, sceneProgress,
}: { pair: typeof transformPairs[0]; index: number; sceneProgress: number }) {
  const p = easeOut((sceneProgress - index * 0.08) / 0.4);

  return (
    <div style={{ opacity: p, transform: `translateY(${(1 - p) * 20}px)` }}>
      <div style={{
        borderRadius: '14px', overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.04)',
        background: '#08080e',
      }}>
        <div style={{ padding: '14px 14px 12px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
          <div style={{ fontSize: '7px', letterSpacing: '0.28em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.14)', marginBottom: '8px' }}>
            Before
          </div>
          <div style={{
            fontSize: 'clamp(0.95rem, 1.6vw, 1.25rem)', fontWeight: 800, letterSpacing: '-0.03em',
            color: '#42425a', textDecoration: 'line-through', textDecorationColor: 'rgba(255,70,70,0.28)',
            marginBottom: '3px',
          }}>
            {pair.before.label}
          </div>
          <div style={{ fontSize: '9.5px', color: 'rgba(255,255,255,0.15)' }}>{pair.before.sub}</div>
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px 0',
        }}>
          <div style={{
            width: '18px', height: '18px', borderRadius: '50%',
            background: `${pair.after.color}0c`, border: `1px solid ${pair.after.color}1e`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: pair.after.color, fontSize: '9px',
          }}>↓</div>
        </div>

        <div style={{
          padding: '12px 14px 14px',
          background: `${pair.after.color}06`,
          borderTop: `1px solid ${pair.after.color}10`,
        }}>
          <div style={{ fontSize: '7px', letterSpacing: '0.28em', textTransform: 'uppercase', color: `${pair.after.color}50`, marginBottom: '8px' }}>
            After
          </div>
          <div style={{
            fontSize: 'clamp(0.95rem, 1.6vw, 1.25rem)', fontWeight: 800, letterSpacing: '-0.03em',
            color: pair.after.color, textShadow: `0 0 12px ${pair.after.color}30`,
            marginBottom: '3px',
          }}>
            {pair.after.label}
          </div>
          <div style={{ fontSize: '9.5px', color: `${pair.after.color}50` }}>{pair.after.sub}</div>
        </div>
      </div>
    </div>
  );
});

// ─── MAIN ─────────────────────────────────────────────────────────────────────

export default function TransformToPricing() {
  const outerRef = useRef<HTMLDivElement>(null);
  const s = useScrollProgress(outerRef);

  // Scene A (Pricing): 0 → 0.5   Scene B (Transform): 0.5 → 1.0
  const sceneAProgress = useMemo(() => easeOut(s / 0.42), [s]);
  const sceneAOpacity = useMemo(() => {
    const out = easeOut(Math.max(0, (s - 0.42) / 0.1));
    return 1 - out;
  }, [s]);
  const sceneAY = useMemo(() => {
    const out = easeOut(Math.max(0, (s - 0.42) / 0.1));
    return -out * 36;
  }, [s]);

  const sceneBProgress = useMemo(() => easeOut(Math.max(0, (s - 0.5) / 0.38)), [s]);
  const sceneBVisible = sceneBProgress > 0.01;
  const sceneAVisible = sceneAOpacity > 0.01;

  const taglineP = useMemo(() => easeOut(Math.max(0, (sceneBProgress - 0.65) / 0.3)), [sceneBProgress]);

  return (
    <div ref={outerRef} style={{ height: '350vh', position: 'relative' }}>
      <div style={{
        position: 'sticky', top: 0,
        height: '100vh', width: '100%',
        overflow: 'hidden',
        background: '#05050b',
      }}>

        {/* Ambient glows */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 65% 50% at 50% 38%, rgba(201,169,110,0.038) 0%, transparent 60%)',
          opacity: sceneAOpacity, transition: 'opacity 0.05s',
        }} />
        {sceneBVisible && (
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: 'radial-gradient(ellipse 65% 50% at 50% 52%, rgba(74,158,255,0.038) 0%, transparent 60%)',
            opacity: sceneBProgress,
          }} />
        )}

        {/* Subtle horizontal rules */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.016, pointerEvents: 'none' }}>
          {[12, 22, 32, 42, 52, 62, 72, 82].map((y, i) => (
            <line key={i} x1="0" y1={`${y}%`} x2="100%" y2={`${y}%`} stroke="white" strokeWidth="1" />
          ))}
        </svg>

        {/* ── Scenes container (max-width, centered) ── */}
        <div style={{
          position: 'absolute', inset: 0,
          maxWidth: '1200px', margin: '0 auto',
          left: 0, right: 0,
        }}>

          {/* ══ SCENE A — PRICING ══ */}
          {sceneAVisible && (
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', flexDirection: 'column', justifyContent: 'center',
              padding: 'clamp(14px, 2.5vw, 36px) clamp(18px, 4.5vw, 52px)',
              opacity: sceneAOpacity,
              transform: `translateY(${sceneAY}px)`,
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(10px, 1.4vh, 18px)' }}>

                {/* Eyebrow */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                  opacity: easeOut(sceneAProgress / 0.25),
                  transform: `translateY(${(1 - easeOut(sceneAProgress / 0.25)) * 14}px)`,
                }}>
                  <div style={{ height: '1px', width: '40px', background: 'linear-gradient(90deg, transparent, rgba(201,169,110,0.28))' }} />
                  <span style={{ fontSize: '7.5px', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(201,169,110,0.38)', fontWeight: 700 }}>
                    Own the Twin
                  </span>
                  <div style={{ height: '1px', width: '40px', background: 'linear-gradient(90deg, rgba(201,169,110,0.28), transparent)' }} />
                </div>

                {/* Heading */}
                <div style={{
                  textAlign: 'center',
                  opacity: easeOut(sceneAProgress / 0.28),
                  transform: `translateY(${(1 - easeOut(sceneAProgress / 0.28)) * 18}px)`,
                }}>
                  <h2 style={{
                    fontSize: 'clamp(1.55rem, 3.5vw, 2.9rem)', fontWeight: 900,
                    letterSpacing: '-0.04em', lineHeight: 1.08, margin: '0 0 6px',
                  }}>
                    <span style={{ color: 'rgba(237,233,227,0.72)' }}>You've seen the gap. </span>
                    <span style={{
                      background: 'linear-gradient(135deg, #8B6F3E 0%, #F2E4C4 42%, #D4A96A 68%, #C9956E 100%)',
                      WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    }}>
                      Here's how to cross it.
                    </span>
                  </h2>
                  <p style={{ fontSize: 'clamp(0.68rem, 1.05vw, 0.82rem)', color: 'rgba(237,233,227,0.18)', margin: '0 auto', maxWidth: '360px', lineHeight: 1.7 }}>
                    The twin is built once.{' '}
                    <span style={{ color: 'rgba(201,169,110,0.48)', fontWeight: 500 }}>Everything else</span>
                    {' '}is a render away.
                  </p>
                </div>

                {/* Cards */}
                <div style={{ display: 'flex', gap: 'clamp(8px, 1.6vw, 18px)', alignItems: 'stretch' }}>
                  {plans.map((plan, i) => (
                    <PricingCard key={plan.id} plan={plan} index={i} sceneProgress={sceneAProgress} />
                  ))}
                </div>

              </div>
            </div>
          )}

          {/* ══ SCENE B — TRANSFORM ══ */}
          {sceneBVisible && (
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', flexDirection: 'column', justifyContent: 'center',
              padding: 'clamp(14px, 2.5vw, 36px) clamp(18px, 4.5vw, 52px)',
              opacity: sceneBProgress,
              transform: `translateY(${(1 - sceneBProgress) * 28}px)`,
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(10px, 1.8vh, 22px)' }}>

                {/* Eyebrow */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                  <div style={{ height: '1px', width: '40px', background: 'linear-gradient(90deg, transparent, rgba(74,158,255,0.28))' }} />
                  <span style={{ fontSize: '7.5px', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(74,158,255,0.38)', fontWeight: 700 }}>
                    The Transformation
                  </span>
                  <div style={{ height: '1px', width: '40px', background: 'linear-gradient(90deg, rgba(74,158,255,0.28), transparent)' }} />
                </div>

                {/* Heading */}
                <div style={{ textAlign: 'center' }}>
                  <h2 style={{
                    fontSize: 'clamp(1.9rem, 4.8vw, 4rem)', fontWeight: 900,
                    letterSpacing: '-0.04em', lineHeight: 1.06, margin: '0 0 5px',
                  }}>
                    <span style={{ color: 'rgba(237,233,227,0.8)' }}>This is </span>
                    <span style={{
                      background: 'linear-gradient(135deg, #8B6F3E 0%, #F2E4C4 42%, #D4A96A 68%, #C9956E 100%)',
                      WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    }}>
                      the upgrade.
                    </span>
                  </h2>
                  <p style={{ fontSize: 'clamp(0.68rem, 1.05vw, 0.82rem)', color: 'rgba(237,233,227,0.18)', margin: '0 auto', maxWidth: '340px', lineHeight: 1.7 }}>
                    Numbers that move the needle. Built into every package.
                  </p>
                </div>

                {/* 4 cards */}
                <div style={{
                  display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: 'clamp(8px, 1.1vw, 14px)',
                }}>
                  {transformPairs.map((pair, i) => (
                    <TransformCard key={i} pair={pair} index={i} sceneProgress={sceneBProgress} />
                  ))}
                </div>

                {/* Tagline */}
                <div style={{
                  textAlign: 'center',
                  opacity: taglineP,
                  transform: `translateY(${(1 - taglineP) * 8}px)`,
                }}>
                  <p style={{ fontSize: 'clamp(0.75rem, 1.3vw, 0.9rem)', color: 'rgba(237,233,227,0.22)', margin: '0 auto', maxWidth: '440px' }}>
                    One digital twin. Every campaign.{' '}
                    <span style={{ color: 'rgba(201,169,110,0.65)', fontWeight: 600 }}>Forever.</span>
                  </p>
                  <p style={{ fontSize: '9.5px', color: 'rgba(255,255,255,0.1)', marginTop: '4px', letterSpacing: '0.03em' }}>
                    All packages include Digital Twin Setup.{' '}
                    <span style={{ color: 'rgba(201,169,110,0.26)' }}>Additional renders à la carte.</span>
                  </p>
                </div>

              </div>
            </div>
          )}

        </div>

        {/* Scroll pip */}
        <div style={{
          position: 'absolute', bottom: '20px', left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px',
          opacity: s > 0.94 ? 0 : 0.28, transition: 'opacity 0.5s',
          pointerEvents: 'none',
        }}>
          <div style={{ width: '1px', height: '26px', background: 'linear-gradient(to bottom, rgba(255,255,255,0.28), transparent)' }} />
          <span style={{ fontSize: '6.5px', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.18)' }}>scroll</span>
        </div>

      </div>
    </div>
  );
}
