'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import BackgroundGlow from './BackgroundGlow';
import SiteHeader from './SiteHeader';
import SuccessState from './SuccessState';

export type FormValues = {
  name: string;
  project_name: string;
  project_type: string;
  budget: string;
  description: string;
};

interface ReferenceImage {
  id: string;
  file: File;
  preview: string;
  name: string;
}

const PROJECT_TYPES = [
  { value: 'brand-film', label: 'Brand Film' },
  { value: 'motion-identity', label: 'Motion Identity' },
  { value: 'title-sequence', label: 'Title Sequence' },
  { value: 'product-visualization', label: 'Product Visualization' },
  { value: 'explainer-video', label: 'Explainer Video' },
  { value: 'social-content', label: 'Social Content Series' },
  { value: 'immersive-installation', label: 'Immersive Installation' },
  { value: 'other', label: 'Something else entirely' },
];

const BUDGET_RANGES = [
  { value: 'under-5k', label: 'Under $5,000' },
  { value: '5k-15k', label: '$5,000 — $15,000' },
  { value: '15k-50k', label: '$15,000 — $50,000' },
  { value: '50k-100k', label: '$50,000 — $100,000' },
  { value: 'over-100k', label: 'Over $100,000' },
  { value: 'discuss', label: "Let\'s discuss" },
];

const STEPS = [
  { id: 1, label: 'Who are you?' },
  { id: 2, label: 'The project' },
  { id: 3, label: 'Your vision' },
  { id: 4, label: 'References' },
];

