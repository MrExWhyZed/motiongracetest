'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Link from 'next/link';

export type FormValues = {
  name: string;
  email: string;
  project_name: string;
  project_type: string;
  budget: string;
  description: string;
};

const PROJECT_TYPES = [
  'Brand Film',
  'Motion Identity',
  'Title Sequence',
  'Product Visualization',
  'Explainer Video',
  'Social Content Series',
  'Immersive Installation',
  'Other',
];

const BUDGET_RANGES = [
  'Under $5,000',
  '$5,000 — $15,000',
  '$15,000 — $50,000',
  '$50,000 — $100,000',
  'Over $100,000',
  "Let's discuss",
];

interface ReferenceImage {
  id: string;
  file: File;
  preview: string;
  name: string;
}

export default function AddProjectClient() {
  const [selectedType, setSelectedType] = useState('');
  const [selectedBudget, setSelectedBudget] = useState('');
  const [referenceImages, setReferenceImages] = useState<ReferenceImage[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { name: '', email: '', project_name: '', project_type: '', budget: '', description: '' },
  });

  const addImages = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const imageFiles = fileArray.filter((f) => f.type.startsWith('image/'));
    const newImages: ReferenceImage[] = imageFiles
      .slice(0, 6 - referenceImages.length)
      .map((file) => ({
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

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    setSubmitError('');
    try {
      const { supabase } = await import('@/lib/supabase');
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from('projects').insert({
        user_id: user?.id ?? null,
        name: data.name,
        email: data.email,
        project_name: data.project_name,
        project_type: selectedType || data.project_type,
        description: data.description,
        budget: selectedBudget || data.budget,
        status: 'Draft',
      });
      if (error) throw error;
      setIsSuccess(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return <SuccessScreen onNew={() => { setIsSuccess(false); reset(); setSelectedType(''); setSelectedBudget(''); setReferenceImages([]); }} />;
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=DM+Mono:wght@300;400&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .ap-root {
          min-height: 100vh;
          background: #080608;
          color: #EDE9E3;
          font-family: 'DM Mono', monospace;
          display: flex;
          flex-direction: column;
        }

        .ap-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 28px 40px;
          border-bottom: 1px solid rgba(201,169,110,0.1);
        }
        .ap-logo {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.1rem;
          font-weight: 500;
          letter-spacing: 0.08em;
          color: #C9A96E;
          text-decoration: none;
        }
        .ap-back {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.65rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(237,233,227,0.3);
          text-decoration: none;
          transition: color 0.3s;
        }
        .ap-back:hover { color: rgba(237,233,227,0.7); }

        .ap-body {
          flex: 1;
          display: grid;
          grid-template-columns: 1fr 1.6fr;
          min-height: 0;
        }

        .ap-left {
          padding: 60px 48px;
          border-right: 1px solid rgba(201,169,110,0.1);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: sticky;
          top: 0;
          height: calc(100vh - 73px);
          overflow: hidden;
        }
        .ap-eyebrow {
          font-size: 0.6rem;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: rgba(201,169,110,0.55);
          margin-bottom: 32px;
        }
        .ap-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(2.8rem, 4vw, 4rem);
          font-weight: 300;
          line-height: 1.1;
          letter-spacing: -0.02em;
          color: #EDE9E3;
          margin-bottom: 28px;
        }
        .ap-title em {
          font-style: italic;
          color: #C9A96E;
        }
        .ap-desc {
          font-size: 0.72rem;
          line-height: 2;
          color: rgba(237,233,227,0.3);
          letter-spacing: 0.04em;
          max-width: 280px;
        }
        .ap-stats {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .ap-stat {
          display: flex;
          align-items: baseline;
          gap: 12px;
        }
        .ap-stat-num {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.6rem;
          font-weight: 300;
          color: #C9A96E;
          letter-spacing: -0.02em;
        }
        .ap-stat-label {
          font-size: 0.6rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(237,233,227,0.25);
        }
        .ap-left-orb {
          position: absolute;
          bottom: -80px; left: -80px;
          width: 320px; height: 320px;
          border-radius: 50%;
          background: radial-gradient(ellipse at center, rgba(201,169,110,0.07) 0%, transparent 65%);
          pointer-events: none;
        }

        .ap-right {
          padding: 60px 56px;
          overflow-y: auto;
        }

        .ap-section-label {
          font-size: 0.58rem;
          letter-spacing: 0.24em;
          text-transform: uppercase;
          color: rgba(201,169,110,0.45);
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .ap-section-label::before {
          content: '';
          display: block;
          width: 20px; height: 1px;
          background: rgba(201,169,110,0.35);
        }

        .ap-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 28px;
          margin-bottom: 28px;
        }
        .ap-field {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 28px;
        }
        .ap-label {
          font-size: 0.58rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(201,169,110,0.5);
        }
        .ap-input {
          background: transparent;
          border: none;
          border-bottom: 1px solid rgba(237,233,227,0.1);
          outline: none;
          color: #EDE9E3;
          font-size: 0.88rem;
          font-family: 'DM Mono', monospace;
          font-weight: 300;
          letter-spacing: 0.02em;
          padding: 12px 0;
          width: 100%;
          transition: border-color 0.3s;
          border-radius: 0;
        }
        .ap-input:focus { border-bottom-color: rgba(201,169,110,0.6); }
        .ap-input::placeholder { color: rgba(237,233,227,0.12); }
        .ap-textarea {
          background: rgba(237,233,227,0.02);
          border: 1px solid rgba(237,233,227,0.08);
          outline: none;
          color: #EDE9E3;
          font-size: 0.82rem;
          font-family: 'DM Mono', monospace;
          font-weight: 300;
          letter-spacing: 0.02em;
          padding: 18px 20px;
          width: 100%;
          resize: none;
          border-radius: 4px;
          min-height: 130px;
          line-height: 1.9;
          transition: border-color 0.3s;
        }
        .ap-textarea:focus { border-color: rgba(201,169,110,0.3); }
        .ap-textarea::placeholder { color: rgba(237,233,227,0.1); }
        .ap-error-msg { font-size: 0.6rem; color: #f87171; letter-spacing: 0.08em; }

        .ap-pills {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .ap-pill {
          padding: 7px 16px;
          border-radius: 2px;
          font-size: 0.62rem;
          font-family: 'DM Mono', monospace;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          cursor: pointer;
          border: 1px solid rgba(237,233,227,0.08);
          background: transparent;
          color: rgba(237,233,227,0.3);
          transition: all 0.25s;
        }
        .ap-pill:hover { border-color: rgba(201,169,110,0.3); color: rgba(201,169,110,0.7); }
        .ap-pill.selected { border-color: rgba(201,169,110,0.6); background: rgba(201,169,110,0.08); color: #C9A96E; }

        .ap-divider {
          height: 1px;
          background: linear-gradient(90deg, rgba(201,169,110,0.15), transparent);
          margin: 44px 0;
        }

        .ap-dropzone {
          border: 1px dashed rgba(237,233,227,0.1);
          border-radius: 4px;
          padding: 36px 24px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s;
        }
        .ap-dropzone:hover, .ap-dropzone.dragging {
          border-color: rgba(201,169,110,0.35);
          background: rgba(201,169,110,0.03);
        }
        .ap-dropzone-icon {
          width: 36px; height: 36px;
          border-radius: 50%;
          background: rgba(237,233,227,0.03);
          border: 1px solid rgba(237,233,227,0.07);
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 12px;
        }
        .ap-dropzone-text { font-size: 0.65rem; letter-spacing: 0.1em; color: rgba(237,233,227,0.3); }
        .ap-dropzone-sub { font-size: 0.58rem; letter-spacing: 0.08em; color: rgba(237,233,227,0.15); margin-top: 4px; }
        .ap-image-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 12px; }
        .ap-image-thumb { position: relative; aspect-ratio: 4/3; border-radius: 4px; overflow: hidden; border: 1px solid rgba(237,233,227,0.07); }
        .ap-image-thumb img { width: 100%; height: 100%; object-fit: cover; }
        .ap-image-remove { position: absolute; inset: 0; background: rgba(0,0,0,0.65); display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.2s; }
        .ap-image-thumb:hover .ap-image-remove { opacity: 1; }
        .ap-remove-btn { width: 28px; height: 28px; border-radius: 50%; background: rgba(248,113,113,0.12); border: 1px solid rgba(248,113,113,0.3); display: flex; align-items: center; justify-content: center; cursor: pointer; }

        .ap-submit-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 48px;
          padding-top: 36px;
          border-top: 1px solid rgba(237,233,227,0.06);
        }
        .ap-submit-note { font-size: 0.58rem; letter-spacing: 0.1em; color: rgba(237,233,227,0.18); }
        .ap-submit-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 36px;
          background: #C9A96E;
          color: #080608;
          border: none;
          border-radius: 2px;
          font-family: 'DM Mono', monospace;
          font-size: 0.62rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.3s;
          position: relative;
          overflow: hidden;
        }
        .ap-submit-btn:hover { background: #E8D4A0; transform: translateY(-1px); }
        .ap-submit-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
        .ap-submit-btn::after {
          content: '';
          position: absolute; top: 0; left: -100%;
          width: 60%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transform: skewX(-20deg);
          animation: ap-shimmer 3s ease-in-out infinite;
        }
        @keyframes ap-shimmer { 0% { left: -100%; } 100% { left: 200%; } }

        .ap-error-box { background: rgba(248,113,113,0.06); border: 1px solid rgba(248,113,113,0.15); border-radius: 4px; padding: 14px 18px; font-size: 0.68rem; color: rgba(248,113,113,0.9); margin-top: 16px; }

        @keyframes ap-fade-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .ap-a  { animation: ap-fade-up 0.7s cubic-bezier(0.16,1,0.3,1) forwards; }
        .ap-d1 { animation-delay: 0.1s; opacity: 0; }
        .ap-d2 { animation-delay: 0.2s; opacity: 0; }
        .ap-d3 { animation-delay: 0.3s; opacity: 0; }
        .ap-d4 { animation-delay: 0.45s; opacity: 0; }
        .ap-d5 { animation-delay: 0.6s; opacity: 0; }

        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        @media (max-width: 860px) {
          .ap-body { grid-template-columns: 1fr; }
          .ap-left { position: static; height: auto; padding: 40px 28px; border-right: none; border-bottom: 1px solid rgba(201,169,110,0.1); }
          .ap-left-orb { display: none; }
          .ap-right { padding: 40px 28px; }
          .ap-header { padding: 20px 28px; }
          .ap-grid-2 { grid-template-columns: 1fr; }
          .ap-submit-row { flex-direction: column; gap: 16px; align-items: flex-start; }
          .ap-submit-btn { width: 100%; justify-content: center; }
        }
      `}</style>

      <div className="ap-root">
        <header className="ap-header">
          <Link href="/" className="ap-logo">MotionGrace</Link>
          <Link href="/" className="ap-back">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
            </svg>
            Back to Studio
          </Link>
        </header>

        <div className="ap-body">
          {/* Left Panel */}
          <aside className="ap-left">
            <div>
              <p className="ap-eyebrow ap-a ap-d1">New Project Brief</p>
              <h1 className="ap-title ap-a ap-d2">
                Let&apos;s build<br />something<br /><em>extraordinary.</em>
              </h1>
              <p className="ap-desc ap-a ap-d3">
                Share your vision and we&apos;ll transform it into motion that lasts forever. Fill out the brief and we&apos;ll respond within 24 hours.
              </p>
            </div>
            <div className="ap-a ap-d4">
              <div className="ap-stats">
                <div className="ap-stat">
                  <span className="ap-stat-num">24h</span>
                  <span className="ap-stat-label">Response time</span>
                </div>
                <div className="ap-stat">
                  <span className="ap-stat-num">12k+</span>
                  <span className="ap-stat-label">Assets delivered</span>
                </div>
                <div className="ap-stat">
                  <span className="ap-stat-num">5d</span>
                  <span className="ap-stat-label">Avg. turnaround</span>
                </div>
              </div>
            </div>
            <div className="ap-left-orb" />
          </aside>

          {/* Right Panel */}
          <main className="ap-right">
            <form onSubmit={handleSubmit(onSubmit)}>

              {/* 01 — About You */}
              <div className="ap-a ap-d2">
                <p className="ap-section-label">01 &mdash; About You</p>
                <div className="ap-grid-2">
                  <div className="ap-field">
                    <label className="ap-label">Full Name *</label>
                    <input className="ap-input" placeholder="Your name" autoComplete="name"
                      {...register('name', { required: 'Required', minLength: { value: 2, message: 'Min 2 chars' } })} />
                    {errors.name && <span className="ap-error-msg">{errors.name.message}</span>}
                  </div>
                  <div className="ap-field">
                    <label className="ap-label">Email Address *</label>
                    <input className="ap-input" type="email" placeholder="you@company.com" autoComplete="email"
                      {...register('email', { required: 'Required', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Valid email required' } })} />
                    {errors.email && <span className="ap-error-msg">{errors.email.message}</span>}
                  </div>
                </div>
              </div>

              <div className="ap-divider" />

              {/* 02 — The Project */}
              <div className="ap-a ap-d3">
                <p className="ap-section-label">02 &mdash; The Project</p>
                <div className="ap-field">
                  <label className="ap-label">Project Name *</label>
                  <input className="ap-input" placeholder="What are we calling this?" autoComplete="off"
                    {...register('project_name', { required: 'Required', minLength: { value: 2, message: 'Min 2 chars' } })} />
                  {errors.project_name && <span className="ap-error-msg">{errors.project_name.message}</span>}
                </div>
                <div className="ap-field">
                  <label className="ap-label">Project Type</label>
                  <div className="ap-pills">
                    {PROJECT_TYPES.map((type) => (
                      <button key={type} type="button"
                        onClick={() => setSelectedType(type === selectedType ? '' : type)}
                        className={`ap-pill${selectedType === type ? ' selected' : ''}`}>
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="ap-field" style={{ marginTop: 28 }}>
                  <label className="ap-label">Budget Range</label>
                  <div className="ap-pills">
                    {BUDGET_RANGES.map((range) => (
                      <button key={range} type="button"
                        onClick={() => setSelectedBudget(range === selectedBudget ? '' : range)}
                        className={`ap-pill${selectedBudget === range ? ' selected' : ''}`}>
                        {range}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="ap-divider" />

              {/* 03 — Vision */}
              <div className="ap-a ap-d4">
                <p className="ap-section-label">03 &mdash; Your Vision</p>
                <div className="ap-field">
                  <label className="ap-label">Project Brief *</label>
                  <textarea className="ap-textarea" rows={6}
                    placeholder="Describe your vision, creative direction, timeline, and any inspiration..."
                    {...register('description', { required: 'Please describe your project', minLength: { value: 20, message: 'At least 20 characters' } })} />
                  {errors.description && <span className="ap-error-msg">{errors.description.message}</span>}
                </div>
              </div>

              <div className="ap-divider" />

              {/* 04 — References */}
              <div className="ap-a ap-d5">
                <p className="ap-section-label">
                  04 &mdash; Visual References&nbsp;
                  <span style={{ color: 'rgba(237,233,227,0.18)', fontSize: '0.55rem', letterSpacing: '0.12em' }}>Optional</span>
                </p>
                <div
                  className={`ap-dropzone${isDragging ? ' dragging' : ''}`}
                  onClick={() => fileInputRef.current?.click()}
                  onDrop={(e) => { e.preventDefault(); setIsDragging(false); addImages(e.dataTransfer.files); }}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  role="button" tabIndex={0} aria-label="Upload reference images"
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click(); }}
                >
                  <div className="ap-dropzone-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(237,233,227,0.35)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                  </div>
                  <p className="ap-dropzone-text">{isDragging ? 'Drop to upload' : 'Drag & drop or click to browse'}</p>
                  <p className="ap-dropzone-sub">PNG, JPG, WEBP — up to 6 images</p>
                  <input ref={fileInputRef} type="file" accept="image/*" multiple style={{ display: 'none' }}
                    onChange={(e) => { if (e.target.files) addImages(e.target.files); e.target.value = ''; }} />
                </div>
                {referenceImages.length > 0 && (
                  <div className="ap-image-grid">
                    {referenceImages.map((img) => (
                      <div key={img.id} className="ap-image-thumb">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img.preview} alt={img.name} />
                        <div className="ap-image-remove">
                          <button type="button" className="ap-remove-btn"
                            onClick={(e) => { e.stopPropagation(); removeImage(img.id); }}
                            aria-label={`Remove ${img.name}`}>
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {submitError && <div className="ap-error-box">{submitError}</div>}

              <div className="ap-submit-row">
                <p className="ap-submit-note">We typically respond within 24 hours · No spam, ever</p>
                <button type="submit" className="ap-submit-btn" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin-slow 1s linear infinite' }}>
                        <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Brief
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </form>
          </main>
        </div>
      </div>
    </>
  );
}

function SuccessScreen({ onNew }: { onNew: () => void }) {
  return (
    <>
      <style>{`
        .ap-success-root {
          min-height: 100vh;
          background: #080608;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-family: 'DM Mono', monospace;
          padding: 40px 24px;
          text-align: center;
        }
        .ap-success-icon {
          width: 72px; height: 72px;
          border-radius: 50%;
          background: rgba(201,169,110,0.07);
          border: 1px solid rgba(201,169,110,0.2);
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 32px;
          animation: ap-breathe 4s ease-in-out infinite;
        }
        @keyframes ap-breathe { 0%,100%{box-shadow:0 0 0 0 rgba(201,169,110,0)} 50%{box-shadow:0 0 40px 8px rgba(201,169,110,0.1)} }
        .ap-success-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(2rem, 5vw, 3rem);
          font-weight: 300;
          color: #EDE9E3;
          margin-bottom: 16px;
          letter-spacing: -0.02em;
        }
        .ap-success-line { width: 40px; height: 1px; background: linear-gradient(90deg, #C9A96E, #E8D4A0); margin: 0 auto 20px; }
        .ap-success-desc { font-size: 0.72rem; line-height: 2; color: rgba(237,233,227,0.3); max-width: 320px; margin: 0 auto 48px; letter-spacing: 0.04em; }
        .ap-success-steps { display: flex; gap: 32px; margin-bottom: 48px; justify-content: center; }
        .ap-success-step { display: flex; flex-direction: column; align-items: center; gap: 8px; }
        .ap-success-step-num { width: 32px; height: 32px; border-radius: 50%; background: rgba(201,169,110,0.08); border: 1px solid rgba(201,169,110,0.2); display: flex; align-items: center; justify-content: center; font-size: 0.58rem; color: rgba(201,169,110,0.7); letter-spacing: 0.08em; }
        .ap-success-step-label { font-size: 0.6rem; color: rgba(237,233,227,0.4); letter-spacing: 0.1em; }
        .ap-success-step-sub { font-size: 0.55rem; color: rgba(237,233,227,0.2); letter-spacing: 0.08em; }
        .ap-success-actions { display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; }
        .ap-success-btn-p { padding: 14px 32px; background: #C9A96E; color: #080608; border: none; border-radius: 2px; font-family: 'DM Mono', monospace; font-size: 0.6rem; letter-spacing: 0.18em; text-transform: uppercase; cursor: pointer; transition: background 0.3s; }
        .ap-success-btn-p:hover { background: #E8D4A0; }
        .ap-success-btn-s { padding: 14px 32px; background: transparent; color: rgba(237,233,227,0.4); border: 1px solid rgba(237,233,227,0.1); border-radius: 2px; font-family: 'DM Mono', monospace; font-size: 0.6rem; letter-spacing: 0.18em; text-transform: uppercase; text-decoration: none; transition: all 0.3s; display: inline-flex; align-items: center; }
        .ap-success-btn-s:hover { border-color: rgba(237,233,227,0.25); color: rgba(237,233,227,0.7); }
      `}</style>
      <div className="ap-success-root">
        <div className="ap-success-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C9A96E" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <h2 className="ap-success-title">Brief received.</h2>
        <div className="ap-success-line" />
        <p className="ap-success-desc">
          Your project brief has been submitted to the Motion Grace studio. Expect a response within 24 hours.
        </p>
        <div className="ap-success-steps">
          {[
            { n: '01', label: 'Brief Review', sub: 'Within 24h' },
            { n: '02', label: 'Discovery Call', sub: 'Day 2–3' },
            { n: '03', label: 'Proposal', sub: 'Day 5–7' },
          ].map((s) => (
            <div key={s.n} className="ap-success-step">
              <div className="ap-success-step-num">{s.n}</div>
              <span className="ap-success-step-label">{s.label}</span>
              <span className="ap-success-step-sub">{s.sub}</span>
            </div>
          ))}
        </div>
        <div className="ap-success-actions">
          <button onClick={onNew} className="ap-success-btn-p">New Project</button>
          <a href="/" className="ap-success-btn-s">Back to Studio</a>
        </div>
      </div>
    </>
  );
}
