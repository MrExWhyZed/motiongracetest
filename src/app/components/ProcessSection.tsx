'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import AppImage from '@/components/ui/AppImage';

/* ─────────────── data ─────────────── */

const steps = [
  {
    number: '01',
    title: 'Digital Twin',
    subtitle: 'Product Capture',
    description: 'We recreate your product with photoreal precision. Every material, every reflection, every imperfection — faithfully translated into a 3D digital master.',
    detail: 'Accurate to 0.1mm. Indistinguishable from photography.',
    image: 'https://img.rocket.new/generatedImages/rocket_gen_img_1eb6c0798-1773050458627.png',
    alt: 'Close-up of luxury skincare product on dark reflective surface',
    accent: '#C9A96E',
    tag: 'Scan · Model · Verify',
    icon: '◈',
  },
  {
    number: '02',
    title: 'Virtual Set',
    subtitle: 'World Building',
    description: 'We design dream-like environments tailored to your brand identity. From marble minimalism to otherworldly abstraction — the set exists only in our render engine.',
    detail: 'Unlimited locations. Zero location fees.',
    image: 'https://img.rocket.new/generatedImages/rocket_gen_img_12a7e6d89-1775498680444.png',
    alt: 'Abstract CGI environment with atmospheric lighting',
    accent: '#A78BFF',
    tag: 'Concept · Build · Light',
    icon: '◉',
  },
  {
    number: '03',
    title: 'Action Cuts',
    subtitle: 'Infinite Output',
    description: 'We produce endless variations from a single digital master. New season? New campaign? New market? Change the world in minutes, not months.',
    detail: 'One asset. Every format. Every platform.',
    image: 'https://img.rocket.new/generatedImages/rocket_gen_img_1ee529cda-1772150438746.png',
    alt: 'Beauty product campaign layout with multiple variations',
    accent: '#4A9EFF',
    tag: 'Animate · Compose · Export',
    icon: '◇',
  },
  {
    number: '04',
    title: 'Final Output',
    subtitle: 'Cinematic Delivery',
    description: 'Your brand story, fully rendered and ready to deploy. Cinematic compositions delivered across every format — from social to billboard, from web to broadcast.',
    detail: 'Delivered in every format. Ready to publish.',
    image: 'https://img.rocket.new/generatedImages/rocket_gen_img_13e1d5a57-1772125799174.png',
    alt: 'Final cinematic product composition with soft gold glow',
    accent: '#C9A96E',
    tag: 'Render · Review · Deliver',
    icon: '◈',
  },
];

/* ─────────────── component ─────────────── */

