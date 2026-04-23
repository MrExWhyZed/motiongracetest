'use client';

import React, { useEffect, useRef, useState } from 'react';

/* ─── Deterministic particles (SSR-safe) ─────────────────────────────────── */
const particles = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  left: `${(i * 7.1 + 5) % 100}%`,
  top: `${(i * 8.7 + 8) % 88}%`,
  size: i % 3 === 0 ? 2.5 : i % 3 === 1 ? 1.5 : 1,
  delay: i * 0.55,
  duration: 7 + (i % 5) * 1.5,
  color:
    i % 3 === 0
      ? 'rgba(201,169,110,0.55)'
      : i % 3 === 1
      ? 'rgba(74,158,255,0.4)'
      : 'rgba(237,233,227,0.18)',
  glow:
    i % 3 === 0
      ? '0 0 6px rgba(201,169,110,0.7)'
      : i % 3 === 1
      ? '0 0 5px rgba(74,158,255,0.5)'
      : 'none',
}));

/* ─── Cycling taglines ───────────────────────────────────────────────────── */
const taglines = [
  { white: 'Cinematic CGI.', gold: 'Infinite Possibilities.' },
  { white: 'Your Product.', gold: 'Elevated Forever.' },
  { white: 'Beyond Reality.', gold: 'Endlessly Reimagined.' },
  { white: 'Luxury Visuals.', gold: 'Zero Limits.' },
];

/* Timings */
const VISIBLE_MS  = 2800; // how long tagline stays fully visible
const FADE_MS     = 700;  // fade-in / fade-out duration (must match CSS)

type TaglineState = 'entering' | 'visible' | 'leaving';

