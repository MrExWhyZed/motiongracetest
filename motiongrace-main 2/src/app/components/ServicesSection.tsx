'use client';

import React, { useState, useRef, useEffect } from 'react';

const services = [
  {
    id: 1,
    number: '01',
    title: 'Cinematic Commercials',
    description:
      'Luxury product films with full creative control. We craft 30–60 second hero spots that rival broadcast-quality campaigns — rendered entirely in CGI.',
    detail: 'No studio. No shoot day. No reshoot costs.',
    tag: 'Film & Motion',
    accent: '#C9A96E',
    accentRgb: '201,169,110',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="7" width="20" height="15" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M16 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M8 3L4 7l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="12" cy="14.5" r="2.5" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
    stats: [{ label: 'Avg. Views', value: '2.4M+' }, { label: 'Conversion Lift', value: '3×' }],
  },
  {
    id: 2,
    number: '02',
    title: 'Infinite Asset Kits',
    description:
      'One product. Endless visuals. We build a digital twin of your product and generate unlimited campaign-ready assets — every angle, every mood, every season.',
    detail: 'Deliver 100+ assets in the time a photoshoot produces 20.',
    tag: 'Scale & Volume',
    accent: '#4A9EFF',
    accentRgb: '74,158,255',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M2 17l10 5 10-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M2 12l10 5 10-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    stats: [{ label: 'Assets / Week', value: '100+' }, { label: 'Cost vs. Shoot', value: '−70%' }],
  },
  {
    id: 3,
    number: '03',
    title: 'Interactive 3D & AR',
    description:
      'Let your customers experience products in real time. Web-based 3D viewers and AR try-on experiences that increase conversion by up to 40%.',
    detail: 'Works on any device. No app download required.',
    tag: 'AR Commerce',
    accent: '#8B5CF6',
    accentRgb: '139,92,246',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    stats: [{ label: 'Conversion Lift', value: '+40%' }, { label: 'Return Rate Drop', value: '−25%' }],
  },
];

/* ─── Animated orbit ring behind the active card ─── */
function OrbitRing({ color, active }: { color: string; active: boolean }) {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{ opacity: active ? 1 : 0, transition: 'opacity 0.8s ease' }}>
      <div
        className="absolute top-1/2 left-1/2 rounded-full border"
        style={{
          width: '140%', height: '140%',
          marginLeft: '-70%', marginTop: '-70%',
          borderColor: `${color}18`,
          animation: 'orbit-spin 18s linear infinite',
          borderStyle: 'dashed',
        }} />
      <div
        className="absolute top-1/2 left-1/2 rounded-full border"
        style={{
          width: '110%', height: '110%',
          marginLeft: '-55%', marginTop: '-55%',
          borderColor: `${color}10`,
          animation: 'orbit-spin 12s linear infinite reverse',
        }} />
    </div>
  );
}

/* ─── Floating dot constellation ─── */
const dots = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  x: `${Math.round((i * 6.3 + 8) % 96)}%`,
  y: `${Math.round((i * 9.1 + 5) % 90)}%`,
  size: i % 4 === 0 ? 2 : 1,
  delay: i * 0.4,
}));

