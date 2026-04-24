'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';

/* ─────────────── data ─────────────── */

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

const revealPhrases = [
  { word: 'There', type: 'plain' },
  { word: 'is', type: 'plain' },
  { word: 'a', type: 'plain' },
  { word: 'Better', type: 'highlight' },
  { word: 'Way.', type: 'highlight' },
  { word: 'Try', type: 'plain' },
  { word: 'MotionGrace.', type: 'brand' },
];

const SHAPES = [
  { size: 90,  x: 12,  y: 20, rotX: 25,  rotY: 40,  speed: 18, depth: 'far',  opacity: 0.12, color: 0 },
  { size: 60,  x: 80,  y: 15, rotX: -15, rotY: 55,  speed: 22, depth: 'far',  opacity: 0.10, color: 1 },
  { size: 110, x: 70,  y: 60, rotX: 35,  rotY: -20, speed: 26, depth: 'mid',  opacity: 0.15, color: 2 },
  { size: 45,  x: 25,  y: 72, rotX: -40, rotY: 30,  speed: 20, depth: 'mid',  opacity: 0.13, color: 0 },
  { size: 75,  x: 50,  y: 40, rotX: 20,  rotY: -50, speed: 30, depth: 'near', opacity: 0.18, color: 1 },
  { size: 55,  x: 88,  y: 78, rotX: -25, rotY: 15,  speed: 16, depth: 'near', opacity: 0.14, color: 2 },
  { size: 38,  x: 6,   y: 50, rotX: 50,  rotY: -35, speed: 24, depth: 'far',  opacity: 0.09, color: 0 },
  { size: 82,  x: 42,  y: 85, rotX: -10, rotY: 60,  speed: 19, depth: 'mid',  opacity: 0.12, color: 1 },
  { size: 48,  x: 62,  y: 30, rotX: 30,  rotY: -45, speed: 28, depth: 'near', opacity: 0.16, color: 2 },
  { size: 66,  x: 18,  y: 88, rotX: -35, rotY: 25,  speed: 21, depth: 'far',  opacity: 0.11, color: 0 },
  { size: 94,  x: 90,  y: 45, rotX: 15,  rotY: -65, speed: 17, depth: 'mid',  opacity: 0.13, color: 1 },
  { size: 52,  x: 35,  y: 10, rotX: -20, rotY: 45,  speed: 23, depth: 'near', opacity: 0.17, color: 2 },
];

const ACCENTS = ['#C9A96E', '#8B7FD4', '#4A9EFF'];