export default function HeroSection() {
  const heroRef    = useRef<HTMLElement>(null);
  const bgRef      = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const veilRef    = useRef<HTMLDivElement>(null);

  /* Preloader state */
  const [preloaderPhase, setPreloaderPhase] = useState<
    'wait' | 'loading' | 'fadeout' | 'done'
  >('wait');
  const [typeText,     setTypeText]     = useState('');
  const [heroVisible,  setHeroVisible]  = useState(false);

  /* Cycling headline state */
  const [taglineIndex, setTaglineIndex] = useState(0);
  const [taglineState, setTaglineState] = useState<TaglineState>('entering');

  /* ── Typewriter engine ───────────────────────────────────────────────── */
  useEffect(() => {
    const waitStr = 'Please Wait.....';
    const loadStr = 'MotionGrace Is Loading..';
    let timeout: ReturnType<typeof setTimeout>;

    let i = 0;
    const typeWait = () => {
      if (i <= waitStr.length) {
        setTypeText(waitStr.slice(0, i));
        i++;
        timeout = setTimeout(typeWait, 68);
      } else {
        timeout = setTimeout(() => {
          setPreloaderPhase('loading');
          let j = 0;
          setTypeText('');

          const typeLoad = () => {
            if (j <= loadStr.length) {
              setTypeText(loadStr.slice(0, j));
              j++;
              timeout = setTimeout(typeLoad, 48);
            } else {
              timeout = setTimeout(() => {
                setPreloaderPhase('fadeout');
                timeout = setTimeout(() => {
                  setPreloaderPhase('done');
                  setHeroVisible(true);
                }, 900);
              }, 800);
            }
          };
          typeLoad();
        }, 550);
      }
    };
    typeWait();

    return () => clearTimeout(timeout);
  }, []);

  /* ── Tagline cycling ─────────────────────────────────────────────────── */
  useEffect(() => {
    if (!heroVisible) return;

    let t: ReturnType<typeof setTimeout>;

    if (taglineState === 'entering') {
      // After fade-in completes, hold visible
      t = setTimeout(() => setTaglineState('visible'), FADE_MS);
    } else if (taglineState === 'visible') {
      // Hold, then start fade-out
      t = setTimeout(() => setTaglineState('leaving'), VISIBLE_MS);
    } else if (taglineState === 'leaving') {
      // After fade-out, advance to next tagline and reset
      t = setTimeout(() => {
        setTaglineIndex((prev) => (prev + 1) % taglines.length);
        setTaglineState('entering');
      }, FADE_MS);
    }

    return () => clearTimeout(t);
  }, [heroVisible, taglineState]);

  /* ── Scroll: parallax + content fade + golden veil ──────────────────── */
  useEffect(() => {
    if (!heroVisible) return;
    let rafId: number;
    let lastScroll = 0;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      if (Math.abs(scrollY - lastScroll) < 1) return;
      lastScroll = scrollY;

      if (bgRef.current) {
        bgRef.current.style.transform = `translateY(${scrollY * 0.28}px)`;
      }
      if (contentRef.current) {
        const progress = Math.min(scrollY / 600, 1);
        contentRef.current.style.opacity = `${1 - progress * 1.1}`;
        contentRef.current.style.transform = `translateY(${scrollY * -0.12}px)`;
      }
      if (veilRef.current) {
        const veilProgress = Math.min(scrollY / 400, 1);
        veilRef.current.style.opacity = `${veilProgress * 0.7}`;
      }
    };

    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(handleScroll);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(rafId);
    };
  }, [heroVisible]);

  /* Tagline CSS class based on state */
  const tClass =
    taglineState === 'entering'
      ? 'tagline-entering'
      : taglineState === 'visible'
      ? 'tagline-visible'
      : 'tagline-leaving';

  const current = taglines[taglineIndex];

  return (
    <>
      {/* ════════════════════════════════════════════════════════════════
          PRELOADER
      ════════════════════════════════════════════════════════════════ */}
      {preloaderPhase !== 'done' && (
        <div
          className="preloader-root"
          style={{
            opacity: preloaderPhase === 'fadeout' ? 0 : 1,
            filter:  preloaderPhase === 'fadeout' ? 'blur(8px)' : 'none',
          }}>
          <div className="preloader-glow" />

          <div className="preloader-content">
            <p className="preloader-status">
              {preloaderPhase === 'wait' ? '● INITIALIZING' : '● LOADING ASSETS'}
            </p>

            <div className="preloader-text-wrap">
              <span
                className="preloader-text"
                style={{ textShadow: '0 0 40px rgba(201,169,110,0.6), 0 0 80px rgba(201,169,110,0.2)' }}>
                {typeText}
              </span>
              <span className="preloader-cursor">|</span>
            </div>

            <div className="preloader-line">
              <div
                className="preloader-line-fill"
                style={{ width: preloaderPhase === 'loading' ? '100%' : '45%' }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════
          HERO SECTION
      ════════════════════════════════════════════════════════════════ */}
      <section
        ref={heroRef}
        className="hero-section"
        style={{
          opacity:   heroVisible ? 1 : 0,
          transform: heroVisible ? 'scale(1)' : 'scale(0.97)',
          filter:    heroVisible ? 'blur(0px)' : 'blur(6px)',
        }}>

        {/* ── Background Video Layer ─────────────────────────────── */}
        <div ref={bgRef} className="hero-bg-layer" style={{ top: '-15%', height: '130%' }}>
          <div className="hero-video-wrap">
            <iframe
              allow="fullscreen;autoplay"
              allowFullScreen
              src="https://streamable.com/e/b3drvz?autoplay=1&muted=1&nocontrols=1"
              style={{
                border: 'none', width: '100%', height: '100%',
                position: 'absolute', left: 0, top: 0, pointerEvents: 'none',
              }}
            />
          </div>

          <div className="absolute inset-0 bg-gradient-to-b from-[#04040A]/80 via-[#04040A]/30 to-[#04040A]/95 z-10" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#04040A]/70 via-transparent to-[#04040A]/70 z-10" />
          <div className="absolute inset-0 z-10 animate-breathe" style={{ background: 'radial-gradient(ellipse 60% 35% at 50% 0%, rgba(201,169,110,0.10) 0%, transparent 60%)' }} />
          <div className="absolute inset-0 z-10" style={{ background: 'radial-gradient(ellipse 25% 70% at 0% 50%, rgba(201,169,110,0.06) 0%, transparent 60%), radial-gradient(ellipse 25% 70% at 100% 50%, rgba(74,158,255,0.05) 0%, transparent 60%)' }} />
          <div className="hero-grain z-20" />
          <div ref={veilRef} className="hero-golden-veil z-20" />
        </div>

        {/* ── Particles ─────────────────────────────────────────── */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
          {particles.map((p) => (
            <div
              key={p.id}
              className="absolute rounded-full will-change-transform"
              style={{
                left: p.left, top: p.top,
                width: `${p.size}px`, height: `${p.size}px`,
                background: p.color, boxShadow: p.glow,
                animation: `hero-float-particle ${p.duration}s ease-in-out infinite`,
                animationDelay: `${p.delay}s`,
              }}
            />
          ))}
        </div>

        {/* ── Decorative Rings ──────────────────────────────────── */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10">
          <div
            className="w-[700px] h-[700px] sm:w-[1000px] sm:h-[1000px] rounded-full border border-primary/[0.05] animate-rotate-slow"
            style={{ borderStyle: 'dashed' }}
          />
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[460px] h-[460px] sm:w-[700px] sm:h-[700px] rounded-full border border-accent/[0.04]"
            style={{ animation: 'rotate-slow 48s linear infinite reverse' }}
          />
        </div>

        {/* ── Left Widget ───────────────────────────────────────── */}
        <div
          className="hero-widget hero-widget-left"
          style={{
            opacity: heroVisible ? 1 : 0,
            transform: heroVisible ? 'translateX(0) translateY(-50%)' : 'translateX(-40px) translateY(-50%)',
            transition: 'opacity 0.9s cubic-bezier(0.16,1,0.3,1) 1.2s, transform 0.9s cubic-bezier(0.16,1,0.3,1) 1.2s',
          }}>
          <div className="glass-dark rounded-2xl p-5 flex items-center gap-3.5" style={{ animation: 'float-gentle 8s ease-in-out infinite' }}>
            <div className="w-10 h-10 rounded-xl bg-primary/[0.1] flex items-center justify-center flex-shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground font-medium tracking-wide mb-0.5">Renders Delivered</p>
              <p className="text-lg font-bold text-foreground tracking-tight">12,400+</p>
            </div>
          </div>
        </div>

        {/* ── Right Widgets ─────────────────────────────────────── */}
        <div
          className="hero-widget hero-widget-right"
          style={{
            opacity: heroVisible ? 1 : 0,
            transform: heroVisible ? 'translateX(0) translateY(-50%)' : 'translateX(40px) translateY(-50%)',
            transition: 'opacity 0.9s cubic-bezier(0.16,1,0.3,1) 1.4s, transform 0.9s cubic-bezier(0.16,1,0.3,1) 1.4s',
          }}>
          <div className="glass-dark rounded-2xl p-5 flex-shrink-0" style={{ animation: 'float-gentle-reverse 9s ease-in-out infinite' }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1.5 h-1.5 rounded-full bg-accent animate-breathe" />
              <span className="text-[10px] text-muted-foreground font-medium tracking-wide">Live Render</span>
              <span className="ml-auto text-[10px] text-accent font-mono">98%</span>
            </div>
            <div className="flex items-end gap-1 h-10">
              {[40, 65, 55, 80, 70, 90, 75, 95].map((h, i) => (
                <div key={i} className="w-2 rounded-sm" style={{ height: `${h}%`, background: i === 7 ? 'var(--accent)' : i >= 5 ? 'rgba(74,158,255,0.45)' : 'rgba(201,169,110,0.25)' }} />
              ))}
            </div>
          </div>

          <div className="glass-dark rounded-2xl p-5 flex items-center gap-3.5 flex-shrink-0" style={{ animation: 'float-gentle 8s ease-in-out infinite', animationDelay: '2.4s' }}>
            <div className="w-10 h-10 rounded-xl bg-secondary/[0.1] flex items-center justify-center flex-shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="var(--secondary)" strokeWidth="1.5" />
                <path d="M12 6v6l4 2" stroke="var(--secondary)" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground font-medium tracking-wide mb-0.5">Avg. Turnaround</p>
              <p className="text-lg font-bold text-foreground tracking-tight">5 Days</p>
            </div>
          </div>
        </div>

        {/* ── Hero Content ──────────────────────────────────────── */}
        <div
          ref={contentRef}
          className="relative z-20 max-w-5xl mx-auto px-6 sm:px-10 pt-32 pb-24 flex flex-col items-center text-center will-change-transform">

          {/* ── Cycling Headline ──────────────────────────────── */}
          <div className="headline-stage mb-12">
            <h1 key={taglineIndex} className={`headline-tagline ${tClass}`}>
              <span className="block text-foreground">{current.white}</span>
              <span className="block text-gradient-gold">{current.gold}</span>
            </h1>
          </div>

          {/* ── Tagline dots indicator ────────────────────────── */}
          <div
            className="flex items-center gap-2 mb-14"
            style={{
              opacity: heroVisible ? 1 : 0,
              transition: 'opacity 0.8s ease 1.4s',
            }}>
            {taglines.map((_, i) => (
              <div
                key={i}
                className="tagline-dot"
                style={{
                  background: i === taglineIndex ? 'var(--primary)' : 'rgba(201,169,110,0.2)',
                  boxShadow: i === taglineIndex ? '0 0 8px rgba(201,169,110,0.6)' : 'none',
                  transform: i === taglineIndex ? 'scale(1.4)' : 'scale(1)',
                }}
              />
            ))}
          </div>

          {/* ── Single CTA Button ────────────────────────────── */}
          <div
            style={{
              opacity: heroVisible ? 1 : 0,
              transform: heroVisible ? 'translateY(0)' : 'translateY(16px)',
              transition: 'opacity 0.9s cubic-bezier(0.16,1,0.3,1) 1.1s, transform 0.9s cubic-bezier(0.16,1,0.3,1) 1.1s',
            }}>
            <button
              onClick={() => document.querySelector('#cta')?.scrollIntoView({ behavior: 'smooth' })}
              className="get-started-btn group">
              {/* Outer glow ring */}
              <span className="btn-ring" />
              {/* Inner shimmer layer */}
              <span className="btn-shimmer" />
              {/* Label */}
              <span className="btn-label">
                <span className="btn-arrow">→</span>
                Get Started
              </span>
            </button>
          </div>

          {/* ── Scroll indicator ─────────────────────────────── */}
          <div
            className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
            style={{ opacity: heroVisible ? 0.4 : 0, transition: 'opacity 1s ease 1.6s' }}>
            <span className="text-[9px] tracking-[0.25em] uppercase text-muted-foreground">Scroll</span>
            <div className="w-px h-10 bg-gradient-to-b from-primary/60 to-transparent animate-scroll-bounce" />
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          SCOPED STYLES
      ════════════════════════════════════════════════════════════════ */}
      <style>{`
        /* ── Preloader ───────────────────────────────────────────── */
        .preloader-root {
          position: fixed; inset: 0; z-index: 9999;
          background: #000;
          display: flex; align-items: center; justify-content: center;
          transition: opacity 0.9s cubic-bezier(0.4,0,0.2,1),
                      filter  0.9s cubic-bezier(0.4,0,0.2,1);
          will-change: opacity, filter;
        }
        .preloader-glow {
          position: absolute; top: 50%; left: 50%;
          transform: translate(-50%,-50%);
          width: 500px; height: 300px; border-radius: 50%;
          background: radial-gradient(ellipse at center, rgba(201,169,110,0.08) 0%, transparent 70%);
          pointer-events: none;
          animation: breathe 4s ease-in-out infinite;
        }
        .preloader-content {
          display: flex; flex-direction: column; align-items: center;
          gap: 1.5rem; position: relative; z-index: 1;
        }
        .preloader-status {
          font-size: 9px; letter-spacing: 0.25em; text-transform: uppercase;
          color: rgba(201,169,110,0.45); font-family: var(--font-sans); margin: 0;
          animation: breathe 2s ease-in-out infinite;
        }
        .preloader-text-wrap { display: flex; align-items: center; min-height: 1.2em; }
        .preloader-text {
          font-size: clamp(1.1rem, 4vw, 1.8rem); font-weight: 300;
          letter-spacing: 0.06em; color: rgba(237,233,227,0.9);
          font-family: var(--font-sans);
        }
        .preloader-cursor {
          font-size: clamp(1.1rem, 4vw, 1.8rem); font-weight: 100;
          color: rgba(201,169,110,0.9);
          animation: preloader-blink 0.8s step-end infinite;
          text-shadow: 0 0 12px rgba(201,169,110,0.8);
          line-height: 1; margin-left: 1px;
        }
        @keyframes preloader-blink { 0%,100%{opacity:1} 50%{opacity:0} }
        .preloader-line {
          width: 180px; height: 1px; background: rgba(255,255,255,0.06);
          border-radius: 1px; overflow: hidden;
        }
        .preloader-line-fill {
          height: 100%;
          background: linear-gradient(90deg, transparent 0%, rgba(201,169,110,0.8) 50%, rgba(201,169,110,0.4) 100%);
          transition: width 1.8s cubic-bezier(0.4,0,0.2,1); border-radius: 1px;
        }

        /* ── Hero Section ────────────────────────────────────────── */
        .hero-section {
          position: relative; min-height: 100svh;
          display: flex; align-items: center; justify-content: center;
          overflow: hidden;
          transition: opacity 1.0s cubic-bezier(0.16,1,0.3,1) 0.1s,
                      transform 1.0s cubic-bezier(0.16,1,0.3,1) 0.1s,
                      filter  1.0s cubic-bezier(0.16,1,0.3,1) 0.1s;
          will-change: opacity, transform, filter;
        }
        .hero-bg-layer { position: absolute; left: 0; right: 0; bottom: 0; will-change: transform; }
        .hero-video-wrap {
          position: relative; width: 100%; height: 0; padding-bottom: 56.25%;
          transform: scale(1.8); transform-origin: center center;
        }
        .hero-grain {
          position: absolute; inset: 0; pointer-events: none; opacity: 0.032;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='grain'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23grain)'/%3E%3C/svg%3E");
          background-size: 200px 200px;
          animation: grain-drift 8s steps(10) infinite;
        }
        @keyframes grain-drift {
          0%  {background-position:0 0}     10% {background-position:-5px -10px}
          20% {background-position:-15px 5px} 30% {background-position:7px -25px}
          40% {background-position:-5px 25px} 50% {background-position:-15px 10px}
          60% {background-position:15px 0}   70% {background-position:0 15px}
          80% {background-position:3px 35px} 90% {background-position:-10px 10px}
          100%{background-position:0 0}
        }
        .hero-golden-veil {
          position: absolute; inset: 0; pointer-events: none;
          background: linear-gradient(to top, rgba(201,169,110,0.22) 0%, rgba(201,169,110,0.07) 30%, transparent 65%);
          opacity: 0; will-change: opacity;
        }

        /* ── Floating Widgets ────────────────────────────────────── */
        .hero-widget { position: absolute; top: 50%; z-index: 20; pointer-events: none; will-change: opacity, transform; }
        .hero-widget-left { left: 1.5rem; }
        @media (min-width:1280px) { .hero-widget-left { left: 3rem; } }
        .hero-widget-right { right: 1.5rem; display: flex; flex-direction: column; gap: 1rem; }
        @media (min-width:1280px) { .hero-widget-right { right: 3rem; } }
        @media (max-width:1023px) { .hero-widget-left, .hero-widget-right { display: none !important; } }

        /* ── Particles ───────────────────────────────────────────── */
        @keyframes hero-float-particle {
          0%,100% { transform: translateY(0) translateX(0);     opacity: 0.6; }
          25%     { transform: translateY(-12px) translateX(4px);  opacity: 1;   }
          50%     { transform: translateY(-6px) translateX(-4px);  opacity: 0.7; }
          75%     { transform: translateY(-18px) translateX(2px);  opacity: 0.9; }
        }

        /* ══════════════════════════════════════════════════════════
           CYCLING HEADLINE
        ══════════════════════════════════════════════════════════ */
        .headline-stage {
          position: relative;
          min-height: clamp(5rem, 16vw, 10rem); /* prevents layout jump */
          display: flex; align-items: center; justify-content: center;
          width: 100%;
        }

        .headline-tagline {
          font-size: clamp(2.6rem, 8.5vw, 6.8rem);
          font-weight: 800;
          letter-spacing: -0.04em;
          line-height: 0.96;
          text-align: center;
          position: absolute;
          width: 100%;
          /* default hidden */
          opacity: 0;
          transform: translateY(12px);
          filter: blur(6px);
          will-change: opacity, transform, filter;
        }

        /* entering → fade in, move up, unblur */
        .tagline-entering {
          animation: tagline-in ${FADE_MS}ms ease-in-out forwards;
        }
        /* visible → fully shown, no animation (stays at final state of entering) */
        .tagline-visible {
          opacity: 1;
          transform: translateY(0);
          filter: blur(0px);
        }
        /* leaving → fade out, move up, blur */
        .tagline-leaving {
          animation: tagline-out ${FADE_MS}ms ease-in-out forwards;
        }

        @keyframes tagline-in {
          from { opacity: 0; transform: translateY(12px); filter: blur(6px); }
          to   { opacity: 1; transform: translateY(0);    filter: blur(0px); }
        }
        @keyframes tagline-out {
          from { opacity: 1; transform: translateY(0);     filter: blur(0px); }
          to   { opacity: 0; transform: translateY(-12px); filter: blur(6px); }
        }

        /* ── Tagline dots ─────────────────────────────────────── */
        .tagline-dot {
          width: 5px; height: 5px; border-radius: 50%;
          transition: background 0.4s ease, transform 0.4s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.4s ease;
        }

        /* ══════════════════════════════════════════════════════════
           GET STARTED BUTTON
        ══════════════════════════════════════════════════════════ */
        .get-started-btn {
          position: relative;
          display: inline-flex; align-items: center; justify-content: center;
          padding: 0;
          background: transparent;
          border: none; cursor: pointer;
          outline: none;
        }

        /* Outer glow ring — pulses */
        .btn-ring {
          position: absolute; inset: -6px;
          border-radius: 9999px;
          border: 1px solid rgba(201,169,110,0.25);
          animation: btn-ring-pulse 3s ease-in-out infinite;
          pointer-events: none;
        }
        @keyframes btn-ring-pulse {
          0%,100% { opacity: 0.4; transform: scale(1);    box-shadow: 0 0 0 0 rgba(201,169,110,0); }
          50%      { opacity: 1;   transform: scale(1.04); box-shadow: 0 0 20px 4px rgba(201,169,110,0.15); }
        }

        /* Shimmer sweep */
        .btn-shimmer {
          position: absolute; inset: 0; border-radius: 9999px; overflow: hidden;
          opacity: 0;
          transition: opacity 0.4s ease;
          pointer-events: none;
        }
        .btn-shimmer::after {
          content: '';
          position: absolute; top: 0; left: -60%; width: 40%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent);
          transform: skewX(-15deg);
          animation: btn-sweep 2.8s ease-in-out infinite;
        }
        @keyframes btn-sweep {
          0%   { left: -60%; opacity: 0; }
          20%  { opacity: 1; }
          80%  { opacity: 1; }
          100% { left: 140%; opacity: 0; }
        }
        .get-started-btn:hover .btn-shimmer { opacity: 1; }

        /* Label pill */
        .btn-label {
          position: relative; z-index: 1;
          display: inline-flex; align-items: center; gap: 0.65rem;
          padding: 1rem 2.8rem;
          border-radius: 9999px;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #04040A;
          background: linear-gradient(135deg, #D4A85A 0%, #E8D4A0 40%, #C9A96E 70%, #B8935A 100%);
          box-shadow:
            0 0 30px rgba(201,169,110,0.35),
            0 0 60px rgba(201,169,110,0.12),
            0 4px 20px rgba(0,0,0,0.5),
            inset 0 1px 0 rgba(255,255,255,0.25);
          transition: transform 0.35s cubic-bezier(0.34,1.56,0.64,1),
                      box-shadow 0.35s ease;
        }
        .get-started-btn:hover .btn-label {
          transform: scale(1.05);
          box-shadow:
            0 0 50px rgba(201,169,110,0.5),
            0 0 90px rgba(201,169,110,0.18),
            0 6px 28px rgba(0,0,0,0.55),
            inset 0 1px 0 rgba(255,255,255,0.3);
        }

        /* Arrow nudge on hover */
        .btn-arrow {
          display: inline-block;
          transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1);
          font-size: 0.85rem;
        }
        .get-started-btn:hover .btn-arrow { transform: translateX(4px); }
      `}</style>
    </>
  );
}
