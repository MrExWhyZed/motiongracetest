'use client';
import React from 'react';

import { useState, useEffect, useRef } from 'react';

const showcaseItems = [
  {
    id: 1,
    category: 'Fragrance',
    title: 'Nocturne Parfum',
    client: 'Maison Élite',
    image: 'https://img.rocket.new/generatedImages/rocket_gen_img_1063c0052-1768622315711.png',
    alt: 'Luxury perfume bottle in deep darkness with gold light refraction',
    accent: '#C9A96E',
    accentRgb: '201,169,110',
    depth: 0,
  },
  {
    id: 2,
    category: 'Skincare',
    title: 'Lumière Serum',
    client: 'Glacé Beauty',
    image: 'https://images.unsplash.com/photo-1619407884060-54145a659baf?w=800',
    alt: 'Minimalist skincare serum bottle on reflective surface',
    accent: '#4A9EFF',
    accentRgb: '74,158,255',
    depth: 1,
  },
  {
    id: 3,
    category: 'Cosmetics',
    title: 'Velvet Lip Kit',
    client: 'Rouge Atelier',
    image: 'https://img.rocket.new/generatedImages/rocket_gen_img_16c0b74ab-1769009930510.png',
    alt: 'Luxury lipstick cosmetics product on dark marble',
    accent: '#8B5CF6',
    accentRgb: '139,92,246',
    depth: 2,
  },
  {
    id: 4,
    category: 'Haircare',
    title: 'Aura Oil',
    client: 'Silk & Stone',
    image: 'https://images.unsplash.com/photo-1669212408620-957229726535?w=1200',
    alt: 'Hair oil bottle with botanical ingredients',
    accent: '#C9A96E',
    accentRgb: '201,169,110',
    depth: 0,
  },
  {
    id: 5,
    category: 'Wellness',
    title: 'Aura Diffuser',
    client: 'Sora Collective',
    image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800',
    alt: 'Minimalist white diffuser on marble surface',
    accent: '#34D399',
    accentRgb: '52,211,153',
    depth: 1,
  },
  {
    id: 6,
    category: 'Jewellery',
    title: 'Lumière Ring',
    client: 'Velour Atelier',
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800',
    alt: 'Elegant gold ring with diamond on dark background',
    accent: '#FBBF24',
    accentRgb: '251,191,36',
    depth: 2,
  },
];

