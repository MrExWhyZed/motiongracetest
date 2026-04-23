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

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLinkClick = (href: string) => {
    setMenuOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <style>{`
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
            <div className="relative w-8 h-8 flex-shrink-0">
              <Image
                src="/motion_grace_logo.png"
                alt="Motion Grace"
                fill
                className="logo-img object-contain"
                priority
              />
            </div>
            <span className="font-bold text-sm tracking-tight hidden sm:block">
              <span className="text-foreground">Motion</span>
              <span className="text-gradient-gold">Grace</span>
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
