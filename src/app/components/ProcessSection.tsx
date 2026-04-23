'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import AppImage from '@/components/ui/AppImage';

const steps = [
  {
    number: '01',
    title: 'Digital Twin',
    subtitle: 'Product Capture',
    description:
      'We recreate your product with photoreal precision. Every material, every reflection, every imperfection — faithfully translated into a 3D digital master.',
    detail: 'Accurate to 0.1mm. Indistinguishable from photography.',
    image: 'https://img.rocket.new/generatedImages/rocket_gen_img_1eb6c0798-1773050458627.png',
    alt: 'Close-up of luxury skincare product on dark reflective surface',
    accent: '#C9A96E',
    tag: 'Scan · Model · Verify',
  },
  {
    number: '02',
    title: 'Virtual Set',
    subtitle: 'World Building',
    description:
      'We design dream-like environments tailored to your brand identity. From marble minimalism to otherworldly abstraction — the set exists only in our render engine.',
    detail: 'Unlimited locations. Zero location fees.',
    image: 'https://img.rocket.new/generatedImages/rocket_gen_img_12a7e6d89-1775498680444.png',
    alt: 'Abstract CGI environment with atmospheric lighting',
    accent: '#A78BFF',
    tag: 'Concept · Build · Light',
  },
  {
    number: '03',
    title: 'Action Cuts',
    subtitle: 'Infinite Output',
    description:
      'We produce endless variations and campaigns from a single digital master. New season? New campaign? New market? Change the world in minutes, not months.',
    detail: 'One asset. Every format. Every platform.',
    image: 'https://img.rocket.new/generatedImages/rocket_gen_img_1ee529cda-1772150438746.png',
    alt: 'Beauty product campaign layout with multiple variations',
    accent: '#4A9EFF',
    tag: 'Animate · Compose · Export',
  },
  {
    number: '04',
    title: 'Final Output',
    subtitle: 'Cinematic Delivery',
    description:
      'Your brand story, fully rendered and ready to deploy. Cinematic compositions delivered across every format — from social to billboard, from web to broadcast.',
    detail: 'Delivered in every format. Ready to publish.',
    image: 'https://img.rocket.new/generatedImages/rocket_gen_img_13e1d5a57-1772125799174.png',
    alt: 'Final cinematic product composition with soft gold glow',
    accent: '#C9A96E',
    tag: 'Render · Review · Deliver',
  },
];