/* ─── Magnetic hover card ─── */
function ServiceCard({ service, index, isActive, onHover }: {
  service: typeof services[0];
  index: number;
  isActive: boolean;
  onHover: (id: number | null) => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setRevealed(true); },
      { threshold: 0.15 }
    );
    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    setTilt({
      x: ((e.clientY - cy) / rect.height) * 8,
      y: ((e.clientX - cx) / rect.width) * -8,
    });
  };

  return (
    <div
      ref={cardRef}
      className="relative group"
      style={{
        opacity: revealed ? 1 : 0,
        transform: revealed ? 'translateY(0)' : 'translateY(48px)',
        transition: `opacity 1s cubic-bezier(0.16,1,0.3,1) ${index * 160}ms, transform 1s cubic-bezier(0.16,1,0.3,1) ${index * 160}ms`,
      }}
      onMouseEnter={() => onHover(service.id)}
      onMouseLeave={() => { onHover(null); setTilt({ x: 0, y: 0 }); }}
      onMouseMove={handleMouseMove}>

      {/* Card shell */}
      <div
        className="relative overflow-hidden rounded-[28px] flex flex-col h-full cursor-default"
        style={{
          background: isActive
            ? `linear-gradient(145deg, rgba(${service.accentRgb},0.07) 0%, rgba(10,10,18,0.98) 55%)`
            : 'rgba(10,10,18,0.92)',
          border: `1px solid ${isActive ? service.accent + '30' : 'rgba(24,24,42,1)'}`,
          boxShadow: isActive
            ? `0 0 80px rgba(${service.accentRgb},0.12), 0 40px 100px rgba(0,0,0,0.6), inset 0 1px 0 rgba(${service.accentRgb},0.1)`
            : '0 4px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.02)',
          transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transition: 'background 0.8s ease, border-color 0.6s ease, box-shadow 0.8s ease, transform 0.15s ease',
        }}>

        {/* Orbit rings */}
        <OrbitRing color={service.accent} active={isActive} />

        {/* Top noise grain overlay */}
        <div
          className="absolute inset-0 pointer-events-none z-0 opacity-30"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
          }} />

        {/* Shimmer sweep on hover */}
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            background: `linear-gradient(105deg, transparent 30%, rgba(${service.accentRgb},0.04) 50%, transparent 70%)`,
            backgroundSize: '200% 100%',
            animation: isActive ? 'shimmer-card 3s ease infinite' : 'none',
          }} />

        {/* Content */}
        <div className="relative z-10 p-8 flex flex-col h-full gap-6">

          {/* Top row: number + tag */}
          <div className="flex items-center justify-between">
            <span
              className="text-[10px] font-bold tracking-[0.22em] uppercase px-3 py-1.5 rounded-full"
              style={{
                color: service.accent,
                background: `rgba(${service.accentRgb},0.1)`,
                border: `1px solid rgba(${service.accentRgb},0.2)`,
              }}>
              {service.tag}
            </span>
            <span
              className="text-5xl font-black tracking-tighter tabular-nums"
              style={{
                color: isActive ? service.accent : 'rgba(107,107,128,0.15)',
                transition: 'color 0.7s ease',
                lineHeight: 1,
              }}>
              {service.number}
            </span>
          </div>

          {/* Icon */}
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{
              background: `rgba(${service.accentRgb},${isActive ? '0.14' : '0.06'})`,
              color: isActive ? service.accent : 'var(--muted-foreground)',
              border: `1px solid rgba(${service.accentRgb},${isActive ? '0.25' : '0.08'})`,
              transition: 'all 0.6s ease',
              boxShadow: isActive ? `0 0 20px rgba(${service.accentRgb},0.2)` : 'none',
            }}>
            {service.icon}
          </div>

          {/* Title */}
          <h3 className="text-[22px] font-extrabold tracking-tight text-foreground leading-tight">
            {service.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-muted-foreground leading-[1.85] font-light flex-grow">
            {service.description}
          </p>

          {/* Stats row */}
          <div className="grid grid-cols-2 gap-3">
            {service.stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl px-4 py-3"
                style={{
                  background: `rgba(${service.accentRgb},${isActive ? '0.07' : '0.03'})`,
                  border: `1px solid rgba(${service.accentRgb},${isActive ? '0.18' : '0.07'})`,
                  transition: 'all 0.6s ease',
                }}>
                <p
                  className="text-lg font-black tracking-tight"
                  style={{ color: isActive ? service.accent : 'var(--foreground)' }}>
                  {stat.value}
                </p>
                <p className="text-[10px] text-muted-foreground font-medium tracking-wide mt-0.5">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          {/* Detail line + arrow */}
          <div className="flex items-center justify-between pt-1">
            <p
              className="text-xs font-medium tracking-wide"
              style={{
                color: isActive ? service.accent : 'rgba(107,107,128,0.4)',
                transition: 'color 0.6s ease',
              }}>
              {service.detail}
            </p>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                background: `rgba(${service.accentRgb},${isActive ? '0.15' : '0.04'})`,
                border: `1px solid rgba(${service.accentRgb},${isActive ? '0.3' : '0.08'})`,
                color: isActive ? service.accent : 'var(--muted-foreground)',
                transform: isActive ? 'translateX(4px)' : 'translateX(0)',
                transition: 'all 0.5s cubic-bezier(0.16,1,0.3,1)',
              }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>

          {/* Bottom accent bar */}
          <div className="h-px rounded-full overflow-hidden" style={{ background: 'rgba(24,24,42,1)' }}>
            <div
              className="h-full rounded-full"
              style={{
                width: isActive ? '100%' : '0%',
                background: `linear-gradient(90deg, transparent, ${service.accent}, transparent)`,
                transition: 'width 0.9s cubic-bezier(0.16,1,0.3,1)',
              }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ServicesSection() {
  const [hovered, setHovered] = useState<number | null>(null);
  const [activeAccordion, setActiveAccordion] = useState<number | null>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const [headingVisible, setHeadingVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setHeadingVisible(true); },
      { threshold: 0.2 }
    );
    if (headingRef.current) observer.observe(headingRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="services" className="relative py-28 sm:py-40 px-6 sm:px-10 overflow-hidden">

      {/* ── Ambient background layer ── */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Dot constellation */}
        {dots.map((d) => (
          <div
            key={d.id}
            className="absolute rounded-full"
            style={{
              left: d.x, top: d.y,
              width: d.size, height: d.size,
              background: d.id % 3 === 0 ? 'rgba(201,169,110,0.3)' : 'rgba(107,107,128,0.2)',
              animation: `float-gentle ${6 + (d.id % 4)}s ease-in-out infinite`,
              animationDelay: `${d.delay}s`,
            }} />
        ))}
        {/* Central glow */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            width: '70vw', height: '70vw',
            background: 'radial-gradient(ellipse, rgba(201,169,110,0.03) 0%, transparent 65%)',
            filter: 'blur(40px)',
          }} />
        {/* Edge vignette */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-transparent to-background/40" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">

        {/* Section divider */}
        <div className="section-divider mb-20" />

        {/* ── Header ── */}
        <div ref={headingRef} className="mb-20">
          <div
            className="inline-flex items-center gap-2.5 mb-6"
            style={{
              opacity: headingVisible ? 1 : 0,
              transform: headingVisible ? 'translateY(0)' : 'translateY(20px)',
              transition: 'opacity 0.9s ease, transform 0.9s ease',
            }}>
            <div className="w-6 h-px bg-primary/60" />
            <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-primary/80">
              What We Create
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <h2
              className="text-[clamp(1.5rem,5vw,3rem)] font-black tracking-tighter text-foreground leading-[0.95] max-w-xl"
              style={{
                opacity: headingVisible ? 1 : 0,
                transform: headingVisible ? 'translateY(0)' : 'translateY(30px)',
                transition: 'opacity 1s ease 120ms, transform 1s ease 120ms',
              }}>
              Services Built<br />
              for{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #B8935A 0%, #E8D4A0 45%, #D4B87A 75%, #C9A96E 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>
                Modern Beauty
              </span>
            </h2>

            <p
              className="text-sm text-muted-foreground font-light max-w-xs leading-[1.8] md:text-right"
              style={{
                opacity: headingVisible ? 1 : 0,
                transform: headingVisible ? 'translateY(0)' : 'translateY(20px)',
                transition: 'opacity 1s ease 240ms, transform 1s ease 240ms',
              }}>
              Three core disciplines that transform how luxury brands produce and distribute visual content.
            </p>
          </div>
        </div>

        {/* ── Desktop: 3-col cards ── */}
        <div className="hidden md:grid grid-cols-3 gap-5">
          {services.map((service, i) => (
            <ServiceCard
              key={service.id}
              service={service}
              index={i}
              isActive={hovered === service.id}
              onHover={setHovered} />
          ))}
        </div>

        {/* ── Mobile: Accordion ── */}
        <div className="md:hidden flex flex-col gap-3">
          {services.map((service, i) => (
            <div
              key={service.id}
              className="rounded-[24px] overflow-hidden border transition-all duration-700"
              style={{
                borderColor: activeAccordion === service.id ? `${service.accent}25` : 'var(--border)',
                background:
                  activeAccordion === service.id
                    ? `linear-gradient(145deg, rgba(${service.accentRgb},0.06) 0%, var(--card) 100%)`
                    : 'var(--card)',
              }}>
              <button
                onClick={() => setActiveAccordion(activeAccordion === service.id ? null : service.id)}
                className="w-full flex items-center justify-between p-5 text-left gap-4">
                <div className="flex items-center gap-4">
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background: `rgba(${service.accentRgb},0.12)`,
                      color: service.accent,
                      border: `1px solid rgba(${service.accentRgb},0.2)`,
                    }}>
                    {service.icon}
                  </div>
                  <div>
                    <span className="text-[9px] font-bold tracking-[0.22em] uppercase block mb-0.5" style={{ color: service.accent }}>
                      {service.number} · {service.tag}
                    </span>
                    <h3 className="text-base font-bold tracking-tight text-foreground">
                      {service.title}
                    </h3>
                  </div>
                </div>
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    background: `rgba(${service.accentRgb},0.08)`,
                    border: `1px solid rgba(${service.accentRgb},0.15)`,
                    color: service.accent,
                    transform: activeAccordion === service.id ? 'rotate(45deg)' : 'rotate(0deg)',
                    transition: 'transform 0.5s cubic-bezier(0.16,1,0.3,1)',
                  }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </div>
              </button>

              <div
                className="overflow-hidden transition-all duration-700 ease-in-out"
                style={{ maxHeight: activeAccordion === service.id ? '280px' : '0' }}>
                <div className="px-5 pb-5 flex flex-col gap-4">
                  <p className="text-sm text-muted-foreground leading-[1.8] font-light">
                    {service.description}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {service.stats.map((stat) => (
                      <div
                        key={stat.label}
                        className="rounded-xl px-3 py-2.5"
                        style={{
                          background: `rgba(${service.accentRgb},0.07)`,
                          border: `1px solid rgba(${service.accentRgb},0.15)`,
                        }}>
                        <p className="text-base font-black" style={{ color: service.accent }}>{stat.value}</p>
                        <p className="text-[10px] text-muted-foreground font-medium tracking-wide">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs font-medium tracking-wide" style={{ color: service.accent }}>
                    {service.detail}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Keyframe injections ── */}
      <style>{`
        @keyframes orbit-spin {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to   { transform: translate(-50%, -50%) rotate(360deg); }
        }
        @keyframes shimmer-card {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </section>
  );
}
