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

/* ─── Cycling subheadlines (typing effect) ───────────────────────────────── */
const sublines = [
  'Cinematic CGI. Infinite Possibilities.',
  'Your Product. Elevated Forever.',
  'Beyond Reality. Endlessly Reimagined.',
  'Luxury Visuals. Zero Limits.',
];

/* ─── Hero headline cycles ────────────────────────────────────────────────── */
const HEADLINE_HOLD_MS = 4000;
const HEADLINE_FADE_MS = 800;

/* Timings */
const VISIBLE_MS  = 2800;
const FADE_MS     = 700;

type TaglineState = 'entering' | 'visible' | 'leaving';

export default function HeroSection() {
  const heroRef    = useRef<HTMLElement>(null);
  const bgRef      = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const veilRef    = useRef<HTMLDivElement>(null);

  /* Preloader state — skip on refresh/revisit */
  const hasSeenPreloader = typeof window !== 'undefined' && sessionStorage.getItem('mg_preloader_done') === '1';
  const [preloaderPhase, setPreloaderPhase] = useState<
    'wait' | 'loading' | 'fadeout' | 'done'
  >(hasSeenPreloader ? 'done' : 'wait');
  const [typeText,     setTypeText]     = useState('');
  const [heroVisible,  setHeroVisible]  = useState(hasSeenPreloader);

  /* Story overlay state */
  const [storyOpen,      setStoryOpen]      = useState(false);
  const [storyVisible,   setStoryVisible]   = useState(false); // controls opacity after mount
  const [storyExiting,   setStoryExiting]   = useState(false);
  const [viewBtnHovered, setViewBtnHovered] = useState(false);
  const storyScrollRef   = useRef<HTMLDivElement>(null);

  /* Story: "The Problem" title phase */
  const [titlePhase, setTitlePhase] = useState<'hidden'|'in'|'shown'>('hidden');

  /* Story: Screen 2 state (mirrors ProblemSection) */
  const SCREEN2_VH_S = 340;
  const STORY_BEATS_S = [
    { eyebrow: 'Our Role',       headline: 'The invisible\nCGI powerhouse.',         body: 'We act as the invisible CGI powerhouse behind leading creative agencies and modern brands — taking the friction out of high-end production, transforming conceptual ideas into stunning visual experiences.',              accent: '#C9A96E' },
    { eyebrow: 'What We Craft',  headline: 'Every frame,\nengineered.',              body: 'By crafting high-fidelity CGI product animations and design-driven narratives, we deliver scalable assets that transcend the limits of traditional photography. Cinematic storytelling fused with absolute product-focused precision.', accent: '#8B7FD4' },
    { eyebrow: 'Why It Matters', headline: 'Motion.\nEmotion.\nInteractivity.',      body: "Today's brands need more than visuals. Our CGI and 3D solutions allow products to be seen, felt, and explored from every angle — directly driving stronger engagement and measurable sales impact.",                    accent: '#4A9EFF' },
    { eyebrow: 'Our Promise',    headline: 'Imagination\nmade precise.',             body: 'From luxurious product commercials to immersive interactive CGI, Motion Grace merges artistic vision with cutting-edge technology — ensuring modern brands stand out in a crowded market.',                                  accent: '#C9A96E' },
  ];
  const STORY_VH_S  = STORY_BEATS_S.length * 220; // 880
  const TOTAL_VH_S  = SCREEN2_VH_S + STORY_VH_S;  // 1220
  const S2_FRAC_S   = SCREEN2_VH_S / TOTAL_VH_S;
  const S3_FRAC_S   = STORY_VH_S   / TOTAL_VH_S;

  const storyCanvasRef    = useRef<HTMLCanvasElement>(null);
  const storyMouseRef     = useRef({ x: 0.5, y: 0.5 });
  const storyRafRef       = useRef<number>(0);
  const storyGlowTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const storyS2RevealRef  = useRef<HTMLDivElement>(null);
  const storyCombinedRef  = useRef<HTMLDivElement>(null);

  const [sWordProgress,  setSWordProgress]  = useState(0);
  const [sGlowPulse,     setSGlowPulse]     = useState(false);
  const [sArrowFill,     setSArrowFill]     = useState(0);
  const [sArrowDone,     setSArrowDone]     = useState(false);
  const [sTransitionOut, setSTransitionOut] = useState(false);
  const [sStoryProgress, setSStoryProgress] = useState(0);

  /* Screen 1 (problem words) state */
  const [sVisibleLines,  setSVisibleLines]  = useState<boolean[]>(new Array(12).fill(false));
  const [sDistortLevel,  setSDistortLevel]  = useState(0);
  const storyScreen1Ref  = useRef<HTMLDivElement>(null);

  /* Subheading typing state */
  const [subIndex, setSubIndex]       = useState(0);
  const [subTyped, setSubTyped]       = useState('');
  const [subPhase, setSubPhase]       = useState<'typing'|'hold'|'erasing'>('typing');
  const [taglineIndex, setTaglineIndex] = useState(0);
  const [taglineState, setTaglineState] = useState<TaglineState>('entering');

  /* Hero headline cycling state */
  const [hlPhase, setHlPhase] = useState<'motionGrace'|'exitMG'|'createBuild'|'exitCB'>('motionGrace');

  /* ── Typewriter engine ───────────────────────────────────────────────── */
  useEffect(() => {
    // Skip preloader if already seen this session
    if (sessionStorage.getItem('mg_preloader_done') === '1') return;

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
                  sessionStorage.setItem('mg_preloader_done', '1');
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

  /* ── Subheading typing engine ────────────────────────────────────────── */
  useEffect(() => {
    if (!heroVisible) return;
    let t: ReturnType<typeof setTimeout>;
    const full = sublines[subIndex];

    if (subPhase === 'typing') {
      if (subTyped.length < full.length) {
        t = setTimeout(() => setSubTyped(full.slice(0, subTyped.length + 1)), 38);
      } else {
        t = setTimeout(() => setSubPhase('hold'), VISIBLE_MS);
      }
    } else if (subPhase === 'hold') {
      t = setTimeout(() => setSubPhase('erasing'), 400);
    } else if (subPhase === 'erasing') {
      if (subTyped.length > 0) {
        t = setTimeout(() => setSubTyped(subTyped.slice(0, -1)), 22);
      } else {
        const next = (subIndex + 1) % sublines.length;
        setSubIndex(next);
        setTaglineIndex(next);
        setSubPhase('typing');
      }
    }
    return () => clearTimeout(t);
  }, [heroVisible, subPhase, subTyped, subIndex]);

  /* ── Tagline cycling (kept for dots indicator) ───────────────────────── */
  useEffect(() => {
    if (!heroVisible) return;
    let t: ReturnType<typeof setTimeout>;
    if (taglineState === 'entering') {
      t = setTimeout(() => setTaglineState('visible'), FADE_MS);
    } else if (taglineState === 'visible') {
      t = setTimeout(() => setTaglineState('leaving'), VISIBLE_MS);
    } else if (taglineState === 'leaving') {
      t = setTimeout(() => {
        setTaglineIndex((prev) => (prev + 1) % sublines.length);
        setTaglineState('entering');
      }, FADE_MS);
    }
    return () => clearTimeout(t);
  }, [heroVisible, taglineState]);

  /* ── Hero headline: Motion Grace ↔ Create Once, Build Forever ─────────── */
  useEffect(() => {
    if (!heroVisible) return;
    let t: ReturnType<typeof setTimeout>;
    // motionGrace → (hold) → exitMG → (fade out MG, fade in CB) → createBuild → (hold) → exitCB → (fade out CB, fade in MG) → motionGrace
    if (hlPhase === 'motionGrace') {
      t = setTimeout(() => setHlPhase('exitMG'), HEADLINE_HOLD_MS);
    } else if (hlPhase === 'exitMG') {
      t = setTimeout(() => setHlPhase('createBuild'), HEADLINE_FADE_MS);
    } else if (hlPhase === 'createBuild') {
      t = setTimeout(() => setHlPhase('exitCB'), HEADLINE_HOLD_MS);
    } else if (hlPhase === 'exitCB') {
      t = setTimeout(() => setHlPhase('motionGrace'), HEADLINE_FADE_MS);
    }
    return () => clearTimeout(t);
  }, [heroVisible, hlPhase]);

  /* ── Story overlay: open / close ────────────────────────────────────── */
  const openStory = () => {
    setStoryOpen(true);
    setStoryVisible(false);
    setStoryExiting(false);
    setTitlePhase('hidden');
    setSWordProgress(0); setSGlowPulse(false); setSArrowFill(0);
    setSArrowDone(false); setSTransitionOut(false); setSStoryProgress(0);
    setSVisibleLines(new Array(12).fill(false)); setSDistortLevel(0);
    requestAnimationFrame(() => requestAnimationFrame(() => setStoryVisible(true)));
    setTimeout(() => setTitlePhase('in'), 500);
    setTimeout(() => setTitlePhase('shown'), 1400);
  };

  const closeStory = () => {
    setStoryExiting(true);
    setTimeout(() => {
      setStoryOpen(false); setStoryExiting(false); setStoryVisible(false);
      setTitlePhase('hidden');
      setSWordProgress(0); setSGlowPulse(false); setSArrowFill(0);
      setSArrowDone(false); setSTransitionOut(false); setSStoryProgress(0);
      setSVisibleLines(new Array(12).fill(false)); setSDistortLevel(0);
    }, 700);
  };

  /* ── Story: Screen 2 word-reveal DOM effect ──────────────────────────── */
  useEffect(() => {
    const block = storyS2RevealRef.current;
    if (!block) return;
    const wordEls = block.querySelectorAll<HTMLSpanElement>('.ss2-reveal-word');
    const revealProgress = Math.max(0, Math.min(1, sWordProgress / 0.55));
    const activeCount = Math.floor(revealProgress * wordEls.length);
    wordEls.forEach((w, i) =>
      i < activeCount ? w.classList.add('ss2-active') : w.classList.remove('ss2-active')
    );
  }, [sWordProgress]);

  /* ── Story: canvas animation ─────────────────────────────────────────── */
  useEffect(() => {
    if (!storyOpen) return;
    const canvas = storyCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let w = 0, h = 0;
    const resize = () => { w = canvas.width = canvas.offsetWidth; h = canvas.height = canvas.offsetHeight; };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const SHAPES_S = [
      { size:90,  x:12, y:20, rotX:25,  rotY:40,  speed:18, depth:'far',  opacity:0.12, color:0 },
      { size:60,  x:80, y:15, rotX:-15, rotY:55,  speed:22, depth:'far',  opacity:0.10, color:1 },
      { size:110, x:70, y:60, rotX:35,  rotY:-20, speed:26, depth:'mid',  opacity:0.15, color:2 },
      { size:45,  x:25, y:72, rotX:-40, rotY:30,  speed:20, depth:'mid',  opacity:0.13, color:0 },
      { size:75,  x:50, y:40, rotX:20,  rotY:-50, speed:30, depth:'near', opacity:0.18, color:1 },
      { size:55,  x:88, y:78, rotX:-25, rotY:15,  speed:16, depth:'near', opacity:0.14, color:2 },
      { size:38,  x:6,  y:50, rotX:50,  rotY:-35, speed:24, depth:'far',  opacity:0.09, color:0 },
      { size:82,  x:42, y:85, rotX:-10, rotY:60,  speed:19, depth:'mid',  opacity:0.12, color:1 },
      { size:48,  x:62, y:30, rotX:30,  rotY:-45, speed:28, depth:'near', opacity:0.16, color:2 },
      { size:66,  x:18, y:88, rotX:-35, rotY:25,  speed:21, depth:'far',  opacity:0.11, color:0 },
      { size:94,  x:90, y:45, rotX:15,  rotY:-65, speed:17, depth:'mid',  opacity:0.13, color:1 },
      { size:52,  x:35, y:10, rotX:-20, rotY:45,  speed:23, depth:'near', opacity:0.17, color:2 },
    ];
    const ACCENTS_S = ['#C9A96E','#8B7FD4','#4A9EFF'];
    const drawCube = (cx:number,cy:number,size:number,rotX:number,rotY:number,opacity:number,accent:string) => {
      const s=size/2, rxi=rotX*Math.PI/180, ryi=rotY*Math.PI/180;
      const cos=Math.cos, sin=Math.sin;
      const project=(px:number,py:number,pz:number):[number,number] => {
        const x1=px*cos(ryi)+pz*sin(ryi), z1=-px*sin(ryi)+pz*cos(ryi);
        const y2=py*cos(rxi)-z1*sin(rxi), z2=py*sin(rxi)+z1*cos(rxi);
        const sc=500/(500+z2+200); return [cx+x1*sc, cy+y2*sc];
      };
      const v:[number,number,number][]=[[-s,-s,-s],[s,-s,-s],[s,s,-s],[-s,s,-s],[-s,-s,s],[s,-s,s],[s,s,s],[-s,s,s]];
      const faces=[[0,1,2,3],[4,5,6,7],[0,1,5,4],[2,3,7,6],[0,3,7,4],[1,2,6,5]];
      const brightness=[0.55,1.0,0.65,0.45,0.75,0.38];
      faces.forEach((face,fi) => {
        const pts=face.map(vi=>project(...v[vi]));
        ctx.beginPath(); ctx.moveTo(pts[0][0],pts[0][1]);
        for(let i=1;i<pts.length;i++) ctx.lineTo(pts[i][0],pts[i][1]);
        ctx.closePath();
        const a0=Math.round(opacity*brightness[fi]*0.55*255).toString(16).padStart(2,'0');
        const a1=Math.round(opacity*brightness[fi]*0.12*255).toString(16).padStart(2,'0');
        const grd=ctx.createLinearGradient(pts[0][0],pts[0][1],pts[2][0],pts[2][1]);
        grd.addColorStop(0,`${accent}${a0}`); grd.addColorStop(1,`${accent}${a1}`);
        ctx.fillStyle=grd; ctx.fill();
        ctx.strokeStyle=`${accent}${Math.round(opacity*0.5*255).toString(16).padStart(2,'0')}`;
        ctx.lineWidth=0.7; ctx.stroke();
      });
    };
    const animate=(ts:number)=>{
      ctx.clearRect(0,0,w,h);
      const mx=storyMouseRef.current.x, my=storyMouseRef.current.y;
      SHAPES_S.forEach((shape,i)=>{
        const t=ts/1000, dFar=shape.depth==='far', dMid=shape.depth==='mid';
        const mx2=dFar?8:dMid?20:40, my2=dFar?6:dMid?15:30;
        const px=(shape.x/100)*w+Math.sin(t/shape.speed+i)*30+(mx-0.5)*mx2;
        const py=(shape.y/100)*h+Math.cos(t/shape.speed+i*1.3)*20+(my-0.5)*my2;
        const rotX=shape.rotX+Math.sin(t/(shape.speed*0.8)+i)*15+(my-0.5)*25;
        const rotY=shape.rotY+Math.cos(t/(shape.speed*0.9)+i*0.7)*20+(mx-0.5)*30;
        drawCube(px,py,shape.size,rotX,rotY,shape.opacity,ACCENTS_S[shape.color]);
      });
      storyRafRef.current=requestAnimationFrame(animate);
    };
    storyRafRef.current=requestAnimationFrame(animate);
    const onMouseMove=(e:MouseEvent)=>{
      storyMouseRef.current={x:e.clientX/window.innerWidth, y:e.clientY/window.innerHeight};
    };
    window.addEventListener('mousemove',onMouseMove,{passive:true});
    return ()=>{ cancelAnimationFrame(storyRafRef.current); ro.disconnect(); window.removeEventListener('mousemove',onMouseMove); };
  }, [storyOpen]);

  /* ── Story: unified scroll → Screen2 + Screen3 state ────────────────── */
  useEffect(() => {
    if (!storyOpen) return;
    const el = storyScrollRef.current;
    if (!el) return;
    const handleScroll = () => {
      // Screen 1 — problem words
      if (storyScreen1Ref.current) {
        const s1 = storyScreen1Ref.current;
        const s1Top = s1.offsetTop - el.scrollTop;
        const prog = Math.max(0, Math.min(1, 1 - s1Top / window.innerHeight));
        const PROBLEM_WORDS_COUNT = 12;
        setSVisibleLines(Array.from({length: PROBLEM_WORDS_COUNT}, (_, i) => prog > (i / PROBLEM_WORDS_COUNT) * 0.7));
        setSDistortLevel(Math.min(prog * 1.5, 1));
      }

      const combined = storyCombinedRef.current;
      if (!combined) return;
      const scrolled = el.scrollTop - combined.offsetTop;
      const total    = combined.offsetHeight - window.innerHeight;
      const raw      = Math.max(0, Math.min(1, total > 0 ? scrolled / total : 0));

      const s2Raw = Math.max(0, Math.min(1, raw / S2_FRAC_S));
      const wp    = Math.max(0, Math.min(1, s2Raw * 2));
      setSWordProgress(wp);

      if (wp > 0.92) {
        if (storyGlowTimerRef.current === null)
          storyGlowTimerRef.current = setTimeout(() => setSGlowPulse(true), 400);
      } else {
        if (storyGlowTimerRef.current !== null) { clearTimeout(storyGlowTimerRef.current); storyGlowTimerRef.current = null; }
        setSGlowPulse(false);
      }
      const arrowRaw = Math.max(0, Math.min(1, (s2Raw - 0.5) * 2));
      setSArrowFill(arrowRaw);
      if (arrowRaw >= 0.99) { setSArrowDone(true); setSTransitionOut(true); }
      else if (arrowRaw < 0.92) { setSArrowDone(false); setSTransitionOut(false); }

      const s3Raw = Math.max(0, Math.min(1, (raw - S2_FRAC_S) / S3_FRAC_S));
      setSStoryProgress(s3Raw);
    };
    el.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => {
      el.removeEventListener('scroll', handleScroll);
      if (storyGlowTimerRef.current !== null) clearTimeout(storyGlowTimerRef.current);
    };
  }, [storyOpen]);

  /* Story Screen 3 derived values */
  const S_BEAT_COUNT       = STORY_BEATS_S.length;
  const S_BEAT_SLICE       = 1 / S_BEAT_COUNT;
  const sActiveBeat        = Math.min(S_BEAT_COUNT - 1, Math.floor(sStoryProgress / S_BEAT_SLICE));
  const sLocalRaw          = Math.max(0, Math.min(1, (sStoryProgress - sActiveBeat * S_BEAT_SLICE) / S_BEAT_SLICE));
  const easeOutExpoS       = (t: number) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  const sLocalP            = easeOutExpoS(sLocalRaw);
  const sPrevBeat          = sActiveBeat - 1;
  const sBeat              = STORY_BEATS_S[sActiveBeat];
  const sPrev              = sPrevBeat >= 0 ? STORY_BEATS_S[sPrevBeat] : null;
  const sHeadlineLines     = sBeat.headline.split('\n');
  const sPrevHeadlineLines = sPrev ? sPrev.headline.split('\n') : [];
  const sCounterProgress   = (sActiveBeat + sLocalP) / S_BEAT_COUNT;

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

          {/* ── Cycling Headline: Motion Grace ↔ Create Once, Build Forever ── */}
          <div
            className="mb-4"
            style={{
              opacity: heroVisible ? 1 : 0,
              transform: heroVisible ? 'translateY(0)' : 'translateY(20px)',
              transition: 'opacity 1s cubic-bezier(0.16,1,0.3,1) 0.3s, transform 1s cubic-bezier(0.16,1,0.3,1) 0.3s',
              position: 'relative',
              height: 'clamp(3.2rem, 7.5vw, 6rem)',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>

            {/* Motion Grace */}
            <h1
              className={`hl-headline ${
                hlPhase === 'motionGrace' ? 'hl-visible'    :
                hlPhase === 'exitMG'      ? 'hl-fade-out'   :
                                            'hl-hidden'
              }`}
              style={{ fontSize: 'clamp(2.4rem, 7vw, 5.5rem)' }}>
              <span style={{ color: '#fff' }}>Motion</span>
              <span className="text-gradient-gold">Grace</span>
            </h1>

            {/* Create Once, Build Forever — smaller to fit comfortably */}
            <h1
              className={`hl-headline ${
                hlPhase === 'exitMG'      ? 'hl-fade-in'    :
                hlPhase === 'createBuild' ? 'hl-visible'    :
                hlPhase === 'exitCB'      ? 'hl-fade-out'   :
                                            'hl-hidden'
              }`}
              style={{ fontSize: 'clamp(1.55rem, 4.4vw, 3.5rem)', letterSpacing: '-0.025em' }}>
              <span style={{ color: '#fff' }}>Create Once,</span>
              <span className="text-gradient-gold">&nbsp;Build Forever</span>
            </h1>
          </div>

          {/* ── Typing Subheading ─────────────────────────────── */}
          <div
            className="mb-8"
            style={{
              opacity: heroVisible ? 1 : 0,
              transition: 'opacity 0.8s ease 0.8s',
              minHeight: '1.6em',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <p className="typing-subheading">
              {subTyped}
              <span className="typing-cursor">|</span>
            </p>
          </div>

          {/* ── Tagline dots indicator ────────────────────────── */}
          <div
            className="flex items-center gap-2 mb-10"
            style={{
              opacity: heroVisible ? 1 : 0,
              transition: 'opacity 0.8s ease 1.4s',
            }}>
            {sublines.map((_, i) => (
              <div
                key={i}
                className="tagline-dot"
                style={{
                  background: i === subIndex ? 'var(--primary)' : 'rgba(201,169,110,0.2)',
                  boxShadow: i === subIndex ? '0 0 8px rgba(201,169,110,0.6)' : 'none',
                  transform: i === subIndex ? 'scale(1.4)' : 'scale(1)',
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
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1.75rem',
            }}>
            <button
              onClick={() => document.querySelector('#cta')?.scrollIntoView({ behavior: 'smooth' })}
              className="get-started-btn">
              Get Started
              <span className="btn-arrow">→</span>
            </button>

            {/* ── Scroll indicator ─────────────────────────── */}
            <div
              className="flex flex-col items-center gap-2"
              style={{ opacity: heroVisible ? 0.4 : 0, transition: 'opacity 1s ease 1.6s' }}>
              <span className="text-[9px] tracking-[0.25em] uppercase text-muted-foreground">Scroll</span>
              <div className="w-px h-10 bg-gradient-to-b from-primary/60 to-transparent animate-scroll-bounce" />
            </div>
          </div>
        </div>
        {/* ── View Our Story — bottom left ──────────────────────── */}
        <div
          style={{
            position: 'absolute',
            bottom: '2.5rem',
            left: '2rem',
            zIndex: 30,
            opacity: heroVisible ? 1 : 0,
            transform: heroVisible ? 'translateY(0)' : 'translateY(12px)',
            transition: 'opacity 1s ease 1.8s, transform 1s ease 1.8s',
          }}>
          <button
            onClick={openStory}
            onMouseEnter={() => setViewBtnHovered(true)}
            onMouseLeave={() => setViewBtnHovered(false)}
            className="view-story-btn"
            aria-label="View our story"
          >
            {/* Animated play ring */}
            <span className="story-ring">
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                <circle
                  cx="18" cy="18" r="15"
                  stroke="rgba(201,169,110,0.3)"
                  strokeWidth="1"
                />
                <circle
                  cx="18" cy="18" r="15"
                  stroke="rgba(201,169,110,0.85)"
                  strokeWidth="1.5"
                  strokeDasharray="94"
                  strokeDashoffset={viewBtnHovered ? "0" : "94"}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 0.7s cubic-bezier(0.4,0,0.2,1)', transform: 'rotate(-90deg)', transformOrigin: '18px 18px' }}
                />
                {/* Play triangle */}
                <polygon
                  points="14,12 25,18 14,24"
                  fill={viewBtnHovered ? "rgba(201,169,110,1)" : "rgba(201,169,110,0.55)"}
                  style={{ transition: 'fill 0.3s ease' }}
                />
              </svg>
            </span>
            <span className="story-label">
              <span className="story-label-text">View our story</span>
              <span className="story-label-line" style={{ width: viewBtnHovered ? '100%' : '0%' }} />
            </span>
          </button>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          STORY OVERLAY
      ════════════════════════════════════════════════════════════════ */}
      {storyOpen && (
        <div
          className="story-overlay"
          style={{
            opacity: storyExiting ? 0 : storyVisible ? 1 : 0,
            transition: 'opacity 0.7s cubic-bezier(0.4,0,0.2,1)',
          }}
        >
          {/* ── Close button (fixed top-right) ── */}
          <button onClick={closeStory} className="story-close-btn" aria-label="Close story">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <line x1="4" y1="4" x2="16" y2="16" stroke="rgba(237,233,227,0.7)" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="16" y1="4" x2="4" y2="16" stroke="rgba(237,233,227,0.7)" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>

          {/* ── Scrollable container — all screens live here ── */}
          <div ref={storyScrollRef} className="story-scroll-inner">

            {/* ════ SCREEN 1: "THE PROBLEM" title ════ */}
            <div className="story-title-screen">
              <div className="story-noise" />
              <div
                style={{
                  textAlign: 'center', position: 'relative', zIndex: 2,
                  opacity: titlePhase === 'hidden' ? 0 : 1,
                  transform: titlePhase === 'hidden' ? 'translateY(28px)' : 'translateY(0)',
                  transition: 'opacity 0.9s ease, transform 0.9s cubic-bezier(0.16,1,0.3,1)',
                }}
              >
                <div style={{ fontSize: '0.6rem', letterSpacing: '0.4em', textTransform: 'uppercase', color: 'rgba(201,169,110,0.4)', marginBottom: '1.2rem', fontFamily: 'var(--font-sans)' }}>The Story of</div>
                <h2 style={{ margin: 0, lineHeight: 0.88, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span style={{ fontSize: 'clamp(1.2rem, 5vw, 3.5rem)', fontWeight: 300, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(237,233,227,0.3)' }}>The</span>
                  <span style={{ fontSize: 'clamp(4.5rem, 20vw, 16rem)', fontWeight: 900, letterSpacing: '-0.06em', color: 'rgba(237,233,227,0.95)', textShadow: '0 0 120px rgba(237,233,227,0.06)', lineHeight: 0.85 }}>Problem</span>
                </h2>
                <div style={{ fontSize: 'clamp(0.7rem, 1.4vw, 0.9rem)', color: 'rgba(237,233,227,0.25)', marginTop: '1.8rem', letterSpacing: '0.04em', fontFamily: 'var(--font-sans)', fontWeight: 300 }}>Why your current approach is costing you everything.</div>
              </div>
              {/* Scroll hint */}
              <div style={{ position: 'absolute', bottom: '3rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', opacity: titlePhase === 'shown' ? 1 : 0, transition: 'opacity 0.8s ease', pointerEvents: 'none' }}>
                <span style={{ fontSize: '8px', letterSpacing: '0.32em', textTransform: 'uppercase', color: 'rgba(201,169,110,0.4)', fontFamily: 'var(--font-sans)' }}>scroll</span>
                <div style={{ position: 'relative', width: '1px', height: '52px', background: 'rgba(201,169,110,0.12)' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, width: '1px', height: '40%', background: 'rgba(201,169,110,0.7)', animation: 'sScrollDrop 1.8s ease-in-out infinite' }} />
                </div>
              </div>
            </div>

            {/* ════ SCREEN 1: problem words + pain cards ════ */}
            <div
              ref={storyScreen1Ref}
              style={{
                position: 'relative', overflow: 'hidden',
                display: 'flex', flexDirection: 'column', justifyContent: 'center',
                padding: '0 6vw', minHeight: '100vh',
                background: 'linear-gradient(to bottom, #04040A 0%, #080810 50%, #0A0508 100%)',
              }}
            >
              {/* Noise */}
              <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.04 + sDistortLevel * 0.03, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundSize: '150px 150px' }} />

              <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: '96vw', margin: '0 auto', padding: '5rem 0' }}>
                {/* Eyebrow */}
                <div style={{
                  marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '10px',
                  opacity: sDistortLevel > 0.1 ? 1 : 0,
                  transform: `translateY(${sDistortLevel > 0.1 ? 0 : 16}px)`,
                  transition: 'all 0.8s cubic-bezier(0.16,1,0.3,1)',
                }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ff6b6b', boxShadow: '0 0 8px rgba(255,80,80,0.8)', animation: 'sFlickerDot 1.8s ease-in-out infinite', flexShrink: 0 }} />
                  <span style={{ fontSize: '10px', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(255,107,107,0.6)', fontFamily: 'var(--font-sans)' }}>The Reality Check</span>
                </div>

                {/* Problem words */}
                <div style={{ lineHeight: 1.05, marginBottom: '3rem' }}>
                  {[
                    { text: 'Your',         accent: false },
                    { text: 'product',      accent: false },
                    { text: 'shoots',       accent: false },
                    { text: 'take',         accent: false },
                    { text: '6 weeks.',     accent: true  },
                    { text: 'Cost you',     accent: false },
                    { text: '$80,000.',     accent: true  },
                    { text: 'Deliver',      accent: false },
                    { text: '20 assets.',   accent: true  },
                    { text: 'And go',       accent: false },
                    { text: 'out of date',  accent: false },
                    { text: 'in months.',   accent: true  },
                  ].map((word, i) => (
                    <span key={i} style={{
                      fontSize: 'clamp(2.2rem, 6vw, 6rem)', fontWeight: word.accent ? 800 : 300,
                      letterSpacing: '-0.025em', color: word.accent ? '#ff6b6b' : 'rgba(237,233,227,0.88)',
                      display: 'inline-block',
                      transform: sVisibleLines[i] ? 'translateY(0)' : 'translateY(110%)',
                      opacity: sVisibleLines[i] ? 1 : 0,
                      transition: `transform 0.7s cubic-bezier(0.16,1,0.3,1) ${i * 0.04}s, opacity 0.5s ease ${i * 0.04}s`,
                      marginRight: '0.22em',
                      textShadow: word.accent ? '0 0 30px rgba(255,80,80,0.4)' : 'none',
                    }}>{word.text}</span>
                  ))}
                </div>

                {/* Pain cards */}
                <div style={{
                  display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px',
                  maxWidth: '680px',
                  opacity: sDistortLevel > 0.4 ? 1 : 0,
                  transform: `translateY(${sDistortLevel > 0.4 ? 0 : 24}px)`,
                  transition: 'all 1s cubic-bezier(0.16,1,0.3,1) 0.2s',
                }}>
                  {[
                    { label: 'Studio rental',       value: '$4,200/day', color: '#ff6b6b' },
                    { label: 'Photographer fees',    value: '$8,000+',    color: '#ffa94d' },
                    { label: 'Reshoots & revisions', value: 'Endless',    color: '#ff6b6b' },
                    { label: 'Final asset count',    value: '≈20 images', color: '#ffa94d' },
                  ].map((p, i) => (
                    <div key={i} style={{ borderRadius: '12px', padding: '1.1rem 1.25rem', background: 'rgba(255,80,80,0.03)', border: '1px solid rgba(255,80,80,0.1)' }}>
                      <div style={{ fontSize: '9px', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(237,233,227,0.3)', marginBottom: '0.4rem', fontFamily: 'var(--font-sans)' }}>{p.label}</div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 700, color: p.color, textShadow: `0 0 20px ${p.color}60` }}>{p.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ════ COMBINED: Screen 2 (340vh) + Screen 3 (880vh) = 1220vh ════ */}
            <div ref={storyCombinedRef} style={{ height: `${TOTAL_VH_S}vh`, position: 'relative', background: 'transparent' }}>

              {/* ── Screen 2: word-reveal, fades OUT ── */}
              <div
                className="sticky top-0 overflow-hidden"
                style={{
                  height: '100vh', background: '#050508',
                  opacity: sTransitionOut ? 0 : 1,
                  transition: 'opacity 1.1s cubic-bezier(0.4,0,0.2,1)',
                  zIndex: 1,
                }}
              >
                <canvas ref={storyCanvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', opacity: 0.6 }} />
                <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse 90% 80% at 50% 50%, transparent 20%, rgba(5,5,8,0.75) 100%)' }} />
                <div style={{
                  position: 'absolute', left: 0, right: 0, top: '50%', height: '1px',
                  background: `linear-gradient(90deg, transparent 0%, rgba(201,169,110,0) 15%, rgba(201,169,110,${sWordProgress * 0.18}) 35%, rgba(255,240,200,${sWordProgress * 0.28}) 50%, rgba(201,169,110,${sWordProgress * 0.18}) 65%, rgba(201,169,110,0) 85%, transparent 100%)`,
                  transform: 'translateY(-50%)', pointerEvents: 'none',
                }} />
                <div style={{
                  position: 'absolute', pointerEvents: 'none',
                  width: '55vw', height: '45vh', left: '50%', top: '50%', transform: 'translate(-50%,-50%)',
                  background: `radial-gradient(ellipse 80% 70% at 50% 50%, rgba(201,169,110,${sGlowPulse ? 0.055 : sWordProgress * 0.025}) 0%, transparent 70%)`,
                  filter: 'blur(60px)', transition: sGlowPulse ? 'background 2s ease' : 'background 0.3s ease',
                  animation: sGlowPulse ? 'subtle-bloom 5s ease-in-out infinite' : 'none',
                }} />

                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 6vw' }}>
                  <div style={{ marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '20px', height: '1px', background: 'rgba(201,169,110,0.5)' }} />
                    <span style={{ fontSize: '10px', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(201,169,110,0.7)', fontWeight: 700, fontFamily: 'var(--font-sans)' }}>The Alternative</span>
                    <div style={{ width: '20px', height: '1px', background: 'rgba(201,169,110,0.5)' }} />
                  </div>
                  <div ref={storyS2RevealRef} style={{ textAlign: 'center', maxWidth: '820px' }}>
                    <h2 style={{ fontSize: 'clamp(2rem, 5.5vw, 4.2rem)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.05, margin: 0 }}>
                      {['There','is','a'].map((w,i) => <span key={`p-${i}`} className="ss2-reveal-word" style={{ marginRight: '0.25em' }}>{w} </span>)}
                      {['Better','Way.'].map((w,i) => <span key={`h-${i}`} className="ss2-reveal-word ss2-highlight" style={{ marginRight: '0.22em' }}>{w} </span>)}
                      <br />
                      <span className="ss2-reveal-word" style={{ marginRight: '0.28em' }}>Try </span>
                      <span className="ss2-reveal-word ss2-brand">MotionGrace.</span>
                    </h2>
                  </div>
                  <div style={{ marginTop: '2.5rem' }}>
                    <span style={{ fontSize: '11px', letterSpacing: '0.28em', textTransform: 'uppercase', color: 'rgba(201,169,110,0.38)', fontWeight: 400, fontFamily: 'var(--font-sans)' }}>AI-powered product visuals</span>
                  </div>
                </div>

                {/* Scroll arrow */}
                <div style={{
                  position: 'absolute', bottom: '44px', left: '50%', transform: 'translateX(-50%)',
                  opacity: sArrowDone ? 0 : sWordProgress > 0.72 ? Math.min(1, (sWordProgress - 0.72) * 4) : 0,
                  transition: sArrowDone ? 'opacity 0.5s ease' : 'opacity 0.8s ease',
                  pointerEvents: 'none', zIndex: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
                }}>
                  <span style={{ fontSize: '8px', letterSpacing: '0.32em', textTransform: 'uppercase', color: `rgba(201,169,110,${0.2 + sArrowFill * 0.3})`, fontFamily: 'var(--font-sans)' }}>scroll</span>
                  <div style={{ position: 'relative', width: '1px', height: '52px', background: 'rgba(201,169,110,0.12)' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '1px', height: `${sArrowFill * 100}%`, background: `rgba(201,169,110,${0.4 + sArrowFill * 0.5})`, transition: 'height 0.06s linear', boxShadow: sArrowFill > 0.7 ? '0 0 6px rgba(201,169,110,0.5)' : 'none' }} />
                    <div style={{ position: 'absolute', bottom: '-3px', left: '50%', transform: 'translateX(-50%)', width: '3px', height: '3px', borderRadius: '50%', background: `rgba(201,169,110,${0.25 + sArrowFill * 0.6})` }} />
                  </div>
                </div>
                <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'linear-gradient(to bottom, rgba(5,5,8,0.7) 0%, transparent 18%, transparent 82%, rgba(5,5,8,0.7) 100%)' }} />
              </div>

              {/* ── Screen 3: story beats, fades IN over Screen 2 ── */}
              <div style={{
                position: 'sticky', top: 0, height: '100vh',
                marginTop: '-100vh',
                overflow: 'hidden',
                background: 'linear-gradient(160deg, #03030A 0%, #060610 60%, #080508 100%)',
                display: 'flex', flexDirection: 'column', justifyContent: 'center',
                alignItems: 'flex-start', padding: '0 8vw',
                opacity: sTransitionOut ? 1 : 0,
                transition: 'opacity 1.1s cubic-bezier(0.4,0,0.2,1)',
                zIndex: 2,
                pointerEvents: sTransitionOut ? 'auto' : 'none',
              }}>
                {/* Ambient top line */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: `linear-gradient(90deg, transparent 0%, ${sBeat.accent}22 30%, ${sBeat.accent}55 50%, ${sBeat.accent}22 70%, transparent 100%)`, transition: 'background 1.2s ease' }} />

                {/* Beat counter rail */}
                <div style={{ position: 'absolute', right: '6vw', top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
                  {STORY_BEATS_S.map((b, i) => (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', opacity: i === sActiveBeat ? 1 : 0.2, transition: 'opacity 0.6s ease' }}>
                      <div style={{ width: i === sActiveBeat ? '2px' : '1px', height: i === sActiveBeat ? `${24 + sLocalP * 20}px` : '14px', background: i === sActiveBeat ? b.accent : 'rgba(237,233,227,0.3)', transition: 'height 0.4s ease, background 0.6s ease, width 0.3s ease', borderRadius: '1px' }} />
                      <span style={{ fontSize: '8px', letterSpacing: '0.2em', color: i === sActiveBeat ? b.accent : 'rgba(237,233,227,0.25)', fontWeight: 400, transition: 'color 0.6s ease' }}>{String(i + 1).padStart(2,'0')}</span>
                    </div>
                  ))}
                </div>

                {/* Main content */}
                <div style={{ width: '100%', maxWidth: '820px', position: 'relative', minHeight: '55vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  {/* Previous beat exits upward */}
                  {sPrev && sLocalP < 0.85 && (
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, opacity: Math.max(0, 1 - sLocalP * 2), transform: `translateY(${-sLocalP * 15}%)`, pointerEvents: 'none' }}>
                      <span style={{ display: 'block', fontSize: '9px', letterSpacing: '0.38em', textTransform: 'uppercase', color: `${sPrev.accent}55`, marginBottom: '1.5rem', fontWeight: 400 }}>{sPrev.eyebrow}</span>
                      {sPrevHeadlineLines.map((line, li) => (
                        <div key={li} style={{ fontSize: 'clamp(3rem, 8vw, 7.5rem)', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 0.95, color: 'rgba(237,233,227,0.15)' }}>{line}</div>
                      ))}
                    </div>
                  )}
                  {/* Current beat enters */}
                  <div style={{ opacity: sLocalP, transform: `translateY(${(1 - sLocalP) * 8}%)`, transition: 'none', willChange: 'transform, opacity' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '2rem', opacity: sLocalP > 0.2 ? 1 : 0 }}>
                      <div style={{ width: `${20 + sLocalP * 40}px`, height: '1px', background: sBeat.accent }} />
                      <span style={{ fontSize: '9px', letterSpacing: '0.38em', textTransform: 'uppercase', color: `${sBeat.accent}99`, fontWeight: 400 }}>{sBeat.eyebrow}</span>
                    </div>
                    <div style={{ marginBottom: '3rem' }}>
                      {sHeadlineLines.map((line, li) => {
                        const lineP = easeOutExpoS(Math.max(0, Math.min(1, (sLocalRaw - li * 0.12) / 0.65)));
                        return (
                          <div key={`${sActiveBeat}-${li}`} style={{ overflow: 'hidden', lineHeight: 0.92, marginBottom: '0.06em' }}>
                            <span style={{
                              display: 'block', fontSize: 'clamp(3.2rem, 8.2vw, 8rem)', fontWeight: 800,
                              letterSpacing: '-0.04em', lineHeight: 0.92,
                              color: li === sHeadlineLines.length - 1 ? 'transparent' : `rgba(237,233,227,${0.6 + lineP * 0.4})`,
                              background: li === sHeadlineLines.length - 1 ? `linear-gradient(118deg, ${sBeat.accent}99 0%, ${sBeat.accent} 40%, #F0D898 60%, ${sBeat.accent} 80%)` : 'none',
                              WebkitBackgroundClip: li === sHeadlineLines.length - 1 ? 'text' : 'unset',
                              backgroundClip: li === sHeadlineLines.length - 1 ? 'text' : 'unset',
                              transform: `translateY(${(1 - lineP) * 110}%) skewY(${(1 - lineP) * -3}deg)`,
                              opacity: lineP, filter: `blur(${(1 - lineP) * 10}px)`,
                            }}>{line}</span>
                          </div>
                        );
                      })}
                    </div>
                    <div style={{ height: '1px', width: `${sLocalP * 100}%`, background: `linear-gradient(90deg, ${sBeat.accent}55 0%, ${sBeat.accent}11 100%)`, marginBottom: '2rem' }} />
                    <p style={{ fontSize: 'clamp(0.95rem, 1.6vw, 1.15rem)', lineHeight: 1.75, color: `rgba(237,233,227,${0.2 + sLocalP * 0.45})`, fontWeight: 300, maxWidth: '580px', letterSpacing: '0.01em', margin: 0 }}>{sBeat.body}</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px', background: 'rgba(237,233,227,0.05)' }}>
                  <div style={{ height: '100%', width: `${sCounterProgress * 100}%`, background: `linear-gradient(90deg, ${STORY_BEATS_S[0].accent} 0%, ${sBeat.accent} 100%)`, transition: 'width 0.08s linear, background 1s ease', boxShadow: `0 0 12px ${sBeat.accent}55` }} />
                </div>

                {/* Scroll hint at story start */}
                <div style={{ position: 'absolute', bottom: '44px', left: '8vw', opacity: sStoryProgress < 0.04 ? 1 : 0, transition: 'opacity 0.6s ease', display: 'flex', alignItems: 'center', gap: '12px', pointerEvents: 'none' }}>
                  <div style={{ width: '1px', height: '36px', background: 'rgba(201,169,110,0.2)', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: 0, width: '1px', height: '40%', background: 'rgba(201,169,110,0.7)', animation: 'sScrollDrop 1.8s ease-in-out infinite' }} />
                  </div>
                  <span style={{ fontSize: '8px', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(201,169,110,0.35)', fontFamily: 'var(--font-sans)' }}>scroll to explore</span>
                </div>

                {/* Grain + vignette */}
                <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.025, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundSize: '140px 140px' }} />
                <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'linear-gradient(to bottom, rgba(3,3,10,0.65) 0%, transparent 20%, transparent 80%, rgba(3,3,10,0.65) 100%)' }} />
              </div>

            </div>{/* end combined */}
          </div>{/* end story-scroll-inner */}
        </div>
      )}

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

        /* ── Headline crossfade keyframes ────────────────────────── */
        .hl-headline {
          font-weight: 800;
          letter-spacing: -0.04em;
          line-height: 1;
          white-space: nowrap;
          display: flex;
          align-items: baseline;
          justify-content: center;
          gap: 0.25em;
          position: absolute;
          margin: 0;
          will-change: opacity, filter, transform;
        }
        @keyframes hl-fade-out {
          0%   { opacity: 1; filter: blur(0px);  transform: translateY(0)    scale(1);    }
          100% { opacity: 0; filter: blur(10px); transform: translateY(-12px) scale(0.95); }
        }
        @keyframes hl-fade-in {
          0%   { opacity: 0; filter: blur(10px); transform: translateY(12px)  scale(0.95); }
          100% { opacity: 1; filter: blur(0px);  transform: translateY(0)    scale(1);    }
        }
        .hl-fade-out { animation: hl-fade-out 700ms cubic-bezier(0.22,1,0.36,1) forwards; }
        .hl-fade-in  { animation: hl-fade-in  700ms cubic-bezier(0.22,1,0.36,1) forwards; }
        .hl-visible  { opacity: 1; filter: blur(0px); transform: translateY(0) scale(1); }
        .hl-hidden   { opacity: 0; pointer-events: none; }

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

        /*
          The stage uses a fixed pixel height sized to always fit two
          lines at the chosen font-size, so nothing below it jumps.
          The tagline is absolutely positioned inside it so only it
          animates, not the surrounding layout.
        */
        .headline-stage {
          position: relative;
          /* two lines × line-height + a little breathing room */
          height: clamp(7.5rem, 18vw, 13.5rem);
          width: 100%;
          overflow: visible;
        }

        .headline-tagline {
          /* Comfortable size — fits fully within the viewport */
          font-size: clamp(2rem, 5.5vw, 4.2rem);
          font-weight: 800;
          letter-spacing: -0.035em;
          line-height: 1.08;
          text-align: center;
          /* Absolutely stack inside the stage */
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          /* default: hidden */
          opacity: 0;
          transform: translateY(10px);
          filter: blur(6px);
          will-change: opacity, transform, filter;
        }

        .tagline-entering {
          animation: tagline-in ${FADE_MS}ms ease-in-out forwards;
        }
        .tagline-visible {
          opacity: 1;
          transform: translateY(0);
          filter: blur(0px);
        }
        .tagline-leaving {
          animation: tagline-out ${FADE_MS}ms ease-in-out forwards;
        }

        @keyframes tagline-in {
          from { opacity: 0; transform: translateY(10px); filter: blur(6px); }
          to   { opacity: 1; transform: translateY(0);    filter: blur(0px); }
        }
        @keyframes tagline-out {
          from { opacity: 1; transform: translateY(0);     filter: blur(0px); }
          to   { opacity: 0; transform: translateY(-10px); filter: blur(6px); }
        }

        /* ── Tagline dots ─────────────────────────────────────── */
        .tagline-dot {
          width: 4px; height: 4px; border-radius: 50%;
          transition: background 0.4s ease,
                      transform  0.4s cubic-bezier(0.34,1.56,0.64,1),
                      box-shadow 0.4s ease;
        }

        /* ── Typing Subheading ───────────────────────────────── */
        .typing-subheading {
          font-size: clamp(0.8rem, 1.8vw, 1.1rem);
          font-weight: 400;
          letter-spacing: 0.06em;
          color: rgba(237,233,227,0.6);
          font-family: var(--font-sans);
          margin: 0;
          display: inline-flex;
          align-items: center;
        }
        .typing-cursor {
          color: rgba(201,169,110,0.9);
          animation: preloader-blink 0.8s step-end infinite;
          text-shadow: 0 0 10px rgba(201,169,110,0.7);
          margin-left: 1px;
          font-weight: 100;
        }

        /* ── GET STARTED BUTTON  — minimal ghost style
        ══════════════════════════════════════════════════════════ */
        .get-started-btn {
          display: inline-flex; align-items: center; gap: 0.5rem;
          padding: 0.75rem 2rem;
          border-radius: 9999px;
          border: 1px solid rgba(201,169,110,0.35);
          background: transparent;
          color: rgba(201,169,110,0.9);
          font-size: 0.68rem;
          font-weight: 600;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          cursor: pointer;
          outline: none;
          transition: border-color 0.35s ease,
                      color        0.35s ease,
                      box-shadow   0.35s ease,
                      transform    0.35s cubic-bezier(0.34,1.56,0.64,1);
        }
        .get-started-btn:hover {
          border-color: rgba(201,169,110,0.7);
          color: rgba(232,212,160,1);
          box-shadow: 0 0 22px rgba(201,169,110,0.18);
          transform: scale(1.03);
        }

        .btn-arrow {
          display: inline-block;
          font-size: 0.8rem;
          transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1);
        }
        .get-started-btn:hover .btn-arrow { transform: translateX(4px); }

        /* ── View Our Story Button ───────────────────────── */
        .view-story-btn {
          display: flex; align-items: center; gap: 0.75rem;
          background: transparent; border: none; cursor: pointer;
          padding: 0; outline: none;
        }
        .story-ring { display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .story-label { display: flex; flex-direction: column; position: relative; }
        .story-label-text {
          font-size: 0.65rem; font-weight: 500;
          letter-spacing: 0.18em; text-transform: uppercase;
          color: rgba(201,169,110,0.75); transition: color 0.3s ease;
          font-family: var(--font-sans);
        }
        .view-story-btn:hover .story-label-text { color: rgba(232,212,160,1); }
        .story-label-line {
          display: block; height: 1px; background: rgba(201,169,110,0.7);
          transition: width 0.5s cubic-bezier(0.4,0,0.2,1); margin-top: 3px;
        }

        /* ── Story Overlay ───────────────────────────────── */
        .story-overlay {
          position: fixed; inset: 0; z-index: 9990;
          background: #000; overflow: hidden;
        }
        .story-close-btn {
          position: fixed; top: 1.75rem; right: 1.75rem;
          z-index: 9995; width: 40px; height: 40px;
          background: rgba(237,233,227,0.06);
          border: 1px solid rgba(237,233,227,0.1);
          border-radius: 50%; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.3s ease, border-color 0.3s ease, transform 0.3s cubic-bezier(0.34,1.56,0.64,1);
          outline: none;
        }
        .story-close-btn:hover {
          background: rgba(237,233,227,0.12);
          border-color: rgba(237,233,227,0.25);
          transform: rotate(90deg) scale(1.1);
        }
        .story-scroll-inner {
          position: absolute; inset: 0;
          overflow-y: auto; overflow-x: hidden;
          -webkit-overflow-scrolling: touch;
        }
        .story-scroll-inner::-webkit-scrollbar { display: none; }

        /* ── Title screen ── */
        .story-title-screen {
          width: 100vw; height: 100vh;
          position: relative; display: flex;
          align-items: center; justify-content: center;
          background: #000; flex-direction: column;
        }
        .story-noise {
          position: absolute; inset: 0; pointer-events: none; opacity: 0.04;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='grain'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23grain)'/%3E%3C/svg%3E");
          background-size: 200px 200px;
          animation: grain-drift 8s steps(10) infinite;
        }

        /* ── Screen 2 word-reveal ── */
        .ss2-reveal-word {
          display: inline;
          color: rgba(237,233,227,0.12);
          transition: color 0.55s cubic-bezier(0.16,1,0.3,1);
        }
        .ss2-reveal-word.ss2-active { color: rgba(237,233,227,0.9); }
        .ss2-reveal-word.ss2-highlight {
          font-size: clamp(2.6rem, 7vw, 6rem); font-weight: 700; letter-spacing: -0.03em;
          color: rgba(237,233,227,0.12);
          transition: color 0.55s cubic-bezier(0.16,1,0.3,1);
        }
        .ss2-reveal-word.ss2-highlight.ss2-active { color: rgba(237,233,227,1); }
        .ss2-reveal-word.ss2-brand {
          font-size: clamp(2.6rem, 7vw, 6rem); font-weight: 800; letter-spacing: -0.035em;
          -webkit-text-fill-color: transparent;
          background: linear-gradient(135deg, #B8935A 0%, #E8D4A0 45%, #C9A96E 100%);
          -webkit-background-clip: text; background-clip: text;
          opacity: 0.15; transition: opacity 0.55s cubic-bezier(0.16,1,0.3,1);
        }
        .ss2-reveal-word.ss2-brand.ss2-active { opacity: 1; -webkit-text-fill-color: transparent; }

        @keyframes sScrollDrop {
          0%   { top: 0;   opacity: 1; }
          70%  { top: 60%; opacity: 0.3; }
          100% { top: 0;   opacity: 1; }
        }
        @keyframes sFlickerDot {
          0%, 100% { opacity: 1; transform: scale(1); }
          40%      { opacity: 0.3; transform: scale(0.7); }
          60%      { opacity: 0.8; transform: scale(1.2); }
        }
        @keyframes subtle-bloom {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.55; }
        }
      `}</style>
    </>
  );
}