export default function ProcessSection() {
  const [activeStep, setActiveStep] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const outerRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(() => {
    const el = outerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const totalScrollable = el.offsetHeight - window.innerHeight;
    if (totalScrollable <= 0) return;
    const scrolled = -rect.top;
    const raw = Math.max(0, Math.min(1, scrolled / totalScrollable));
    setScrollProgress(raw);
    const step = Math.min(steps.length - 1, Math.floor(raw * steps.length));
    setActiveStep(step);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const stepSize = 1 / steps.length;
  const stepProgress = Math.min(1, (scrollProgress - activeStep * stepSize) / stepSize);
  const progressBarWidth =
    steps.length <= 1
      ? 100
      : (activeStep / (steps.length - 1)) * 100 +
        stepProgress * (100 / (steps.length - 1));

  const currentAccent = steps[activeStep].accent;

  return (
    <section id="process" style={{ background: '#06060C', overflowX: 'clip' }}>

      {/* ── Section header — sits ABOVE the scroll zone, not sticky ── */}
      <div className="pt-24 pb-10 px-6 sm:px-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-6 mb-10">
            <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, transparent, rgba(201,169,110,0.3))' }} />
            <span className="text-[9px] font-semibold tracking-[0.3em] uppercase whitespace-nowrap" style={{ color: 'rgba(201,169,110,0.6)' }}>
              The Process
            </span>
            <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, rgba(201,169,110,0.3), transparent)' }} />
          </div>
          <h2
            className="font-black tracking-tighter leading-none"
            style={{ fontSize: 'clamp(1.5rem,5vw,3rem)', color: '#F0EDE8', letterSpacing: '-0.03em' }}
          >
            From Product{' '}
            <span style={{
              background: 'linear-gradient(135deg, #8B6F3E 0%, #F2E4C4 40%, #D4A96A 70%, #C9956E 100%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              to Possibility
            </span>
          </h2>
        </div>
      </div>

      {/* ── DESKTOP sticky scroll ── */}
      <div
        ref={outerRef}
        className="hidden lg:block relative"
        style={{ height: `${steps.length * 100}vh` }}
      >
        <div
          className="sticky top-0 h-screen"
          style={{ background: '#06060C' }}
        >
          {/* Ambient colour wash */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse 50% 55% at 72% 55%, ${currentAccent}11, transparent 65%)`,
              transition: 'background 900ms ease',
            }}
          />
          {/* Grid */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `
                linear-gradient(rgba(201,169,110,0.02) 1px, transparent 1px),
                linear-gradient(90deg, rgba(201,169,110,0.02) 1px, transparent 1px)
              `,
              backgroundSize: '80px 80px',
            }}
          />

          {/* All content fits in 100vh using flex column */}
          <div className="relative z-10 h-full flex flex-col max-w-7xl mx-auto px-10">

            {/* ── STEP NAV — horizontal, top of sticky panel ── */}
            <div className="flex items-center pt-7 pb-6 shrink-0">
              {steps.map((s, i) => (
                <React.Fragment key={s.number}>
                  {/* Step item */}
                  <div className="flex items-center gap-2.5 shrink-0">
                    {/* Dot */}
                    <div className="relative flex items-center justify-center" style={{ width: 18, height: 18 }}>
                      <span
                        className="absolute inset-0 rounded-full"
                        style={{
                          border: `1px solid ${s.accent}`,
                          opacity: activeStep === i ? 0.55 : 0,
                          transform: activeStep === i ? 'scale(1)' : 'scale(0.3)',
                          transition: 'all 600ms cubic-bezier(0.16,1,0.3,1)',
                        }}
                      />
                      <span
                        className="rounded-full"
                        style={{
                          width: activeStep === i ? 7 : i < activeStep ? 5 : 4,
                          height: activeStep === i ? 7 : i < activeStep ? 5 : 4,
                          background: activeStep === i ? s.accent : i < activeStep ? 'rgba(201,169,110,0.45)' : 'rgba(201,169,110,0.18)',
                          transition: 'all 500ms ease',
                        }}
                      />
                    </div>
                    {/* Label */}
                    <span
                      className="text-[9px] font-semibold tracking-[0.18em] uppercase whitespace-nowrap"
                      style={{
                        color: activeStep === i ? s.accent : 'rgba(237,233,227,0.25)',
                        transition: 'color 600ms ease',
                      }}
                    >
                      {s.subtitle}
                    </span>
                  </div>

                  {/* Connector between steps */}
                  {i < steps.length - 1 && (
                    <div className="relative mx-4 shrink-0" style={{ width: 60, height: 1 }}>
                      <div className="absolute inset-0 rounded-full" style={{ background: 'rgba(201,169,110,0.1)' }} />
                      <div
                        className="absolute inset-y-0 left-0 rounded-full"
                        style={{
                          width: i < activeStep ? '100%' : i === activeStep ? `${stepProgress * 100}%` : '0%',
                          background: `linear-gradient(90deg, ${steps[i].accent}90, ${steps[i + 1].accent}60)`,
                          transition: i < activeStep ? 'width 400ms ease' : 'width 80ms linear',
                        }}
                      />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Thin divider below nav */}
            <div className="shrink-0 h-px w-full mb-0" style={{ background: 'rgba(201,169,110,0.06)' }} />

            {/* ── MAIN CONTENT — fills remaining height ── */}
            <div className="flex-1 flex items-center gap-12 min-h-0">

              {/* LEFT text */}
              <div className="flex flex-col justify-center w-[42%] shrink-0">
                <div className="relative" style={{ height: 280 }}>
                  {steps.map((step, i) => {
                    const isActive = activeStep === i;
                    const isPast = i < activeStep;
                    return (
                      <div
                        key={step.number}
                        className="absolute inset-0 flex flex-col justify-center"
                        style={{
                          opacity: isActive ? 1 : 0,
                          transform: isActive ? 'translateY(0px)' : isPast ? 'translateY(-16px)' : 'translateY(16px)',
                          transition: 'opacity 800ms cubic-bezier(0.16,1,0.3,1), transform 800ms cubic-bezier(0.16,1,0.3,1)',
                          pointerEvents: isActive ? 'auto' : 'none',
                        }}
                      >
                        {/* Number + tag */}
                        <div className="flex items-baseline gap-4 mb-4">
                          <span
                            className="font-black tabular-nums"
                            style={{ fontSize: 60, color: step.accent, opacity: 0.14, letterSpacing: '-0.04em', lineHeight: 1 }}
                          >
                            {step.number}
                          </span>
                          <span
                            className="text-[8px] font-semibold tracking-[0.22em] uppercase px-2.5 py-1 rounded-full"
                            style={{ background: `${step.accent}10`, color: step.accent, border: `1px solid ${step.accent}25` }}
                          >
                            {step.tag}
                          </span>
                        </div>

                        <h3
                          className="font-black tracking-tighter leading-none mb-4"
                          style={{ fontSize: 'clamp(36px, 4vw, 54px)', color: '#F0EDE8', letterSpacing: '-0.03em' }}
                        >
                          {step.title}
                        </h3>

                        <p
                          className="leading-[1.8] font-light mb-5"
                          style={{ fontSize: 14, color: 'rgba(237,233,227,0.5)', maxWidth: 390 }}
                        >
                          {step.description}
                        </p>

                        <div
                          className="flex items-center gap-2.5 w-fit px-4 py-2 rounded-full"
                          style={{ background: `${step.accent}0A`, border: `1px solid ${step.accent}20` }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: step.accent }} />
                          <span className="text-xs font-medium tracking-wide" style={{ color: step.accent }}>
                            {step.detail}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Progress bar */}
                <div className="flex items-center gap-4 mt-6">
                  <div className="flex-1 h-px rounded-full overflow-hidden" style={{ background: 'rgba(201,169,110,0.1)' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${progressBarWidth}%`,
                        background: `linear-gradient(90deg, ${steps[0].accent}55, ${currentAccent})`,
                        transition: 'width 100ms linear, background 800ms ease',
                        borderRadius: 999,
                      }}
                    />
                  </div>
                  <span className="text-[10px] font-semibold tabular-nums tracking-widest shrink-0" style={{ color: 'rgba(201,169,110,0.35)' }}>
                    {String(activeStep + 1).padStart(2, '0')} / {String(steps.length).padStart(2, '0')}
                  </span>
                </div>
              </div>

              {/* RIGHT image panel */}
              <div className="flex-1 relative min-h-0" style={{ height: '74vh' }}>

                {/* Corner marks */}
                {(['top-0 left-0 border-t border-l', 'top-0 right-0 border-t border-r', 'bottom-0 left-0 border-b border-l', 'bottom-0 right-0 border-b border-r'] as const).map((cls, i) => (
                  <div
                    key={i}
                    className={`absolute w-5 h-5 ${cls} z-20 pointer-events-none`}
                    style={{ borderColor: `${currentAccent}40`, transition: 'border-color 800ms ease' }}
                  />
                ))}

                {steps.map((step, i) => {
                  const isActive = activeStep === i;
                  const isPast = i < activeStep;
                  return (
                    <div
                      key={step.number}
                      className="absolute inset-0 overflow-hidden"
                      style={{
                        borderRadius: 8,
                        opacity: isActive ? 1 : 0,
                        transform: isActive
                          ? 'scale(1) translateY(0px)'
                          : isPast ? 'scale(0.977) translateY(-10px)' : 'scale(1.023) translateY(10px)',
                        transition: 'opacity 1100ms cubic-bezier(0.16,1,0.3,1), transform 1300ms cubic-bezier(0.16,1,0.3,1)',
                      }}
                    >
                      <AppImage
                        src={step.image} alt={step.alt} fill className="object-cover" sizes="55vw"
                        style={{
                          transform: isActive ? 'scale(1.06)' : 'scale(1)',
                          transition: 'transform 7000ms cubic-bezier(0.16,1,0.3,1)',
                          filter: 'saturate(0.82) brightness(0.9)',
                        }}
                      />
                      <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(6,6,12,0.52) 0%, rgba(6,6,12,0.06) 45%, transparent 65%)' }} />
                      <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(6,6,12,0.7) 0%, transparent 48%)' }} />
                      <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse 55% 45% at 68% 28%, ${step.accent}16, transparent 58%)`, mixBlendMode: 'screen' }} />

                      {/* Bottom-right editorial stamp */}
                      <div className="absolute bottom-6 right-6 flex flex-col items-end gap-1">
                        <span
                          className="font-black tabular-nums leading-none select-none"
                          style={{ fontSize: 68, color: step.accent, opacity: 0.1, letterSpacing: '-0.05em', lineHeight: 1 }}
                        >
                          {step.number}
                        </span>
                        <span className="text-[8px] font-semibold tracking-[0.22em] uppercase" style={{ color: `${step.accent}55` }}>
                          {step.subtitle}
                        </span>
                      </div>

                      <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: `inset 0 0 0 1px ${step.accent}16`, borderRadius: 8 }} />
                    </div>
                  );
                })}

                {/* Vertical accent line */}
                <div
                  className="absolute -left-6 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{
                    width: 1,
                    height: `${28 + progressBarWidth * 0.42}%`,
                    background: `linear-gradient(to bottom, transparent, ${currentAccent}45, transparent)`,
                    transition: 'height 100ms linear, background 800ms ease',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Scroll hint */}
          <div
            className="absolute bottom-5 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10"
            style={{ opacity: scrollProgress < 0.04 ? 1 : 0, transition: 'opacity 600ms ease' }}
          >
            <span className="text-[8px] font-semibold tracking-[0.25em] uppercase" style={{ color: 'rgba(201,169,110,0.3)' }}>
              Scroll to explore
            </span>
            <div style={{ width: 1, height: 28, background: 'linear-gradient(to bottom, rgba(201,169,110,0.45), transparent)', animation: 'pulse 2.5s ease-in-out infinite' }} />
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
    </section>
  );
}

interface StepData {
  number: string;
  title: string;
  subtitle: string;
  description: string;
  detail: string;
  image: string;
  alt: string;
  accent: string;
  tag: string;
}

function MobileStepCard({ step, index }: { step: StepData; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.12 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="rounded-xl overflow-hidden"
      style={{
        background: '#0C0C14',
        border: `1px solid ${step.accent}18`,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0px)' : 'translateY(28px)',
        transition: `opacity 800ms cubic-bezier(0.16,1,0.3,1) ${index * 80}ms, transform 800ms cubic-bezier(0.16,1,0.3,1) ${index * 80}ms`,
      }}
    >
      <div className="relative overflow-hidden" style={{ height: 230 }}>
        <AppImage
          src={step.image} alt={step.alt} fill className="object-cover" sizes="100vw"
          style={{
            transform: visible ? 'scale(1.03)' : 'scale(1.1)',
            transition: 'transform 1600ms cubic-bezier(0.16,1,0.3,1)',
            filter: 'saturate(0.85)',
          }}
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, #0C0C14 0%, rgba(12,12,20,0.2) 55%, transparent 100%)' }} />
        <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse 60% 50% at 70% 30%, ${step.accent}15, transparent 60%)`, mixBlendMode: 'screen' }} />
        <div className="absolute top-4 left-4">
          <span className="text-[8px] font-bold tracking-[0.25em] uppercase px-2.5 py-1 rounded-full" style={{ background: 'rgba(6,6,12,0.7)', color: step.accent, border: `1px solid ${step.accent}30`, backdropFilter: 'blur(8px)' }}>
            {step.number} / 0{steps.length}
          </span>
        </div>
        <div className="absolute bottom-3 right-4 font-black leading-none select-none" style={{ fontSize: 72, color: step.accent, opacity: 0.1, letterSpacing: '-0.04em' }}>
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
        <h3 className="font-black tracking-tighter leading-none mb-3" style={{ fontSize: 28, color: '#F0EDE8', letterSpacing: '-0.025em' }}>
          {step.title}
        </h3>
        <p className="leading-[1.8] font-light mb-4" style={{ fontSize: 13, color: 'rgba(237,233,227,0.5)' }}>
          {step.description}
        </p>
        <div className="flex items-center gap-2 px-3 py-2 rounded-full w-fit" style={{ background: `${step.accent}0A`, border: `1px solid ${step.accent}20` }}>
          <span className="w-1 h-1 rounded-full" style={{ background: step.accent }} />
          <span className="text-[11px] font-medium" style={{ color: step.accent }}>{step.detail}</span>
        </div>
        <div className="mt-5 h-px" style={{ background: `linear-gradient(90deg, ${step.accent}25, transparent)` }} />
      </div>
    </div>
  );
}
