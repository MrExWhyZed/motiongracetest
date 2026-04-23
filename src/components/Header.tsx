'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const navLinks = [
  { label: 'Work', href: '#showreel' },
  { label: 'Services', href: '#services' },
  { label: 'Process', href: '#process' },
  { label: 'Studio', href: '#why' },
];

/* ── Brand name cycles: "Motion Grace" → "Create Once, Build Forever" ── */
const brandCycles = ['MotionGrace', 'Create Once,\u00A0Build Forever'];
const BRAND_VISIBLE_MS = 3200;
const BRAND_FADE_MS    = 600;

export default function Header() {
  const [scrolled,  setScrolled]  = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);
  const [brandIdx,  setBrandIdx]  = useState(0);
  const [brandVis,  setBrandVis]  = useState(true); // true = faded-in

  /* ── Scroll listener ────────────────────────────────────────────── */
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /* ── Brand name cycle ───────────────────────────────────────────── */
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;

    // Hold visible for BRAND_VISIBLE_MS, then fade out
    t = setTimeout(() => {
      setBrandVis(false);
      // After fade-out, swap text and fade back in
      setTimeout(() => {
        setBrandIdx((p) => (p + 1) % brandCycles.length);
        setBrandVis(true);
      }, BRAND_FADE_MS);
    }, BRAND_VISIBLE_MS);

    return () => clearTimeout(t);
  }, [brandIdx]);

  const handleLinkClick = (href: string) => {
    setMenuOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const currentBrand = brandCycles[brandIdx];
  const isTagline    = brandIdx === 1;

  return (
    <>
      <style>{`
        .brand-text {
          transition: opacity ${BRAND_FADE_MS}ms cubic-bezier(0.4,0,0.2,1),
                      filter  ${BRAND_FADE_MS}ms cubic-bezier(0.4,0,0.2,1),
                      transform ${BRAND_FADE_MS}ms cubic-bezier(0.4,0,0.2,1);
          will-change: opacity, filter, transform;
        }
        .brand-text-in  { opacity: 1; filter: blur(0px); transform: translateY(0); }
        .brand-text-out { opacity: 0; filter: blur(4px); transform: translateY(-4px); }

        .logo-img {
          filter: brightness(0) invert(1);
          transition: filter 0.4s ease;
        }
      `}</style>

      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-1000 ${
          scrolled ? 'glass-dark py-3.5' : 'bg-transparent py-6'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-10 flex items-center justify-between">

          {/* ── Logo ─────────────────────────────────────────────── */}
          <Link href="/" className="flex items-center gap-2.5 group">
            {/* Logo image — white tinted via CSS filter */}
            <div className="relative w-8 h-8 flex-shrink-0">
              <Image
                src="/motion_grace_logo.png"
                alt="Motion Grace"
                fill
                className="logo-img object-contain"
                priority
              />
            </div>

            {/* Cycling brand name */}
            <span
              className={`brand-text font-bold tracking-tight hidden sm:block overflow-hidden ${
                brandVis ? 'brand-text-in' : 'brand-text-out'
              }`}
              style={{
                fontSize: isTagline ? '0.6rem' : '0.875rem',
                letterSpacing: isTagline ? '0.06em' : '-0.01em',
                whiteSpace: 'nowrap',
                maxWidth: isTagline ? '180px' : 'none',
              }}
            >
              {isTagline ? (
                <span className="text-gradient-gold">{currentBrand}</span>
              ) : (
                <>
                  <span className="text-foreground">Motion</span>
                  <span className="text-gradient-gold">Grace</span>
                </>
              )}
            </span>
          </Link>

          {/* ── Desktop Nav ──────────────────────────────────────── */}
          <nav className="hidden md:flex items-center gap-1">
            <div className="glass-light rounded-full px-2 py-1.5 flex items-center gap-0.5">
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={() => handleLinkClick(link.href)}
                  className="px-4 py-1.5 text-[10px] font-medium tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground transition-all duration-500 rounded-full hover:bg-white/4"
                >
                  {link.label}
                </button>
              ))}
            </div>
          </nav>

          {/* ── CTA + Hamburger ──────────────────────────────────── */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleLinkClick('#cta')}
              className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-full text-[10px] font-semibold tracking-[0.15em] uppercase text-primary-foreground bg-primary hover:opacity-90 transition-all duration-700 animate-pulse-gold"
            >
              Book a Call
            </button>

            {/* Hamburger */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden flex flex-col gap-1.5 p-2 rounded-lg hover:bg-white/4 transition-colors duration-300"
              aria-label="Toggle menu"
            >
              <span className={`block h-px w-6 bg-foreground/80 transition-all duration-500 origin-center ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`block h-px w-6 bg-foreground/80 transition-all duration-500 ${menuOpen ? 'opacity-0 scale-x-0' : ''}`} />
              <span className={`block h-px w-6 bg-foreground/80 transition-all duration-500 origin-center ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile Menu Overlay ──────────────────────────────────────── */}
      <div
        className={`fixed inset-0 z-40 transition-all duration-700 ${
          menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div
          className="absolute inset-0 bg-background/97 backdrop-blur-3xl"
          onClick={() => setMenuOpen(false)}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at center, rgba(201,169,110,0.05) 0%, transparent 70%)' }}
        />
        <nav className="relative flex flex-col items-center justify-center h-full gap-10">
          {navLinks.map((link, i) => (
            <button
              key={link.label}
              onClick={() => handleLinkClick(link.href)}
              className="text-3xl font-bold tracking-tighter text-foreground/80 hover:text-foreground transition-all duration-500"
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              {link.label}
            </button>
          ))}
          <button
            onClick={() => handleLinkClick('#cta')}
            className="mt-2 px-9 py-4 rounded-full text-xs font-semibold uppercase tracking-[0.18em] text-primary-foreground bg-primary hover:opacity-90 transition-all duration-700 animate-pulse-gold"
          >
            Book a Call
          </button>
        </nav>
      </div>
    </>
  );
}