export default function ProcessSection() {
  const outerRef      = useRef<HTMLDivElement>(null);
  const svgLineRef    = useRef<SVGPathElement>(null);
  const stepRefs      = useRef<(HTMLDivElement | null)[]>([]);
  const particleCanvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef        = useRef<number>(0);

  const [activeStep, setActiveStep]       = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [stepProgress, setStepProgress]   = useState(0);
  const [sectionVisible, setSectionVisible] = useState(false);

  /* subtle particle canvas */
  useEffect(() => {
    const canvas = particleCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = 0, h = 0;
    const resize = () => { w = canvas.width = canvas.offsetWidth; h = canvas.height = canvas.offsetHeight; };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    /* gentle flowing lines */
    const lines: { x: number; y: number; len: number; speed: number; opacity: number; angle: number }[] = [];
    for (let i = 0; i < 18; i++) {
      lines.push({
        x: Math.random(), y: Math.random(),
        len: 40 + Math.random() * 80,
        speed: 0.0002 + Math.random() * 0.0003,
        opacity: 0.03 + Math.random() * 0.05,
        angle: Math.random() * Math.PI * 2,
      });
    }

    const draw = (ts: number) => {
      ctx.clearRect(0, 0, w, h);
      lines.forEach(ln => {
        ln.angle += ln.speed;
        const px = ln.x * w + Math.sin(ts * 0.0003 + ln.angle) * 30;
        const py = ln.y * h + Math.cos(ts * 0.0004 + ln.angle * 1.3) * 20;
        const ex = px + Math.cos(ln.angle) * ln.len;
        const ey = py + Math.sin(ln.angle) * ln.len;

        const grd = ctx.createLinearGradient(px, py, ex, ey);
        grd.addColorStop(0, `rgba(201,169,110,0)`);
        grd.addColorStop(0.5, `rgba(201,169,110,${ln.opacity})`);
        grd.addColorStop(1, `rgba(201,169,110,0)`);
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(ex, ey);
        ctx.strokeStyle = grd;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      });
      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(rafRef.current); ro.disconnect(); };
  }, []);

  /* scroll */
  const handleScroll = useCallback(() => {
    const el = outerRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const totalScrollable = el.offsetHeight - window.innerHeight;
    if (totalScrollable <= 0) return;

    const scrolled = -rect.top;
    const raw = Math.max(0, Math.min(1, scrolled / totalScrollable));
    setScrollProgress(raw);
    setSectionVisible(rect.top < window.innerHeight * 0.85);

    const stepSize = 1 / steps.length;
    const step = Math.min(steps.length - 1, Math.floor(raw * steps.length));
    const sp = Math.min(1, (raw - step * stepSize) / stepSize);
    setActiveStep(step);
    setStepProgress(sp);

    /* animate SVG connector line */
    if (svgLineRef.current) {
      const pathLen = svgLineRef.current.getTotalLength();
      svgLineRef.current.style.strokeDasharray = `${pathLen}`;
      svgLineRef.current.style.strokeDashoffset = `${pathLen * (1 - raw * 1.1)}`;
    }
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const stepSize = 1 / steps.length;
  const progressBarWidth = steps.length <= 1
    ? 100
    : (activeStep / (steps.length - 1)) * 100 + stepProgress * (100 / (steps.length - 1));
  const currentAccent = steps[activeStep].accent;

  return (
    <section id="process" style={{ background: '#06060C', overflowX: 'clip', position: 'relative' }}>

      {/* ── Section intro header ── */}
      <div
        className="pt-28 pb-12 px-6 sm:px-10"
        style={{
          opacity: sectionVisible ? 1 : 0,
          transform: sectionVisible ? 'translateY(0)' : 'translateY(32px)',
          transition: 'all 1s cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-6 mb-10">
            <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, transparent, rgba(201,169,110,0.3))' }} />
            <span className="text-[9px] font-semibold tracking-[0.3em] uppercase whitespace-nowrap" style={{ color: 'rgba(201,169,110,0.6)' }}>
              The Process
            </span>
            <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, rgba(201,169,110,0.3), transparent)' }} />
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <h2 className="font-black tracking-tighter leading-none" style={{ fontSize: 'clamp(2rem,6vw,4rem)', color: '#F0EDE8', letterSpacing: '-0.03em' }}>
              From Product{' '}
              <span style={{
                background: 'linear-gradient(135deg, #8B6F3E 0%, #F2E4C4 40%, #D4A96A 70%, #C9956E 100%)',
                WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>to Possibility</span>
            </h2>
            <p className="text-sm leading-[1.8] font-light lg:max-w-sm" style={{ color: 'rgba(237,233,227,0.4)' }}>
              A four-act transformation that turns your product into infinite visual stories.
            </p>
          </div>
        </div>
      </div>

      {/* ── DESKTOP: Sticky scroll zone ── */}
      <div ref={outerRef} className="hidden lg:block relative" style={{ height: `${steps.length * 100}vh` }}>
        <div className="sticky top-0 h-screen" style={{ background: '#06060C', overflow: 'hidden' }}>

          {/* Particle canvas background */}
          <canvas ref={particleCanvasRef} className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.8 }} />

          {/* Ambient colour wash transitions with step */}
          <div className="absolute inset-0 pointer-events-none" style={{
            background: `radial-gradient(ellipse 55% 60% at 72% 52%, ${currentAccent}0E, transparent 65%)`,
            transition: 'background 1s ease',
          }} />

          {/* Subtle grid */}
          <div className="absolute inset-0 pointer-events-none" style={{
            backgroundImage: `linear-gradient(rgba(201,169,110,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(201,169,110,0.018) 1px, transparent 1px)`,
            backgroundSize: '80px 80px',
          }} />

          <div className="relative z-10 h-full flex flex-col max-w-7xl mx-auto px-10">

            {/* ── Step nav bar ── */}
            <div className="flex items-center pt-6 pb-5 shrink-0">
              {steps.map((s, i) => (
                <React.Fragment key={s.number}>
                  <div className="flex items-center gap-3 shrink-0 cursor-default select-none">
                    {/* Dot with ring */}
                    <div className="relative flex items-center justify-center" style={{ width: 20, height: 20 }}>
                      <span className="absolute inset-0 rounded-full" style={{
                        border: `1px solid ${s.accent}`,
                        opacity: activeStep === i ? 0.6 : 0,
                        transform: activeStep === i ? 'scale(1)' : 'scale(0.3)',
                        transition: 'all 500ms cubic-bezier(0.16,1,0.3,1)',
                        animation: activeStep === i ? 'ring-pulse 2.5s ease-in-out infinite' : 'none',
                      }} />
                      <span className="rounded-full" style={{
                        width: activeStep === i ? 8 : i < activeStep ? 5 : 4,
                        height: activeStep === i ? 8 : i < activeStep ? 5 : 4,
                        background: activeStep === i ? s.accent : i < activeStep ? 'rgba(201,169,110,0.45)' : 'rgba(201,169,110,0.18)',
                        boxShadow: activeStep === i ? `0 0 10px ${s.accent}80` : 'none',
                        transition: 'all 500ms cubic-bezier(0.16,1,0.3,1)',
                      }} />
                    </div>
                    {/* Label */}
                    <span className="text-[9px] font-semibold tracking-[0.18em] uppercase whitespace-nowrap" style={{
                      color: activeStep === i ? s.accent : 'rgba(237,233,227,0.22)',
                      transition: 'color 500ms ease',
                    }}>{s.subtitle}</span>
                  </div>

                  {i < steps.length - 1 && (
                    <div className="relative mx-5 shrink-0" style={{ width: 64, height: 1 }}>
                      <div className="absolute inset-0 rounded-full" style={{ background: 'rgba(201,169,110,0.08)' }} />
                      <div className="absolute inset-y-0 left-0 rounded-full" style={{
                        width: i < activeStep ? '100%' : i === activeStep ? `${stepProgress * 100}%` : '0%',
                        background: `linear-gradient(90deg, ${steps[i].accent}80, ${steps[i+1].accent}50)`,
                        transition: i < activeStep ? 'width 400ms ease' : 'width 60ms linear',
                        boxShadow: i === activeStep ? `0 0 8px ${steps[i].accent}40` : 'none',
                      }} />
                    </div>
                  )}
                </React.Fragment>
              ))}

              {/* Step counter */}
              <div className="ml-auto flex items-center gap-2">
                <span className="text-[10px] font-bold tabular-nums" style={{ color: currentAccent, transition: 'color 600ms ease' }}>
                  {String(activeStep + 1).padStart(2,'0')}
                </span>
                <span className="text-[10px]" style={{ color: 'rgba(201,169,110,0.25)' }}>/</span>
                <span className="text-[10px] tabular-nums" style={{ color: 'rgba(201,169,110,0.25)' }}>
                  {String(steps.length).padStart(2,'0')}
                </span>
              </div>
            </div>

            <div className="shrink-0 h-px w-full" style={{ background: 'rgba(201,169,110,0.05)' }} />

            {/* ── Main content area ── */}
            <div className="flex-1 flex items-stretch gap-10 min-h-0 py-8">

              {/* LEFT — stacked steps list */}
              <div className="flex flex-col justify-center w-[44%] shrink-0 gap-0">

                {/* Steps list with animated connectors */}
                <div className="relative">

                  {/* SVG vertical connector */}
                  <svg
                    className="absolute left-[18px] top-0 pointer-events-none"
                    style={{ width: 2, height: '100%', overflow: 'visible' }}
                    viewBox="0 0 2 300"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M1 0 L1 300"
                      stroke="rgba(201,169,110,0.08)"
                      strokeWidth="1.5"
                      fill="none"
                    />
                    <path
                      ref={svgLineRef}
                      d="M1 0 L1 300"
                      stroke={`url(#lineGrad)`}
                      strokeWidth="1.5"
                      fill="none"
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient id="lineGrad" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="300">
                        <stop offset="0%" stopColor="#C9A96E" stopOpacity="0.8" />
                        <stop offset="50%" stopColor="#A78BFF" stopOpacity="0.6" />
                        <stop offset="100%" stopColor="#4A9EFF" stopOpacity="0.4" />
                      </linearGradient>
                    </defs>
                  </svg>

                  {steps.map((step, i) => {
                    const isActive = activeStep === i;
                    const isPast   = i < activeStep;
                    const isFuture = i > activeStep;

                    return (
                      <div
                        key={step.number}
                        ref={(el: HTMLDivElement | null) => { stepRefs.current[i] = el; }}
                        className="relative flex gap-6 pb-8 last:pb-0"
                        style={{
                          opacity: isActive ? 1 : isPast ? 0.42 : 0.18,
                          transform: isActive
                            ? 'translateX(0px) scale(1)'
                            : isPast
                              ? 'translateX(-4px) scale(0.99)'
                              : `translateX(${14}px) scale(0.98)`,
                          transition: 'all 700ms cubic-bezier(0.16,1,0.3,1)',
                        }}
                      >
                        {/* Step dot on timeline */}
                        <div className="flex-none relative mt-1" style={{ width: 38 }}>
                          <div
                            className="flex items-center justify-center rounded-full"
                            style={{
                              width: 38, height: 38,
                              background: isActive
                                ? `linear-gradient(135deg, ${step.accent}25, ${step.accent}08)`
                                : 'rgba(201,169,110,0.04)',
                              border: `1px solid ${isActive ? step.accent + '50' : 'rgba(201,169,110,0.1)'}`,
                              boxShadow: isActive ? `0 0 20px ${step.accent}25` : 'none',
                              transition: 'all 600ms cubic-bezier(0.16,1,0.3,1)',
                              fontSize: '1rem',
                            }}
                          >
                            <span style={{ color: isActive ? step.accent : 'rgba(201,169,110,0.3)', transition: 'color 500ms ease' }}>
                              {step.icon}
                            </span>
                          </div>
                        </div>

                        {/* Step text */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-black tabular-nums text-xs" style={{ color: isActive ? step.accent : 'rgba(201,169,110,0.25)', transition: 'color 500ms ease' }}>
                              {step.number}
                            </span>
                            <span className="text-[8px] font-semibold tracking-[0.2em] uppercase px-2 py-0.5 rounded-full" style={{
                              background: isActive ? `${step.accent}12` : 'transparent',
                              color: isActive ? step.accent : 'rgba(201,169,110,0.2)',
                              border: `1px solid ${isActive ? step.accent + '28' : 'rgba(201,169,110,0.08)'}`,
                              transition: 'all 500ms ease',
                            }}>
                              {step.tag}
                            </span>
                          </div>

                          <h3 className="font-black tracking-tighter leading-tight mb-2" style={{
                            fontSize: isActive ? 'clamp(28px, 3.2vw, 42px)' : 'clamp(22px, 2.4vw, 32px)',
                            color: isActive ? '#F0EDE8' : 'rgba(237,233,227,0.5)',
                            letterSpacing: '-0.025em',
                            transition: 'all 600ms cubic-bezier(0.16,1,0.3,1)',
                          }}>
                            {step.title}
                          </h3>

                          <p
                            className="leading-[1.8] font-light"
                            style={{
                              fontSize: 13, color: 'rgba(237,233,227,0.45)',
                              maxWidth: 360,
                              maxHeight: isActive ? '120px' : '0px',
                              overflow: 'hidden',
                              opacity: isActive ? 1 : 0,
                              transition: 'max-height 700ms cubic-bezier(0.16,1,0.3,1), opacity 500ms ease',
                            }}
                          >
                            {step.description}
                          </p>

                          <div
                            className="flex items-center gap-2 mt-3 w-fit px-3 py-1.5 rounded-full"
                            style={{
                              background: isActive ? `${step.accent}0A` : 'transparent',
                              border: `1px solid ${isActive ? step.accent + '20' : 'transparent'}`,
                              opacity: isActive ? 1 : 0,
                              transform: isActive ? 'translateY(0)' : 'translateY(8px)',
                              transition: 'all 600ms cubic-bezier(0.16,1,0.3,1) 0.1s',
                            }}
                          >
                            <span className="w-1 h-1 rounded-full shrink-0" style={{ background: step.accent }} />
                            <span className="text-[11px] font-medium tracking-wide" style={{ color: step.accent }}>{step.detail}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Overall progress bar */}
                <div className="flex items-center gap-4 mt-8 pl-[46px]">
                  <div className="flex-1 h-px rounded-full overflow-hidden" style={{ background: 'rgba(201,169,110,0.08)' }}>
                    <div style={{
                      height: '100%', width: `${progressBarWidth}%`,
                      background: `linear-gradient(90deg, ${steps[0].accent}55, ${currentAccent})`,
                      transition: 'width 100ms linear, background 800ms ease',
                      borderRadius: 999,
                      boxShadow: `0 0 8px ${currentAccent}40`,
                    }} />
                  </div>
                </div>
              </div>

              {/* RIGHT — image panel with staggered reveals */}
              <div className="flex-1 relative min-h-0">

                {/* Corner brackets */}
                {(['top-0 left-0 border-t border-l','top-0 right-0 border-t border-r','bottom-0 left-0 border-b border-l','bottom-0 right-0 border-b border-r'] as const).map((cls, ci) => (
                  <div key={ci} className={`absolute w-6 h-6 ${cls} z-20 pointer-events-none`}
                    style={{ borderColor: `${currentAccent}45`, transition: 'border-color 700ms ease' }} />
                ))}

                {steps.map((step, i) => {
                  const isActive = activeStep === i;
                  const isPast   = i < activeStep;
                  return (
                    <div key={step.number} className="absolute inset-0 overflow-hidden" style={{
                      borderRadius: 12,
                      opacity: isActive ? 1 : 0,
                      transform: isActive
                        ? 'scale(1) translateY(0px)'
                        : isPast ? 'scale(0.975) translateY(-12px)' : 'scale(1.025) translateY(12px)',
                      transition: 'opacity 1100ms cubic-bezier(0.16,1,0.3,1), transform 1300ms cubic-bezier(0.16,1,0.3,1)',
                    }}>
                      <AppImage
                        src={step.image} alt={step.alt} fill className="object-cover" sizes="55vw"
                        style={{
                          transform: isActive ? 'scale(1.06)' : 'scale(1)',
                          transition: 'transform 7000ms cubic-bezier(0.16,1,0.3,1)',
                          filter: 'saturate(0.82) brightness(0.88)',
                        }}
                      />
                      <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(6,6,12,0.55) 0%, rgba(6,6,12,0.06) 45%, transparent 65%)' }} />
                      <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(6,6,12,0.72) 0%, transparent 45%)' }} />
                      <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse 55% 45% at 68% 28%, ${step.accent}18, transparent 58%)`, mixBlendMode: 'screen' }} />

                      {/* Editorial number stamp */}
                      <div className="absolute bottom-6 right-6 flex flex-col items-end gap-1">
                        <span className="font-black tabular-nums leading-none select-none" style={{ fontSize: 72, color: step.accent, opacity: 0.1, letterSpacing: '-0.05em', lineHeight: 1 }}>{step.number}</span>
                        <span className="text-[8px] font-semibold tracking-[0.22em] uppercase" style={{ color: `${step.accent}55` }}>{step.subtitle}</span>
                      </div>

                      <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: `inset 0 0 0 1px ${step.accent}18`, borderRadius: 12 }} />
                    </div>
                  );
                })}

                {/* Vertical accent line */}
                <div className="absolute -left-5 top-1/2 -translate-y-1/2 pointer-events-none" style={{
                  width: 1, height: `${28 + progressBarWidth * 0.42}%`,
                  background: `linear-gradient(to bottom, transparent, ${currentAccent}45, transparent)`,
                  transition: 'height 100ms linear, background 800ms ease',
                }} />

                {/* Step hover hint: scale on hover via group */}
                <div
                  className="absolute inset-0 rounded-xl"
                  style={{
                    transition: 'box-shadow 400ms ease',
                    boxShadow: `0 0 0 0 ${currentAccent}00`,
                  }}
                  onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => { (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 60px ${currentAccent}18, inset 0 0 0 1px ${currentAccent}30`; }}
                  onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => { (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 0 0 ${currentAccent}00`; }}
                />
              </div>
            </div>
          </div>

          {/* Scroll hint */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10 pointer-events-none" style={{
            opacity: scrollProgress < 0.04 ? 1 : 0, transition: 'opacity 600ms ease',
          }}>
            <span className="text-[8px] font-semibold tracking-[0.25em] uppercase" style={{ color: 'rgba(201,169,110,0.3)' }}>Scroll to explore</span>
            <div style={{ width: 1, height: 28, background: 'linear-gradient(to bottom, rgba(201,169,110,0.45), transparent)', animation: 'proc-pulse 2.5s ease-in-out infinite' }} />
          </div>
        </div>
      </div>

      {/* ── MOBILE ── */}
      <div className="lg:hidden px-5 pb-28 pt-4">
        <div className="flex flex-col gap-5">
          {steps.map((step, i) => (
            <MobileStepCard key={step.number} step={step} index={i} />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes ring-pulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 0.25; transform: scale(1.3); }
        }
        @keyframes proc-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </section>
  );
}

/* ─────────────── mobile card ─────────────── */

interface StepData {
  number: string; title: string; subtitle: string; description: string;
  detail: string; image: string; alt: string; accent: string; tag: string; icon?: string;
}

function MobileStepCard({ step, index }: { step: StepData; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="rounded-2xl overflow-hidden" style={{
      background: '#0C0C14', border: `1px solid ${step.accent}18`,
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0px)' : 'translateY(32px)',
      transition: `opacity 800ms cubic-bezier(0.16,1,0.3,1) ${index * 80}ms, transform 800ms cubic-bezier(0.16,1,0.3,1) ${index * 80}ms`,
    }}>
      <div className="relative overflow-hidden" style={{ height: 220 }}>
        <AppImage src={step.image} alt={step.alt} fill className="object-cover" sizes="100vw"
          style={{ transform: visible ? 'scale(1.03)' : 'scale(1.1)', transition: 'transform 1600ms cubic-bezier(0.16,1,0.3,1)', filter: 'saturate(0.85)' }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, #0C0C14 0%, rgba(12,12,20,0.2) 55%, transparent 100%)' }} />
        <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse 60% 50% at 70% 30%, ${step.accent}15, transparent 60%)`, mixBlendMode: 'screen' }} />
        <div className="absolute top-4 left-4">
          <span className="text-[8px] font-bold tracking-[0.25em] uppercase px-2.5 py-1 rounded-full"
            style={{ background: 'rgba(6,6,12,0.7)', color: step.accent, border: `1px solid ${step.accent}30`, backdropFilter: 'blur(8px)' }}>
            {step.number} / 04
          </span>
        </div>
        <div className="absolute bottom-3 right-4 font-black leading-none select-none"
          style={{ fontSize: 72, color: step.accent, opacity: 0.1, letterSpacing: '-0.04em' }}>
          {step.number}
        </div>
        <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: `inset 0 0 0 1px ${step.accent}18` }} />
      </div>
      <div className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-1 h-1 rounded-full shrink-0" style={{ background: step.accent }} />
          <span className="text-[8px] font-semibold tracking-[0.22em] uppercase" style={{ color: step.accent }}>{step.subtitle}</span>
          <span className="text-[8px] tracking-widest uppercase" style={{ color: 'rgba(237,233,227,0.2)' }}>· {step.tag}</span>
        </div>
        <h3 className="font-black tracking-tighter leading-none mb-3" style={{ fontSize: 28, color: '#F0EDE8', letterSpacing: '-0.025em' }}>{step.title}</h3>
        <p className="leading-[1.8] font-light mb-4" style={{ fontSize: 13, color: 'rgba(237,233,227,0.5)' }}>{step.description}</p>
        <div className="flex items-center gap-2 px-3 py-2 rounded-full w-fit" style={{ background: `${step.accent}0A`, border: `1px solid ${step.accent}20` }}>
          <span className="w-1 h-1 rounded-full" style={{ background: step.accent }} />
          <span className="text-[11px] font-medium" style={{ color: step.accent }}>{step.detail}</span>
        </div>
        <div className="mt-5 h-px" style={{ background: `linear-gradient(90deg, ${step.accent}25, transparent)` }} />
      </div>
    </div>
  );
}
