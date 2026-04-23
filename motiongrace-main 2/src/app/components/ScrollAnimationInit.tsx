'use client';

import { useEffect } from 'react';

export default function ScrollAnimationInit() {
  useEffect(() => {
    const elements = document.querySelectorAll('[data-reveal]');

    elements.forEach((el) => {
      el.classList.add('hidden-init');
      const type = el.getAttribute('data-reveal') || 'up';
      el.classList.add(`reveal-${type}`);
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const delay = (entry.target as HTMLElement).dataset.delay || '0';
            setTimeout(() => {
              entry.target.classList.remove('hidden-init');
            }, parseInt(delay));
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -30px 0px' }
    );

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return null;
}