export default function ProblemSection() {
  const screen1Ref   = useRef<HTMLElement>(null);
  const screen2Ref   = useRef<HTMLElement>(null);
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const mouseRef     = useRef({ x: 0.5, y: 0.5 });
  const rafRef       = useRef<number>(0);

  const [visibleLines, setVisibleLines]   = useState<boolean[]>(new Array(problemWords.length).fill(false));
  const [distortLevel, setDistortLevel]   = useState(0);
  const [wordProgress, setWordProgress]   = useState(0);
  const [glowPulse, setGlowPulse]         = useState(false);
  const [arrowFill, setArrowFill]         = useState(0);
  const [arrowDone, setArrowDone]         = useState(false);
  const [transitionOut, setTransitionOut] = useState(false);

  const glowTriggered  = useRef(false);
  const arrowDoneRef   = useRef(false);
  const transitionDone = useRef(false);

  /* mouse */
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight };
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  /* canvas */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = 0, h = 0;
    const resize = () => {
      w = canvas.width  = canvas.offsetWidth;
      h = canvas.height = canvas.offsetHeight;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const drawCube = (cx: number, cy: number, size: number, rotX: number, rotY: number, opacity: number, accent: string) => {
      const s = size / 2;
      const rxi = rotX * Math.PI / 180;
      const ryi = rotY * Math.PI / 180;
      const cos = Math.cos, sin = Math.sin;

      const project = (px: number, py: number, pz: number): [number, number] => {
        const x1 = px * cos(ryi) + pz * sin(ryi);
        const z1 = -px * sin(ryi) + pz * cos(ryi);
        const y2 = py * cos(rxi) - z1 * sin(rxi);
        const z2 = py * sin(rxi) + z1 * cos(rxi);
        const fov = 500;
        const sc = fov / (fov + z2 + 200);
        return [cx + x1 * sc, cy + y2 * sc];
      };

      const v: [number,number,number][] = [
        [-s,-s,-s],[s,-s,-s],[s,s,-s],[-s,s,-s],
        [-s,-s, s],[s,-s, s],[s,s, s],[-s,s, s],
      ];
      const faces = [[0,1,2,3],[4,5,6,7],[0,1,5,4],[2,3,7,6],[0,3,7,4],[1,2,6,5]];
      const brightness = [0.55, 1.0, 0.65, 0.45, 0.75, 0.38];

      faces.forEach((face, fi) => {
        const pts = face.map(vi => project(...v[vi]));
        ctx.beginPath();
        ctx.moveTo(pts[0][0], pts[0][1]);
        for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
        ctx.closePath();

        const a0 = Math.round(opacity * brightness[fi] * 0.55 * 255).toString(16).padStart(2,'0');
        const a1 = Math.round(opacity * brightness[fi] * 0.12 * 255).toString(16).padStart(2,'0');
        const grd = ctx.createLinearGradient(pts[0][0], pts[0][1], pts[2][0], pts[2][1]);
        grd.addColorStop(0, `${accent}${a0}`);
        grd.addColorStop(1, `${accent}${a1}`);
        ctx.fillStyle = grd;
        ctx.fill();

        const as = Math.round(opacity * 0.5 * 255).toString(16).padStart(2,'0');
        ctx.strokeStyle = `${accent}${as}`;
        ctx.lineWidth = 0.7;
        ctx.stroke();
      });
    };

    const animate = (ts: number) => {
      ctx.clearRect(0, 0, w, h);
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      SHAPES.forEach((shape, i) => {
        const t  = ts / 1000;
        const dFar  = shape.depth === 'far';
        const dMid  = shape.depth === 'mid';
        const mx2 = dFar ? 8 : dMid ? 20 : 40;
        const my2 = dFar ? 6 : dMid ? 15 : 30;
        const px = (shape.x / 100) * w + Math.sin(t / shape.speed + i) * 30 + (mx - 0.5) * mx2;
        const py = (shape.y / 100) * h + Math.cos(t / shape.speed + i * 1.3) * 20 + (my - 0.5) * my2;
        const rotX = shape.rotX + Math.sin(t / (shape.speed * 0.8) + i) * 15 + (my - 0.5) * 25;
        const rotY = shape.rotY + Math.cos(t / (shape.speed * 0.9) + i * 0.7) * 20 + (mx - 0.5) * 30;
        drawCube(px, py, shape.size, rotX, rotY, shape.opacity, ACCENTS[shape.color]);
      });

      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, []);

  /* scroll */
  const handleScroll = useCallback(() => {
    if (screen1Ref.current) {
      const rect = screen1Ref.current.getBoundingClientRect();
      const vh   = window.innerHeight;
      const prog = Math.max(0, Math.min(1, 1 - rect.top / vh));
      setVisibleLines(problemWords.map((_, i) => prog > (i / problemWords.length) * 0.7));
      setDistortLevel(Math.min(prog * 1.5, 1));
    }

    if (screen2Ref.current) {
      const rect  = screen2Ref.current.getBoundingClientRect();
      const vh    = window.innerHeight;
      const total = screen2Ref.current.offsetHeight - vh;
      const scrolled = -rect.top;
      const raw = Math.max(0, Math.min(1, total > 0 ? scrolled / total : 0));

      const wp = Math.max(0, Math.min(1, raw * 2));
      setWordProgress(wp);

      if (wp > 0.92 && !glowTriggered.current) {
        glowTriggered.current = true;
        setTimeout(() => setGlowPulse(true), 400);
      }

      const arrowRaw = Math.max(0, Math.min(1, (raw - 0.5) * 2));
      setArrowFill(arrowRaw);

      if (arrowRaw >= 0.99 && !arrowDoneRef.current) {
        arrowDoneRef.current = true;
        setArrowDone(true);
        setTimeout(() => {
          if (transitionDone.current) return;
          transitionDone.current = true;
          setTransitionOut(true);
        }, 800);
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
      {/* ═══ SCREEN 1 ═══ */}
      <section
        ref={screen1Ref}
        className="relative overflow-hidden flex flex-col justify-center px-6 sm:px-10"
        style={{ minHeight: '100vh', background: 'linear-gradient(to bottom, #04040A 0%, #080810 50%, #0A0508 100%)' }}
      >
        <div className="absolute inset-0 pointer-events-none" style={{
          opacity: 0.04 + distortLevel * 0.03,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '150px 150px',
          animation: 'noise-shift 0.5s steps(3) infinite',
        }} />

        <div className="relative z-10 w-full py-20" style={{ maxWidth: '96vw', margin: '0 auto' }}>
          <div className="mb-8 flex items-center gap-3" style={{
            opacity: distortLevel > 0.1 ? 1 : 0,
            transform: `translateY(${distortLevel > 0.1 ? 0 : 16}px)`,
            transition: 'all 0.8s cubic-bezier(0.16,1,0.3,1)',
          }}>
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#ff6b6b', boxShadow: '0 0 8px rgba(255,80,80,0.8)', animation: 'flicker-dot 1.8s ease-in-out infinite' }} />
            <span className="text-[10px] tracking-[0.3em] uppercase" style={{ color: 'rgba(255,107,107,0.6)' }}>The Reality Check</span>
          </div>

          <div className="mb-12" style={{ lineHeight: 1.05 }}>
            {problemWords.map((word, i) => (
              <span key={i} style={{
                fontSize: 'clamp(2.8rem, 7.2vw, 7rem)', fontWeight: word.accent ? 800 : 300,
                letterSpacing: '-0.03em', color: word.accent ? '#ff6b6b' : 'rgba(237,233,227,0.88)',
                transform: visibleLines[i] ? 'translateY(0)' : 'translateY(110%)',
                opacity: visibleLines[i] ? 1 : 0,
                transition: `transform 0.7s cubic-bezier(0.16,1,0.3,1) ${i * 0.06}s, opacity 0.5s ease ${i * 0.06}s`,
                display: 'inline-block', textShadow: word.accent ? '0 0 40px rgba(255,80,80,0.4)' : 'none',
                filter: word.accent && distortLevel > 0.6 ? 'drop-shadow(0 0 8px rgba(255,80,80,0.55))' : 'none',
                animation: word.accent && distortLevel > 0.7 ? 'glitch-text 3s ease-in-out infinite' : 'none',
                marginRight: '0.25em',
              }}>{word.text}</span>
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3" style={{
            opacity: distortLevel > 0.4 ? 1 : 0,
            transform: `translateY(${distortLevel > 0.4 ? 0 : 24}px)`,
            transition: 'all 1s cubic-bezier(0.16,1,0.3,1) 0.2s',
          }}>
            {painPoints.map((point, i) => (
              <div key={i} className="rounded-xl p-5 relative overflow-hidden" style={{
                background: 'rgba(255,80,80,0.03)', border: '1px solid rgba(255,80,80,0.1)',
                animation: `pain-flicker ${2 + i * 0.7}s ease-in-out infinite, widget-float ${6 + i * 1.1}s ease-in-out infinite`,
                animationDelay: `${i * 0.4}s, ${i * 0.7}s`, boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              }}>
                <div className="text-[9px] tracking-widest uppercase mb-2" style={{ color: 'rgba(237,233,227,0.3)' }}>{point.label}</div>
                <div className="text-2xl font-bold" style={{ color: point.color, textShadow: `0 0 20px ${point.color}60`, animation: 'value-flicker 2.5s ease-in-out infinite', animationDelay: `${i * 0.3}s` }}>{point.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SCREEN 2 — extended 3× scroll height ═══ */}
      <section ref={screen2Ref} className="relative" style={{ height: '340vh', background: 'transparent' }}>
        <div
          className="sticky top-0 overflow-hidden"
          style={{
            height: '100vh',
            background: 'linear-gradient(to bottom, #060408 0%, #080810 60%, #06060E 100%)',
            opacity: transitionOut ? 0 : 1,
            transition: 'opacity 1.1s cubic-bezier(0.4,0,0.2,1)',
          }}
        >
          {/* 3D canvas */}
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.9 }} />

          {/* Ambient radial */}
          <div className="absolute inset-0 pointer-events-none" style={{
            background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(201,169,110,0.04) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }} />

          {/* Center text zone */}
          <div className="relative z-10 h-full flex flex-col items-center justify-center px-6">

            {/* Bloom */}
            <div className="absolute pointer-events-none" style={{
              width: '60vw', height: '50vh',
              background: `radial-gradient(ellipse 80% 70% at 50% 50%, rgba(201,169,110,${glowPulse ? 0.12 : 0.02}) 0%, transparent 70%)`,
              transition: 'all 1.4s ease', filter: 'blur(50px)',
              animation: glowPulse ? 'reveal-glow-pulse 3.5s ease-in-out infinite 0.8s' : 'none',
            }} />

            {/* Word reveal */}
            <div className="flex flex-wrap justify-center items-baseline text-center" style={{ perspective: '900px', perspectiveOrigin: '50% 50%', gap: '0.1em 0.32em' }}>
              {revealPhrases.map((seg, i) => {
                {revealPhrases.map((seg, i) => {
  const n = revealPhrases.length;

  // smoother distribution
  const start = (i / n) * 0.75;
  const end = start + 0.28;

  // raw progress
  let raw = (wordProgress - start) / (end - start);

  // clamp (important for reverse scroll)
  raw = Math.max(0, Math.min(1, raw));

  // 🔥 premium easing (this is the key)
  const easeOutExpo = (t: number) =>
    t === 1 ? 1 : 1 - Math.pow(2, -10 * t);

  const localP = easeOutExpo(raw);

  const isH = seg.type === 'highlight';
  const isB = seg.type === 'brand';

  return (
    <span key={i} className="inline-block overflow-visible" style={{ verticalAlign: 'baseline' }}>
      <span
        style={{
          display: 'inline-block',

          fontSize: 'clamp(2.2rem, 6vw, 5rem)',
          fontWeight: isB ? 900 : isH ? 800 : 300,
          letterSpacing: isB ? '-0.03em' : isH ? '-0.025em' : '-0.01em',
          lineHeight: 1.15,

          // 🔥 PREMIUM MOTION
          opacity: localP,

          transform: `
            translateY(${(1 - localP) * 90}%)
            rotateX(${(1 - localP) * -55}deg)
            scale(${0.82 + localP * 0.18})
          `,

          filter: `
            blur(${(1 - localP) * 18}px)
            brightness(${0.75 + localP * 0.25})
          `,

          // ❗ VERY IMPORTANT (scroll controls animation)
          transition: 'none',

          willChange: 'transform, opacity, filter',

          // 🎨 COLOR LOGIC
          color: isB
            ? 'transparent'
            : isH
            ? `rgba(237,233,227,${0.6 + localP * 0.4})`
            : `rgba(237,233,227,${0.3 + localP * 0.4})`,

          background: isB
            ? 'linear-gradient(135deg, #B8935A 0%, #F2E09E 42%, #D6BA7C 68%, #C9A96E 100%)'
            : 'none',

          WebkitBackgroundClip: isB ? 'text' : 'unset',
          backgroundClip: isB ? 'text' : 'unset',

          // ✨ subtle glow ramp (feels expensive)
          textShadow:
            localP > 0.85
              ? '0 0 40px rgba(237,233,227,0.12)'
              : 'none',
        }}
      >
        {seg.word}
      </span>
    </span>
  );
})}

            {/* Underline */}
            <div className="flex justify-center mt-8">
              <div style={{ height: '1px', width: '320px', overflow: 'hidden', opacity: wordProgress > 0.9 ? 1 : 0, transition: 'opacity 0.6s ease 0.3s' }}>
                <div style={{
                  height: '1px', width: wordProgress > 0.9 ? '100%' : '0%',
                  background: 'linear-gradient(90deg, transparent 0%, rgba(201,169,110,0.3) 20%, rgba(201,169,110,0.6) 50%, rgba(201,169,110,0.3) 80%, transparent 100%)',
                  transition: 'width 1.4s cubic-bezier(0.16,1,0.3,1) 0.2s',
                }} />
              </div>
            </div>

            {/* Keep scrolling hint */}
            <div style={{
              position: 'absolute', bottom: '130px', left: '50%', transform: 'translateX(-50%)',
              opacity: wordProgress > 0.85 && arrowFill < 0.08 ? 1 : 0, transition: 'opacity 0.8s ease', textAlign: 'center',
            }}>
              <span className="text-[9px] tracking-[0.28em] uppercase" style={{ color: 'rgba(201,169,110,0.4)' }}>Keep scrolling</span>
            </div>
          </div>

          {/* ── Scroll Progress Arrow — futuristic pill ── */}
          <div style={{
            position: 'absolute', bottom: '36px', left: '50%', transform: 'translateX(-50%)',
            opacity: arrowDone ? 0 : wordProgress > 0.7 ? 1 : 0,
            transition: arrowDone ? 'opacity 0.6s ease' : 'opacity 1s ease',
            pointerEvents: 'none', zIndex: 20,
          }}>
            <svg width="44" height="68" viewBox="0 0 44 68" fill="none" xmlns="http://www.w3.org/2000/svg"
              style={{ filter: arrowFill > 0.95 ? 'drop-shadow(0 0 12px rgba(201,169,110,0.7))' : 'drop-shadow(0 0 4px rgba(201,169,110,0.2))' }}
            >
              <defs>
                <linearGradient id="arrowGrad" x1="0" y1="0" x2="0" y2="68" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#C9A96E" stopOpacity="0.9"/>
                  <stop offset="100%" stopColor="#F2E09E" stopOpacity="0.5"/>
                </linearGradient>
                <clipPath id="pillClip">
                  <rect x="0" y="0" width="44" height="68" rx="22"/>
                </clipPath>
              </defs>

              {/* Outer border — always visible, ultra thin */}
              <rect x="0.75" y="0.75" width="42.5" height="66.5" rx="21.25"
                stroke="rgba(201,169,110,0.15)" strokeWidth="0.75" fill="none" />

              {/* Progress stroke — draws around the pill */}
              <rect x="0.75" y="0.75" width="42.5" height="66.5" rx="21.25"
                stroke="url(#arrowGrad)"
                strokeWidth="1.2"
                fill="none"
                strokeDasharray="218"
                strokeDashoffset={218 - arrowFill * 218}
                strokeLinecap="round"
                style={{
                  transformOrigin: '22px 34px',
                  transform: 'rotate(-90deg)',
                  transformBox: 'fill-box',
                  transition: 'stroke-dashoffset 0.06s linear',
                }}
              />

              {/* Scanline sweep — fills upward as progress increases */}
              <rect
                x="1" y={68 - arrowFill * 68} width="42" height={arrowFill * 68}
                fill={`rgba(201,169,110,${arrowFill * 0.06})`}
                rx="0"
                clipPath="url(#pillClip)"
                style={{ transition: 'y 0.06s linear, height 0.06s linear' }}
              />

              {/* Corner tick marks — top left */}
              <line x1="1" y1="12" x2="1" y2="4" stroke="rgba(201,169,110,0.5)" strokeWidth="1" strokeLinecap="round"/>
              <line x1="1" y1="4" x2="9" y2="4" stroke="rgba(201,169,110,0.5)" strokeWidth="1" strokeLinecap="round"/>
              {/* top right */}
              <line x1="43" y1="12" x2="43" y2="4" stroke="rgba(201,169,110,0.5)" strokeWidth="1" strokeLinecap="round"/>
              <line x1="43" y1="4" x2="35" y2="4" stroke="rgba(201,169,110,0.5)" strokeWidth="1" strokeLinecap="round"/>
              {/* bottom left */}
              <line x1="1" y1="56" x2="1" y2="64" stroke="rgba(201,169,110,0.5)" strokeWidth="1" strokeLinecap="round"/>
              <line x1="1" y1="64" x2="9" y2="64" stroke="rgba(201,169,110,0.5)" strokeWidth="1" strokeLinecap="round"/>
              {/* bottom right */}
              <line x1="43" y1="56" x2="43" y2="64" stroke="rgba(201,169,110,0.5)" strokeWidth="1" strokeLinecap="round"/>
              <line x1="43" y1="64" x2="35" y2="64" stroke="rgba(201,169,110,0.5)" strokeWidth="1" strokeLinecap="round"/>

              {/* Chevron — brighter as progress grows */}
              <path
                d="M22 26 L22 44 M14 37 L22 45 L30 37"
                stroke={`rgba(201,169,110,${0.3 + arrowFill * 0.7})`}
                strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"
                style={{ transition: 'stroke 0.3s ease' }}
              />
            </svg>
          </div>

          {/* Vignette edges */}
          <div className="absolute inset-0 pointer-events-none" style={{
            background: 'radial-gradient(ellipse 100% 100% at 50% 50%, transparent 40%, rgba(4,4,10,0.7) 100%)',
          }} />
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
          50% { opacity: 0.45; }
        }
      `}</style>
    </>
  );
}