function ShowcaseCard({
  item,
  scrollX,
  index,
}: {
  item: typeof showcaseItems[0];
  scrollX: number;
  index: number;
}) {
  const [hovered, setHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    });
  };

  const depthOffsets = [0, -20, -40];
  const baseOffset = depthOffsets[item.depth];

  // Stagger the scroll parallax
  const parallaxShift = scrollX * (0.08 + item.depth * 0.04);

  const tiltX = hovered ? (mousePos.y - 0.5) * -12 : 0;
  const tiltY = hovered ? (mousePos.x - 0.5) * 12 : 0;

  return (
    <div
      style={{
        flexShrink: 0,
        width: 'clamp(280px, 30vw, 380px)',
        transform: `translateY(${baseOffset}px) translateX(${parallaxShift}px)`,
        transition: hovered ? 'none' : 'transform 0.1s linear',
        willChange: 'transform',
      }}
    >
      <div
        ref={cardRef}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => { setHovered(false); setMousePos({ x: 0.5, y: 0.5 }); }}
        onMouseMove={handleMouseMove}
        style={{
          position: 'relative',
          borderRadius: '20px',
          overflow: 'hidden',
          height: 'clamp(340px, 45vw, 480px)',
          border: `1px solid rgba(${item.accentRgb},${hovered ? 0.25 : 0.07})`,
          cursor: 'pointer',
          transform: `perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(${hovered ? 1.03 : 1})`,
          transition: hovered
            ? 'transform 0.15s ease, border-color 0.4s ease, box-shadow 0.4s ease'
            : 'transform 0.7s cubic-bezier(0.16,1,0.3,1), border-color 0.5s ease, box-shadow 0.5s ease',
          boxShadow: hovered
            ? `0 30px 60px rgba(0,0,0,0.7), 0 0 60px rgba(${item.accentRgb},0.08)`
            : `0 16px 40px rgba(0,0,0,0.5)`,
        }}
      >
        {/* Image */}
        <img
          src={item.image}
          alt={item.alt}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: hovered ? 'scale(1.08)' : 'scale(1)',
            transition: 'transform 3s cubic-bezier(0.16,1,0.3,1)',
            filter: `saturate(0.85) brightness(${hovered ? 0.95 : 0.85})`,
          }}
        />

        {/* Gradients */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(4,4,10,0.97) 0%, rgba(4,4,10,0.15) 55%, transparent 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at ${mousePos.x * 100}% ${mousePos.y * 100}%, rgba(${item.accentRgb},0.12) 0%, transparent 60%)`, opacity: hovered ? 1 : 0, transition: 'opacity 0.3s ease', mixBlendMode: 'screen' }} />

        {/* Glow inset */}
        <div style={{
          position: 'absolute', inset: 0, borderRadius: '20px',
          boxShadow: `inset 0 0 60px rgba(${item.accentRgb},${hovered ? 0.15 : 0.04})`,
          transition: 'box-shadow 0.5s ease',
          pointerEvents: 'none',
        }} />

        {/* Float-in blur→sharp overlay that fades on hover */}
        <div style={{
          position: 'absolute', inset: 0,
          backdropFilter: hovered ? 'none' : 'blur(0px)',
          transition: 'backdrop-filter 0.6s ease',
        }} />

        {/* Content */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1.75rem' }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
            fontSize: '9px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase',
            padding: '0.35rem 0.75rem', borderRadius: '100px',
            background: `rgba(${item.accentRgb},0.12)`,
            border: `1px solid rgba(${item.accentRgb},0.25)`,
            color: item.accent,
            marginBottom: '0.85rem',
            transform: hovered ? 'translateY(0)' : 'translateY(4px)',
            opacity: hovered ? 1 : 0.8,
            transition: 'all 0.6s cubic-bezier(0.16,1,0.3,1)',
          }}>
            <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: item.accent, boxShadow: hovered ? `0 0 6px ${item.accent}` : 'none', flexShrink: 0, transition: 'box-shadow 0.3s' }} />
            {item.category}
          </div>

          <h3 style={{
            fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.025em',
            color: '#f5f0e8', margin: '0 0 0.4rem', lineHeight: 1.2,
            transform: hovered ? 'translateY(0)' : 'translateY(6px)',
            transition: 'transform 0.7s cubic-bezier(0.16,1,0.3,1) 0.05s',
          }}>
            {item.title}
          </h3>

          <p style={{
            fontSize: '0.7rem', color: 'rgba(245,240,232,0.45)', fontWeight: 300,
            letterSpacing: '0.08em', margin: 0,
            opacity: hovered ? 0.7 : 0.4,
            transition: 'opacity 0.6s ease 0.1s',
          }}>
            {item.client}
          </p>
        </div>

        {/* Corner marks */}
        {[
          { top: 12, left: 12, bt: '1px', bl: '1px', bb: 0, br: 0 },
          { top: 12, right: 12, bt: '1px', br: '1px', bb: 0, bl: 0 },
          { bottom: 12, left: 12, bb: '1px', bl: '1px', bt: 0, br: 0 },
          { bottom: 12, right: 12, bb: '1px', br: '1px', bt: 0, bl: 0 },
        ].map((corner, ci) => (
          <div
            key={ci}
            style={{
              position: 'absolute',
              width: '16px', height: '16px',
              ...corner,
              borderTop: corner.bt ? `1px solid rgba(${item.accentRgb},0.5)` : 'none',
              borderBottom: corner.bb ? `1px solid rgba(${item.accentRgb},0.5)` : 'none',
              borderLeft: corner.bl ? `1px solid rgba(${item.accentRgb},0.5)` : 'none',
              borderRight: corner.br ? `1px solid rgba(${item.accentRgb},0.5)` : 'none',
              opacity: hovered ? 1 : 0,
              transition: 'opacity 0.5s ease',
              pointerEvents: 'none',
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default function ShowcaseSection() {
  const trackRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [scrollX, setScrollX] = useState<number>(0);
  const [sectionVisible, setSectionVisible] = useState(false);
  const animFrameRef = useRef<number>(0);
  const currentScrollRef = useRef(0);
  const targetScrollRef = useRef(0);

  // Intersection for header reveal
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setSectionVisible(true); },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // Auto-scroll the track with smooth lerp
  useEffect(() => {
    let lastTime = 0;
    const speed = 0.5; // px per ms ÷ 16

    const animate = (time: number) => {
      const delta = time - lastTime;
      lastTime = time;

      if (!trackRef.current) {
        animFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      const trackWidth = trackRef.current.scrollWidth / 2;
      targetScrollRef.current = (targetScrollRef.current + speed * (delta / 16)) % trackWidth;
      currentScrollRef.current += (targetScrollRef.current - currentScrollRef.current) * 0.08;

      trackRef.current.style.transform = `translateX(-${currentScrollRef.current}px)`;
      setScrollX(currentScrollRef.current);

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, []);

  // Double the array for infinite loop
  const allItems = [...showcaseItems, ...showcaseItems];

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden py-28 sm:py-40"
      style={{
        background: 'linear-gradient(to bottom, #0A0C14 0%, #0C0E18 50%, #0A0C16 100%)',
      }}
    >
      {/* Ambient light streaks */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          style={{
            position: 'absolute',
            top: '20%', left: '-10%',
            width: '60%', height: '2px',
            background: 'linear-gradient(90deg, transparent, rgba(201,169,110,0.08), transparent)',
            transform: 'rotate(-8deg)',
            animation: 'streak-move 8s ease-in-out infinite',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '30%', right: '-10%',
            width: '50%', height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(74,158,255,0.06), transparent)',
            transform: 'rotate(6deg)',
            animation: 'streak-move 11s ease-in-out infinite reverse',
          }}
        />
      </div>

      {/* Section header */}
      <div
        className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 mb-16"
        style={{
          opacity: sectionVisible ? 1 : 0,
          transform: `translateY(${sectionVisible ? 0 : 24}px)`,
          transition: 'all 1s cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        <div className="flex items-end justify-between">
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="h-px w-6" style={{ background: 'rgba(201,169,110,0.5)' }} />
              <span className="text-[9px] tracking-[0.3em] uppercase" style={{ color: 'rgba(201,169,110,0.6)' }}>
                Selected Work
              </span>
            </div>
            <h2
              className="font-black tracking-tighter"
              style={{ fontSize: 'clamp(1.8rem, 5vw, 3.5rem)', letterSpacing: '-0.04em', lineHeight: 1 }}
            >
              <span style={{ color: 'rgba(237,233,227,0.9)' }}>See What&apos;s </span>
              <span
                style={{
                  background: 'linear-gradient(135deg, #8B6F3E 0%, #F2E4C4 40%, #D4A96A 70%, #C9956E 100%)',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Possible
              </span>
            </h2>
          </div>
          <div className="hidden sm:flex flex-col items-end gap-1">
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
              <span
                className="font-black"
                style={{
                  fontSize: '2rem', letterSpacing: '-0.04em',
                  background: 'linear-gradient(135deg, #C9A96E, #f0d49a)',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                48+
              </span>
              <span className="text-[10px] tracking-widest uppercase" style={{ color: 'rgba(237,233,227,0.3)' }}>
                Projects
              </span>
            </div>
            <p className="text-[11px]" style={{ color: 'rgba(237,233,227,0.25)', letterSpacing: '0.06em' }}>
              Where beauty meets computation
            </p>
          </div>
        </div>
      </div>

      {/* Scrolling track — no scrollbar, auto-animates */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          overflow: 'hidden',
          maskImage: 'linear-gradient(90deg, transparent 0%, black 8%, black 92%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(90deg, transparent 0%, black 8%, black 92%, transparent 100%)',
        }}
      >
        <div
          ref={trackRef}
          style={{
            display: 'flex',
            gap: '16px',
            paddingLeft: '32px',
            paddingRight: '32px',
            willChange: 'transform',
          }}
        >
          {allItems.map((item, i) => (
            <ShowcaseCard
              key={`${item.id}-${i}`}
              item={item}
              scrollX={scrollX as number}
              index={i}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes streak-move {
          0%, 100% { opacity: 0.5; transform: rotate(-8deg) translateX(0); }
          50%       { opacity: 1;   transform: rotate(-8deg) translateX(3%); }
        }
      `}</style>
    </section>
  );
}
