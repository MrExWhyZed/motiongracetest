import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HeroSection from '@/app/components/HeroSection';
import ShowreelSection from '@/app/components/ShowreelSection';
import ServicesSection from '@/app/components/ServicesSection';
import ProcessSection from '@/app/components/ProcessSection';
import WhyMotionGraceSection from '@/app/components/WhyMotionGraceSection';
import TestimonialsSection from '@/app/components/TestimonialsSection';
import CTASection from '@/app/components/CTASection';
import ScrollAnimationInit from '@/app/components/ScrollAnimationInit';

export default function HomePage() {
  return (
  
    <main className="relative bg-background [overflow-x:clip]">
      <ScrollAnimationInit />
      <Header />
      <HeroSection />
      <ShowreelSection />
      <ServicesSection />
      <ProcessSection />
      <WhyMotionGraceSection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </main>
  );
}