export default function AddProjectClient() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [referenceImages, setReferenceImages] = useState<ReferenceImage[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedType, setSelectedType] = useState('');
  const [selectedBudget, setSelectedBudget] = useState('');

  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const gsapRef = useRef<typeof import('gsap').gsap | null>(null);

  const {
    register,
    handleSubmit,
    trigger,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { name: '', project_name: '', project_type: '', budget: '', description: '' },
  });

  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      const { gsap } = await import('gsap');
      if (!isMounted) return;
      gsapRef.current = gsap;

      // Animate first step in
      const el = stepRefs.current[0];
      if (el) {
        gsap.fromTo(el,
          { opacity: 0, y: 50 },
          { opacity: 1, y: 0, duration: 1.1, ease: 'power3.out', delay: 0.2 }
        );
        const children = el.querySelectorAll('[data-animate]');
        gsap.fromTo(children,
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.9, stagger: 0.1, ease: 'power3.out', delay: 0.4 }
        );
      }
    };
    init();
    return () => { isMounted = false; };
  }, []);

  const transitionToStep = useCallback(async (nextStep: number) => {
    const gsap = gsapRef.current;
    if (!gsap) { setCurrentStep(nextStep); return; }

    const currentEl = stepRefs.current[currentStep - 1];
    const nextEl = stepRefs.current[nextStep - 1];

    if (currentEl) {
      await new Promise<void>((resolve) => {
        gsap.to(currentEl, {
          opacity: 0,
          y: -40,
          duration: 0.55,
          ease: 'power3.inOut',
          onComplete: resolve,
        });
      });
    }

    setCurrentStep(nextStep);

    if (nextEl) {
      gsap.set(nextEl, { opacity: 0, y: 60 });
      gsap.to(nextEl, {
        opacity: 1,
        y: 0,
        duration: 0.75,
        ease: 'power3.out',
        delay: 0.05,
      });
      const children = nextEl.querySelectorAll('[data-animate]');
      gsap.fromTo(children,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.7, stagger: 0.09, ease: 'power3.out', delay: 0.15 }
      );
    }
  }, [currentStep]);

  const handleStep1Next = async () => {
    const valid = await trigger(['name', 'project_name']);
    if (valid) transitionToStep(2);
  };

  const handleStep2Next = () => {
    transitionToStep(3);
  };

  const handleStep3Next = async () => {
    const valid = await trigger(['description']);
    if (valid) transitionToStep(4);
  };

  const handlePrev = (prevStep: number) => {
    transitionToStep(prevStep);
  };

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    setSubmitError('');
    try {
      const { supabase } = await import('@/lib/supabase');
      const { data: { user } } = await supabase.auth.getUser();
      const userEmail = user?.email ?? null;
      const { error } = await supabase.from('projects').insert({
        user_id: user?.id ?? null,
        name: data.name,
        email: userEmail,
        project_name: data.project_name,
        project_type: selectedType || data.project_type,
        description: data.description,
        budget: selectedBudget || data.budget,
        status: 'Draft',
      });
      if (error) throw error;

      const gsap = gsapRef.current;
      const currentEl = stepRefs.current[currentStep - 1];
      if (gsap && currentEl) {
        gsap.to(currentEl, { opacity: 0, y: -30, duration: 0.5, ease: 'power3.inOut' });
      }
      setTimeout(() => setIsSuccess(true), 500);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addImages = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const imageFiles = fileArray.filter((f) => f.type.startsWith('image/'));
    const newImages: ReferenceImage[] = imageFiles.slice(0, 6 - referenceImages.length).map((file) => ({
      id: `${file.name}-${file.lastModified}`,
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
    }));
    setReferenceImages((prev) => [...prev, ...newImages].slice(0, 6));
  }, [referenceImages.length]);

  const removeImage = useCallback((id: string) => {
    setReferenceImages((prev) => {
      const img = prev.find((i) => i.id === id);
      if (img) URL.revokeObjectURL(img.preview);
      return prev.filter((i) => i.id !== id);
    });
  }, []);

  const inputStyle: React.CSSProperties = {
    background: 'transparent',
    border: 'none',
    borderBottom: '1px solid rgba(255,255,255,0.15)',
    outline: 'none',
    color: '#ffffff',
    width: '100%',
    fontSize: '1.125rem',
    fontWeight: 300,
    letterSpacing: '0.01em',
    padding: '14px 0',
    fontFamily: 'inherit',
    transition: 'border-color 0.3s ease',
    borderRadius: 0,
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.6875rem',
    fontWeight: 500,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.3)',
    marginBottom: '12px',
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.borderBottomColor = 'rgba(255,255,255,0.8)';
  };
  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.borderBottomColor = 'rgba(255,255,255,0.15)';
  };

  if (isSuccess) {
    return (
      <div className="relative min-h-screen w-full overflow-hidden">
        <BackgroundGlow />
        <SiteHeader />
        <main className="relative z-10 min-h-screen flex items-center justify-center px-6">
          <SuccessState onStartNew={() => { setIsSuccess(false); setCurrentStep(1); reset(); setSelectedType(''); setSelectedBudget(''); setReferenceImages([]); }} />
        </main>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden" ref={containerRef}>
      <BackgroundGlow />
      <SiteHeader />

      {/* Step progress dots */}
      <div className="fixed top-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5">
        {STEPS.map((step) => (
          <div
            key={step.id}
            className="transition-all duration-500"
            style={{
              width: currentStep === step.id ? '24px' : '6px',
              height: '6px',
              borderRadius: '3px',
              background: currentStep === step.id
                ? 'linear-gradient(90deg, #a855f7, #ec4899)'
                : currentStep > step.id
                  ? 'rgba(168,85,247,0.4)'
                  : 'rgba(255,255,255,0.12)',
            }}
          />
        ))}
      </div>

      <main className="relative z-10 min-h-screen flex items-center justify-center px-6 sm:px-10">
        <div className="w-full max-w-xl">

          {/* Step 1: Name + Project Name */}
          <div
            ref={(el) => { stepRefs.current[0] = el; }}
            style={{ display: currentStep === 1 ? 'block' : 'none', opacity: 0 }}
          >
            <StepEyebrow step={1} total={4} />
            <div data-animate>
              <h2 className="text-[2.75rem] sm:text-[3.5rem] font-bold leading-[1.05] tracking-[-0.03em] text-white mb-3">
                Let's start with<br />
                <GradientText>you.</GradientText>
              </h2>
              <p className="text-sm font-light mb-12" style={{ color: 'rgba(255,255,255,0.35)', letterSpacing: '0.01em' }}>
                Tell us who you are and what you're building.
              </p>
            </div>

            <div className="space-y-8">
              <div data-animate>
                <label style={labelStyle}>Full Name</label>
                <input
                  type="text"
                  placeholder="Your name"
                  autoComplete="name"
                  autoFocus
                  style={inputStyle}
                  {...register('name', {
                    required: 'Your name is required',
                    minLength: { value: 2, message: 'Name must be at least 2 characters' },
                  })}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
                {errors.name && <p className="text-xs mt-2" style={{ color: '#f87171' }}>{errors.name.message}</p>}
              </div>

              <div data-animate>
                <label style={labelStyle}>Project Name</label>
                <input
                  type="text"
                  placeholder="What's your project called?"
                  autoComplete="off"
                  style={inputStyle}
                  {...register('project_name', {
                    required: 'Project name is required',
                    minLength: { value: 2, message: 'Project name must be at least 2 characters' },
                  })}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
                {errors.project_name && <p className="text-xs mt-2" style={{ color: '#f87171' }}>{errors.project_name.message}</p>}
              </div>

              <div data-animate className="pt-4">
                <ContinueButton onClick={handleStep1Next} label="Continue" />
              </div>
            </div>
          </div>

          {/* Step 2: Project Type + Budget */}
          <div
            ref={(el) => { stepRefs.current[1] = el; }}
            style={{ display: currentStep === 2 ? 'block' : 'none', opacity: 0 }}
          >
            <StepEyebrow step={2} total={4} />
            <div data-animate>
              <h2 className="text-[2.75rem] sm:text-[3.5rem] font-bold leading-[1.05] tracking-[-0.03em] text-white mb-3">
                What are we<br />
                <GradientText>creating?</GradientText>
              </h2>
              <p className="text-sm font-light mb-12" style={{ color: 'rgba(255,255,255,0.35)', letterSpacing: '0.01em' }}>
                Choose the type of project and your budget range.
              </p>
            </div>

            <div className="space-y-10">
              <div data-animate>
                <label style={labelStyle}>Project Type</label>
                <div className="flex flex-wrap gap-2.5 mt-1">
                  {PROJECT_TYPES.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setSelectedType(type.value)}
                      className="px-4 py-2 rounded-full text-sm font-light transition-all duration-300"
                      style={{
                        background: selectedType === type.value ? 'rgba(168,85,247,0.15)' : 'rgba(255,255,255,0.04)',
                        border: selectedType === type.value ? '1px solid rgba(168,85,247,0.5)' : '1px solid rgba(255,255,255,0.1)',
                        color: selectedType === type.value ? 'rgba(168,85,247,0.95)' : 'rgba(255,255,255,0.5)',
                        letterSpacing: '0.02em',
                      }}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              <div data-animate>
                <label style={labelStyle}>Budget Range</label>
                <div className="flex flex-wrap gap-2.5 mt-1">
                  {BUDGET_RANGES.map((range) => (
                    <button
                      key={range.value}
                      type="button"
                      onClick={() => setSelectedBudget(range.value)}
                      className="px-4 py-2 rounded-full text-sm font-light transition-all duration-300"
                      style={{
                        background: selectedBudget === range.value ? 'rgba(236,72,153,0.12)' : 'rgba(255,255,255,0.04)',
                        border: selectedBudget === range.value ? '1px solid rgba(236,72,153,0.45)' : '1px solid rgba(255,255,255,0.1)',
                        color: selectedBudget === range.value ? 'rgba(236,72,153,0.95)' : 'rgba(255,255,255,0.5)',
                        letterSpacing: '0.02em',
                      }}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>

              <div data-animate className="pt-2">
                <div className="flex items-center gap-4">
                  <PreviousButton onClick={() => handlePrev(1)} />
                  <ContinueButton onClick={handleStep2Next} label="Continue" />
                </div>
              </div>
            </div>
          </div>

          {/* Step 3: Description */}
          <div
            ref={(el) => { stepRefs.current[2] = el; }}
            style={{ display: currentStep === 3 ? 'block' : 'none', opacity: 0 }}
          >
            <StepEyebrow step={3} total={4} />
            <div data-animate>
              <h2 className="text-[2.75rem] sm:text-[3.5rem] font-bold leading-[1.05] tracking-[-0.03em] text-white mb-3">
                Describe your<br />
                <GradientText>vision.</GradientText>
              </h2>
              <p className="text-sm font-light mb-12" style={{ color: 'rgba(255,255,255,0.35)', letterSpacing: '0.01em' }}>
                Share your creative direction, timeline, and inspiration.
              </p>
            </div>

            <div className="space-y-8">
              <div data-animate>
                <label style={labelStyle}>Project Vision</label>
                <textarea
                  rows={5}
                  placeholder="Describe your vision, creative direction, timeline, and any references that inspire you..."
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.1)',
                    outline: 'none',
                    color: '#ffffff',
                    width: '100%',
                    fontSize: '1rem',
                    fontWeight: 300,
                    letterSpacing: '0.01em',
                    padding: '16px',
                    fontFamily: 'inherit',
                    borderRadius: '14px',
                    resize: 'none',
                    lineHeight: '1.8',
                    transition: 'border-color 0.3s ease',
                  }}
                  {...register('description', {
                    required: 'Please describe your project',
                    minLength: { value: 20, message: 'Please provide at least 20 characters' },
                  })}
                  onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.35)'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                />
                {errors.description && <p className="text-xs mt-2" style={{ color: '#f87171' }}>{errors.description.message}</p>}
              </div>

              <div data-animate className="pt-2">
                <div className="flex items-center gap-4">
                  <PreviousButton onClick={() => handlePrev(2)} />
                  <ContinueButton onClick={handleStep3Next} label="Continue" />
                </div>
              </div>
            </div>
          </div>

          {/* Step 4: Reference Images + Submit */}
          <div
            ref={(el) => { stepRefs.current[3] = el; }}
            style={{ display: currentStep === 4 ? 'block' : 'none', opacity: 0 }}
          >
            <StepEyebrow step={4} total={4} />
            <div data-animate>
              <h2 className="text-[2.75rem] sm:text-[3.5rem] font-bold leading-[1.05] tracking-[-0.03em] text-white mb-3">
                Any visual<br />
                <GradientText>references?</GradientText>
              </h2>
              <p className="text-sm font-light mb-10" style={{ color: 'rgba(255,255,255,0.35)', letterSpacing: '0.01em' }}>
                Optional — share images that inspire your project.
              </p>
            </div>

            <div className="space-y-6">
              {/* Drop Zone */}
              <div data-animate>
                <div
                  onDrop={(e) => { e.preventDefault(); setIsDragging(false); addImages(e.dataTransfer.files); }}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onClick={() => fileInputRef.current?.click()}
                  className="relative cursor-pointer rounded-[16px] transition-all duration-300"
                  style={{
                    border: isDragging ? '1px dashed rgba(168,85,247,0.6)' : '1px dashed rgba(255,255,255,0.12)',
                    background: isDragging ? 'rgba(168,85,247,0.06)' : 'rgba(255,255,255,0.02)',
                    padding: '32px 24px',
                    textAlign: 'center',
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label="Upload reference images"
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click(); }}
                >
                  <div className="flex justify-center mb-3">
                    <div
                      className="w-11 h-11 rounded-full flex items-center justify-center"
                      style={{
                        background: isDragging ? 'rgba(168,85,247,0.12)' : 'rgba(255,255,255,0.04)',
                        border: isDragging ? '1px solid rgba(168,85,247,0.3)' : '1px solid rgba(255,255,255,0.08)',
                        transition: 'all 0.3s ease',
                      }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={isDragging ? 'rgba(168,85,247,0.9)' : 'rgba(255,255,255,0.4)'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-sm font-light mb-1" style={{ color: isDragging ? 'rgba(168,85,247,0.9)' : 'rgba(255,255,255,0.45)', letterSpacing: '0.01em' }}>
                    {isDragging ? 'Drop to upload' : 'Drag & drop or click to browse'}
                  </p>
                  <p className="text-xs font-light" style={{ color: 'rgba(255,255,255,0.2)', letterSpacing: '0.02em' }}>
                    PNG, JPG, WEBP — up to 6 images
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    aria-hidden="true"
                    onChange={(e) => { if (e.target.files) addImages(e.target.files); e.target.value = ''; }}
                  />
                </div>

                {/* Image Previews */}
                {referenceImages.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    {referenceImages.map((img) => (
                      <div
                        key={img.id}
                        className="relative group rounded-[10px] overflow-hidden"
                        style={{ aspectRatio: '4/3', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img.preview} alt={`Reference: ${img.name}`} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200" style={{ background: 'rgba(0,0,0,0.6)' }}>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); removeImage(img.id); }}
                            className="w-7 h-7 rounded-full flex items-center justify-center"
                            style={{ background: 'rgba(248,113,113,0.15)', border: '1px solid rgba(248,113,113,0.3)' }}
                            aria-label={`Remove ${img.name}`}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                    {referenceImages.length < 6 && (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="cursor-pointer rounded-[10px] flex items-center justify-center transition-all duration-200"
                        style={{ aspectRatio: '4/3', background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)' }}
                        role="button"
                        tabIndex={0}
                        aria-label="Add more images"
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click(); }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Submit error */}
              {submitError && (
                <div data-animate className="flex items-start gap-3 px-4 py-3.5 rounded-xl" style={{ background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.15)' }} role="alert">
                  <p className="text-sm font-light" style={{ color: 'rgba(248,113,113,0.9)' }}>{submitError}</p>
                </div>
              )}

              {/* Submit button */}
              <div data-animate className="pt-2">
                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="flex items-center gap-4">
                    <PreviousButton onClick={() => handlePrev(3)} />
                    <SubmitButton isSubmitting={isSubmitting} />
                  </div>
                </form>
                <p className="text-center text-xs font-light mt-4" style={{ color: 'rgba(255,255,255,0.18)', letterSpacing: '0.02em' }}>
                  We typically respond within 24 hours
                </p>
              </div>
            </div>
          </div>

          {/* Back button — removed, only top-right Back to Home exists */}
        </div>
      </main>
    </div>
  );
}

function StepEyebrow({ step, total }: { step: number; total: number }) {
  return (
    <div data-animate className="flex items-center gap-3 mb-7">
      <div className="h-px w-6" style={{ background: 'linear-gradient(90deg, transparent, rgba(168,85,247,0.5))' }} />
      <span className="text-xs font-medium tracking-[0.2em] uppercase" style={{ color: 'rgba(168,85,247,0.65)' }}>
        {String(step).padStart(2, '0')} / {String(total).padStart(2, '0')}
      </span>
    </div>
  );
}

function GradientText({ children }: { children: React.ReactNode }) {
  return (
    <span style={{
      background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    }}>
      {children}
    </span>
  );
}

function ContinueButton({ onClick, label }: { onClick: () => void; label: string }) {
  const btnRef = useRef<HTMLButtonElement>(null);
  return (
    <button
      ref={btnRef}
      type="button"
      onClick={onClick}
      className="flex items-center gap-3 px-8 py-3.5 rounded-full text-sm font-medium tracking-[0.05em] transition-all duration-200"
      style={{
        background: '#ffffff',
        color: '#080808',
        border: 'none',
        cursor: 'pointer',
        willChange: 'transform',
        boxShadow: '0 8px 32px rgba(255,255,255,0.1)',
        letterSpacing: '0.04em',
      }}
      onMouseEnter={async () => {
        const { gsap } = await import('gsap');
        if (btnRef.current) gsap.to(btnRef.current, { scale: 1.03, duration: 0.25, ease: 'power2.out' });
      }}
      onMouseLeave={async () => {
        const { gsap } = await import('gsap');
        if (btnRef.current) gsap.to(btnRef.current, { scale: 1, duration: 0.25, ease: 'power2.out' });
      }}
    >
      {label}
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
      </svg>
    </button>
  );
}

function SubmitButton({ isSubmitting }: { isSubmitting: boolean }) {
  const btnRef = useRef<HTMLButtonElement>(null);
  return (
    <button
      ref={btnRef}
      type="submit"
      disabled={isSubmitting}
      className="flex items-center gap-3 px-8 py-3.5 rounded-full text-sm font-medium tracking-[0.05em] transition-all duration-200"
      style={{
        background: isSubmitting ? 'rgba(255,255,255,0.65)' : '#ffffff',
        color: '#080808',
        border: 'none',
        cursor: isSubmitting ? 'not-allowed' : 'pointer',
        willChange: 'transform',
        boxShadow: isSubmitting ? 'none' : '0 8px 32px rgba(255,255,255,0.1)',
        letterSpacing: '0.04em',
      }}
      onMouseEnter={async () => {
        if (isSubmitting) return;
        const { gsap } = await import('gsap');
        if (btnRef.current) gsap.to(btnRef.current, { scale: 1.03, duration: 0.25, ease: 'power2.out' });
      }}
      onMouseLeave={async () => {
        const { gsap } = await import('gsap');
        if (btnRef.current) gsap.to(btnRef.current, { scale: 1, duration: 0.25, ease: 'power2.out' });
      }}
    >
      {isSubmitting ? (
        <>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin" aria-hidden="true">
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
          Submitting your brief...
        </>
      ) : (
        <>
          Submit Project Brief
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
          </svg>
        </>
      )}
    </button>
  );
}

function PreviousButton({ onClick }: { onClick: () => void }) {
  const btnRef = useRef<HTMLButtonElement>(null);
  return (
    <button
      ref={btnRef}
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 px-6 py-3.5 rounded-full text-sm font-medium tracking-[0.04em] transition-all duration-200"
      style={{
        background: 'rgba(255,255,255,0.06)',
        color: 'rgba(255,255,255,0.55)',
        border: '1px solid rgba(255,255,255,0.1)',
        cursor: 'pointer',
        willChange: 'transform',
        letterSpacing: '0.04em',
      }}
      onMouseEnter={async () => {
        const { gsap } = await import('gsap');
        if (btnRef.current) {
          gsap.to(btnRef.current, { scale: 1.03, duration: 0.25, ease: 'power2.out' });
          btnRef.current.style.color = 'rgba(255,255,255,0.85)';
          btnRef.current.style.borderColor = 'rgba(255,255,255,0.22)';
        }
      }}
      onMouseLeave={async () => {
        const { gsap } = await import('gsap');
        if (btnRef.current) {
          gsap.to(btnRef.current, { scale: 1, duration: 0.25, ease: 'power2.out' });
          btnRef.current.style.color = 'rgba(255,255,255,0.55)';
          btnRef.current.style.borderColor = 'rgba(255,255,255,0.1)';
        }
      }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
      </svg>
      Previous
    </button>
  );
}
