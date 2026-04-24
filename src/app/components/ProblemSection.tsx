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

/* Screen 2 — three-line reveal structure */
const revealLines = [
  {
    words: ['There', 'is', 'a'],
    type: 'plain' as const,
  },
  {
    words: ['Better', 'Way.'],
    type: 'highlight' as const,
  },
  {
    words: ['Try', 'MotionGrace.'],
    type: 'brand' as const,
  },
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

function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}
function easeInOutSine(t: number): number {
  return -(Math.cos(Math.PI * t) - 1) / 2;
}

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

  // Track previous raw scroll value to detect direction and reset state
  const glowTimerRef   = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  /* scroll — fully bidirectional, all state derived from position */
  const handleScroll = useCallback(() => {
    if (screen1Ref.current) {
      const rect = screen1Ref.current.getBoundingClientRect();
      const vh   = window.innerHeight;
      const prog = Math.max(0, Math.min(1, 1 - rect.top / vh));
      setVisibleLines(problemWords.map((_, i) => prog > (i / problemWords.length) * 0.7));
      setDistortLevel(Math.min(prog * 1.5, 1));
    }

    if (screen2Ref.current) {
      const rect     = screen2Ref.current.getBoundingClientRect();
      const vh       = window.innerHeight;
      const total    = screen2Ref.current.offsetHeight - vh;
      const scrolled = -rect.top;
      const raw      = Math.max(0, Math.min(1, total > 0 ? scrolled / total : 0));

      // word reveal: first half of scroll range
      const wp = Math.max(0, Math.min(1, raw * 2));
      setWordProgress(wp);

      // glow pulse: reactive to position, debounced on entry only
      if (wp > 0.92) {
        if (glowTimerRef.current === null) {
          glowTimerRef.current = setTimeout(() => setGlowPulse(true), 400);
        }
      } else {
        if (glowTimerRef.current !== null) {
          clearTimeout(glowTimerRef.current);
          glowTimerRef.current = null;
        }
        setGlowPulse(false);
      }

      // arrow fill: second half of scroll range
      const arrowRaw = Math.max(0, Math.min(1, (raw - 0.5) * 2));
      setArrowFill(arrowRaw);

      // transition: set on completion, reset with hysteresis on backward scroll
      if (arrowRaw >= 0.99) {
        setArrowDone(true);
        setTransitionOut(true);
      } else if (arrowRaw < 0.92) {
        setArrowDone(false);
        setTransitionOut(false);
      }
    }
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (glowTimerRef.current !== null) clearTimeout(glowTimerRef.current);
    };
  }, [handleScroll]);

  /* word-level progress per line/word */
  const TOTAL_WORDS = revealLines.reduce((s, l) => s + l.words.length, 0);
  let wordIdx = 0;
  const wordEntries: { lineIdx: number; wordIdx: number; globalIdx: number; word: string; type: 'plain' | 'highlight' | 'brand' }[] = [];
  revealLines.forEach((line, li) => {
    line.words.forEach((word, wi) => {
      wordEntries.push({ lineIdx: li, wordIdx: wi, globalIdx: wordIdx++, word, type: line.type });
    });
  });

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

      {/* ═══ SCREEN 2 — 3× scroll height ═══ */}
      <section ref={screen2Ref} className="relative" style={{ height: '340vh', background: 'transparent' }}>
        <div
          className="sticky top-0 overflow-hidden"
          style={{
            height: '100vh',
            background: '#050508',
            opacity: transitionOut ? 0 : 1,
            transition: 'opacity 1.1s cubic-bezier(0.4,0,0.2,1)',
          }}
        >
          {/* 3D canvas */}
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.6 }} />

          {/* Deep vignette */}
          <div className="absolute inset-0 pointer-events-none" style={{
            background: 'radial-gradient(ellipse 90% 80% at 50% 50%, transparent 20%, rgba(5,5,8,0.75) 100%)',
          }} />

          {/* ── Horizontal light beam — cinematic reveal ── */}
          <div
            className="absolute pointer-events-none"
            style={{
              left: 0, right: 0,
              top: '50%',
              height: '1px',
              background: `linear-gradient(90deg,
                transparent 0%,
                rgba(201,169,110,0) 15%,
                rgba(201,169,110,${wordProgress * 0.18}) 35%,
                rgba(255,240,200,${wordProgress * 0.28}) 50%,
                rgba(201,169,110,${wordProgress * 0.18}) 65%,
                rgba(201,169,110,0) 85%,
                transparent 100%
              )`,
              transform: 'translateY(-50%)',
              transition: 'none',
              filter: `blur(${wordProgress > 0.5 ? 0 : 1}px)`,
            }}
          />

          {/* Bloom behind text — soft, restrained */}
          <div className="absolute pointer-events-none" style={{
            width: '55vw', height: '45vh',
            left: '50%', top: '50%',
            transform: 'translate(-50%, -50%)',
            background: `radial-gradient(ellipse 80% 70% at 50% 50%,
              rgba(201,169,110,${glowPulse ? 0.055 : wordProgress * 0.025}) 0%,
              transparent 70%)`,
            filter: 'blur(60px)',
            transition: glowPulse ? 'background 2s ease' : 'background 0.3s ease',
            animation: glowPulse ? 'subtle-bloom 5s ease-in-out infinite' : 'none',
          }} />

          {/* ── Main text — three cinematic lines ── */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center"
            style={{ gap: 0 }}
          >
            {/* Eyebrow — fades in when reveal starts */}
            <div style={{
              marginBottom: '2.5rem',
              opacity: wordProgress > 0.1 ? wordProgress * 0.6 : 0,
              transition: 'none',
              display: 'flex', alignItems: 'center', gap: '12px',
            }}>
              <div style={{ width: '32px', height: '1px', background: 'rgba(201,169,110,0.35)' }} />
              <span style={{
                fontSize: '9px',
                letterSpacing: '0.35em',
                textTransform: 'uppercase',
                color: 'rgba(201,169,110,0.45)',
                fontWeight: 400,
              }}>The Alternative</span>
              <div style={{ width: '32px', height: '1px', background: 'rgba(201,169,110,0.35)' }} />
            </div>

            {/* Three lines */}
            {revealLines.map((line, li) => {
              const lineStart = li / revealLines.length;
              const lineEnd   = lineStart + 1 / revealLines.length;
              const lineP = Math.max(0, Math.min(1, (wordProgress - lineStart) / (lineEnd - lineStart)));
              const easedLineP = easeOutExpo(lineP);

              const isBrand     = line.type === 'brand';
              const isHighlight = line.type === 'highlight';
              const isPlain     = line.type === 'plain';

              return (
                <div
                  key={li}
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: isBrand ? '0.28em' : '0.22em',
                    marginBottom: li < revealLines.length - 1 ? '0.05em' : 0,
                    lineHeight: 1,
                  }}
                >
                  {line.words.map((word, wi) => {
                    /* stagger within the line */
                    const wordStart = (wi / line.words.length) * 0.55;
                    const wordEnd   = wordStart + 0.6;
                    const wRaw = Math.max(0, Math.min(1, (lineP - wordStart) / (wordEnd - wordStart)));
                    const wp2 = easeOutExpo(wRaw);

                    const isBrandWord = isBrand && word === 'MotionGrace.';

                    const baseSize = isBrand
                      ? 'clamp(3.2rem, 8.5vw, 8.5rem)'
                      : isHighlight
                      ? 'clamp(3.2rem, 8.5vw, 8.5rem)'
                      : 'clamp(2rem, 5.2vw, 5rem)';

                    const fw = isBrand ? 800 : isHighlight ? 700 : 300;

                    return (
                      <span
                        key={wi}
                        style={{
                          display: 'inline-block',
                          fontSize: baseSize,
                          fontWeight: fw,
                          letterSpacing: isBrand ? '-0.035em' : isHighlight ? '-0.03em' : '-0.015em',
                          lineHeight: 1.05,

                          /* motion */
                          opacity: wp2,
                          transform: `
                            translateY(${(1 - wp2) * 60}%)
                            skewY(${(1 - wp2) * -4}deg)
                          `,
                          filter: `blur(${(1 - wp2) * 12}px)`,
                          transition: 'none',
                          willChange: 'transform, opacity, filter',

                          /* color */
                          color: isBrandWord
                            ? 'transparent'
                            : isHighlight
                            ? `rgba(237,233,227,${0.55 + wp2 * 0.45})`
                            : `rgba(237,233,227,${0.22 + wp2 * 0.38})`,

                          background: isBrandWord
                            ? 'linear-gradient(118deg, #9A7040 0%, #C9A96E 22%, #F0D898 48%, #D4AA6A 72%, #B8935A 100%)'
                            : 'none',

                          WebkitBackgroundClip: isBrandWord ? 'text' : 'unset',
                          backgroundClip: isBrandWord ? 'text' : 'unset',

                          /* subtle letter-spacing on plain words so they feel airy */
                          marginRight: isPlain && wi < line.words.length - 1 ? '0.05em' : 0,
                        }}
                      >
                        {word}
                      </span>
                    );
                  })}
                </div>
              );
            })}

            {/* Ruled line — draws in after all words visible, reverses on backward scroll */}
            <div style={{
              marginTop: '3rem',
              width: '100%',
              maxWidth: '520px',
              height: '1px',
              overflow: 'hidden',
              opacity: wordProgress > 0.88 ? Math.min(1, (wordProgress - 0.88) * 8) : 0,
              transition: 'none',
            }}>
              <div style={{
                height: '1px',
                width: `${Math.min(100, Math.max(0, (wordProgress - 0.88) / 0.12 * 100))}%`,
                background: 'linear-gradient(90deg, transparent 0%, rgba(201,169,110,0.2) 20%, rgba(201,169,110,0.45) 50%, rgba(201,169,110,0.2) 80%, transparent 100%)',
                transition: 'none',
              }} />
            </div>

            {/* Subline — appears last */}
            <div style={{
              marginTop: '1.5rem',
              opacity: wordProgress > 0.94 ? (wordProgress - 0.94) * 16 : 0,
              transform: `translateY(${wordProgress > 0.94 ? 0 : 8}px)`,
              transition: 'none',
            }}>
              <span style={{
                fontSize: '11px',
                letterSpacing: '0.28em',
                textTransform: 'uppercase',
                color: 'rgba(201,169,110,0.38)',
                fontWeight: 400,
              }}>AI-powered product visuals</span>
            </div>
          </div>

          {/* ── Minimal scroll indicator ── */}
          <div style={{
            position: 'absolute',
            bottom: '44px',
            left: '50%',
            transform: 'translateX(-50%)',
            opacity: arrowDone
              ? 0
              : wordProgress > 0.72
              ? Math.min(1, (wordProgress - 0.72) * 4)
              : 0,
            transition: arrowDone ? 'opacity 0.5s ease' : 'opacity 0.8s ease',
            pointerEvents: 'none',
            zIndex: 20,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px',
          }}>
            {/* Label */}
            <span style={{
              fontSize: '8px',
              letterSpacing: '0.32em',
              textTransform: 'uppercase',
              color: `rgba(201,169,110,${0.2 + arrowFill * 0.3})`,
              fontWeight: 400,
              transition: 'color 0.3s ease',
            }}>scroll</span>

            {/* Track + fill line */}
            <div style={{
              position: 'relative',
              width: '1px',
              height: '52px',
              background: 'rgba(201,169,110,0.12)',
            }}>
              {/* Animated fill */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '1px',
                height: `${arrowFill * 100}%`,
                background: `rgba(201,169,110,${0.4 + arrowFill * 0.5})`,
                transition: 'height 0.06s linear',
                boxShadow: arrowFill > 0.7 ? '0 0 6px rgba(201,169,110,0.5)' : 'none',
              }} />

              {/* Dot at bottom of track */}
              <div style={{
                position: 'absolute',
                bottom: '-3px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '3px',
                height: '3px',
                borderRadius: '50%',
                background: `rgba(201,169,110,${0.25 + arrowFill * 0.6})`,
                transition: 'background 0.3s ease',
              }} />
            </div>
          </div>

          {/* Edge vignettes — top and bottom */}
          <div className="absolute inset-0 pointer-events-none" style={{
            background: 'linear-gradient(to bottom, rgba(5,5,8,0.7) 0%, transparent 18%, transparent 82%, rgba(5,5,8,0.7) 100%)',
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
        @keyframes subtle-bloom {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.55; }
        }
      `}</style>
    </>
  );
}
