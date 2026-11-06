import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Brain, ArrowRight, Sparkles } from 'lucide-react';

interface Feature {
  icon: string;
  label: string;
  desc: string;
  color: string;
}

const features: Feature[] = [
  { icon: '📄', label: 'AI Summaries', desc: 'Upload PDFs and get instant AI-generated summaries, keywords, and structured revision notes.', color: '#4f46e5' },
  { icon: '❓', label: 'Smart Quizzes', desc: 'Auto-generated MCQs, short and long-answer questions with real-time evaluation.', color: '#14b8a6' },
  { icon: '🎙️', label: 'Viva Mode', desc: 'Simulate oral exams with AI that asks dynamic questions and gives instant feedback.', color: '#8b5cf6' },
  { icon: '🃏', label: 'Flashcards', desc: 'Flip-card style active recall with spaced repetition support for better memory.', color: '#0ea5e9' },
  { icon: '📊', label: 'Analytics', desc: 'Track progress, identify weak topics, and get a personalized AI study plan.', color: '#f59e0b' },
  { icon: '🔍', label: 'Semantic Search', desc: 'Ask questions directly about your uploaded documents and get precise answers.', color: '#10b981' },
];

const stats = [
  ['6+', 'AI Features'],
  ['∞', 'Documents'],
  ['100%', 'Free to Start'],
];

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

  /* ── Reset & root ── */
  .lnd-root {
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    color: #1f2937;
    background: #f8f7f4;
    min-height: 100vh;
  }

  /* ── Navbar ── */
  .lnd-nav {
    position: sticky;
    top: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 2.5rem;
    height: 62px;
    background: rgba(248, 247, 244, 0.88);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid #e9e7e0;
  }

  .lnd-nav-logo {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 800;
    font-size: 1.05rem;
    color: #1f2937;
    text-decoration: none;
    letter-spacing: -0.01em;
  }

  .lnd-nav-logo-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: #4f46e5;
    color: #fff;
    border-radius: 8px;
    flex-shrink: 0;
  }

  .lnd-nav-actions {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .lnd-btn-ghost {
    padding: 0.45rem 1rem;
    font-family: inherit;
    font-size: 0.875rem;
    font-weight: 600;
    color: #4b5563;
    background: none;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    text-decoration: none;
    transition: color 0.15s, background 0.15s;
  }

  .lnd-btn-ghost:hover { color: #4f46e5; background: rgba(79,70,229,0.06); }

  .lnd-btn-primary {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.5rem 1.1rem;
    font-family: inherit;
    font-size: 0.875rem;
    font-weight: 700;
    color: #fff;
    background: #4f46e5;
    border: none;
    border-radius: 9px;
    cursor: pointer;
    text-decoration: none;
    transition: background 0.15s, box-shadow 0.15s, transform 0.1s;
    letter-spacing: 0.01em;
  }

  .lnd-btn-primary:hover {
    background: #4338ca;
    box-shadow: 0 4px 14px rgba(79,70,229,0.28);
    transform: translateY(-1px);
  }

  .lnd-btn-primary:active { transform: translateY(0); }

  /* ── Grid texture ── */
  .lnd-grid-texture {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(to right, rgba(79,70,229,0.04) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(79,70,229,0.04) 1px, transparent 1px);
    background-size: 36px 36px;
    pointer-events: none;
  }

  /* thin gradient at the very bottom edge to blend into the next section */
  .lnd-hero-fade {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 100px;
    background: linear-gradient(to bottom, transparent, #f8f7f4);
    pointer-events: none;
    z-index: 2;
  }

  /* ── Hero ── */
  .lnd-hero {
    position: relative;
    overflow: visible;
    padding: 5rem 2rem 6rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 1.75rem;
  }

  .lnd-hero-inner {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.75rem;
    max-width: 700px;
    width: 100%;
  }

  .lnd-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.35rem 0.9rem;
    background: rgba(79,70,229,0.08);
    color: #4f46e5;
    border: 1px solid rgba(79,70,229,0.15);
    border-radius: 100px;
    font-size: 0.8rem;
    font-weight: 600;
    letter-spacing: 0.01em;
  }

  .lnd-hero-title {
    font-size: clamp(2.2rem, 5vw, 3.4rem);
    font-weight: 800;
    line-height: 1.15;
    letter-spacing: -0.03em;
    color: #1f2937;
    margin: 0;
  }

  .lnd-accent {
    color: #4f46e5;
  }

  .lnd-hero-desc {
    font-size: 1.05rem;
    line-height: 1.7;
    color: #6b7280;
    margin: 0;
    max-width: 560px;
  }

  .lnd-hero-actions {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
    justify-content: center;
  }

  .lnd-btn-secondary {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.55rem 1.2rem;
    font-family: inherit;
    font-size: 0.9rem;
    font-weight: 600;
    color: #4f46e5;
    background: #fff;
    border: 1.5px solid #c7d2fe;
    border-radius: 9px;
    cursor: pointer;
    text-decoration: none;
    transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
  }

  .lnd-btn-secondary:hover {
    border-color: #4f46e5;
    background: rgba(79,70,229,0.04);
    box-shadow: 0 2px 8px rgba(79,70,229,0.1);
  }

  /* Stats */
  .lnd-stats {
    display: flex;
    gap: 3rem;
    flex-wrap: wrap;
    justify-content: center;
    margin-top: 0.5rem;
  }

  .lnd-stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.15rem;
  }

  .lnd-stat-val {
    font-size: 1.9rem;
    font-weight: 800;
    color: #4f46e5;
    letter-spacing: -0.03em;
    line-height: 1;
  }

  .lnd-stat-label {
    font-size: 0.78rem;
    color: #9ca3af;
    font-weight: 500;
    letter-spacing: 0.01em;
  }

  /* ── Features ── */
  .lnd-features {
    position: relative;
    background: #f0efe9;
    border-top: 1px solid #e5e3db;
    padding: 4.5rem 2rem 5rem;
  }

  .lnd-section-header {
    text-align: center;
    margin-bottom: 3rem;
  }

  .lnd-section-title {
    font-size: clamp(1.6rem, 3vw, 2.1rem);
    font-weight: 800;
    color: #1f2937;
    letter-spacing: -0.025em;
    margin: 0 0 0.6rem;
  }

  .lnd-section-sub {
    font-size: 1rem;
    color: #6b7280;
    margin: 0;
  }

  .lnd-features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(270px, 1fr));
    gap: 1.25rem;
    max-width: 1050px;
    margin: 0 auto;
  }

  .lnd-feature-card {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 14px;
    padding: 1.6rem 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.65rem;
    transition: box-shadow 0.2s, transform 0.2s, border-color 0.2s;
    cursor: default;
  }

  .lnd-feature-card:hover {
    box-shadow: 0 6px 24px rgba(79,70,229,0.09);
    transform: translateY(-3px);
    border-color: rgba(79,70,229,0.2);
  }

  .lnd-feature-icon {
    font-size: 1.75rem;
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
    flex-shrink: 0;
  }

  .lnd-feature-title {
    font-size: 1rem;
    font-weight: 700;
    color: #1f2937;
    margin: 0;
    letter-spacing: -0.01em;
  }

  .lnd-feature-desc {
    font-size: 0.875rem;
    line-height: 1.65;
    color: #6b7280;
    margin: 0;
  }

  /* ── CTA strip ── */
  .lnd-cta {
    background: #4f46e5;
    padding: 3.5rem 2rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.25rem;
    text-align: center;
  }

  .lnd-cta-title {
    font-size: clamp(1.5rem, 3vw, 2rem);
    font-weight: 800;
    color: #fff;
    margin: 0;
    letter-spacing: -0.025em;
  }

  .lnd-cta-sub {
    font-size: 1rem;
    color: rgba(255,255,255,0.75);
    margin: 0;
  }

  .lnd-btn-white {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.65rem 1.4rem;
    font-family: inherit;
    font-size: 0.95rem;
    font-weight: 700;
    color: #4f46e5;
    background: #fff;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    text-decoration: none;
    transition: box-shadow 0.15s, transform 0.1s;
    letter-spacing: 0.01em;
  }

  .lnd-btn-white:hover {
    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
    transform: translateY(-1px);
  }

  /* ── Footer ── */
  .lnd-footer {
    background: #f8f7f4;
    border-top: 1px solid #e9e7e0;
    padding: 1.5rem 2rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .lnd-footer-logo {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-weight: 800;
    font-size: 0.95rem;
    color: #1f2937;
    text-decoration: none;
  }

  .lnd-footer-copy {
    font-size: 0.8rem;
    color: #9ca3af;
  }

  /* ── Responsive ── */
  @media (max-width: 640px) {
    .lnd-nav { padding: 0 1.25rem; }
    .lnd-hero { padding: 3.5rem 1.25rem 3.5rem; }
    .lnd-features { padding: 3rem 1.25rem 3.5rem; }
    .lnd-stats { gap: 1.75rem; }
  }
`;

const LandingPage = () => {
  const { isAuthenticated } = useAuth();

  return (
    <>
      <style>{styles}</style>
      <div className="lnd-root">

        {/* ── Navbar ── */}
        <nav className="lnd-nav">
          <Link to="/" className="lnd-nav-logo">
            <span className="lnd-nav-logo-icon"><Brain size={18} strokeWidth={2.2} /></span>
            StudyAI
          </Link>
        </nav>

        {/* ── Hero ── */}
        <section className="lnd-hero">
          <div className="lnd-grid-texture" aria-hidden="true" />
          <div className="lnd-hero-fade" aria-hidden="true" />
          <div className="lnd-hero-inner">
            <span className="lnd-badge">
              <Sparkles size={13} /> Powered by Google Gemini AI
            </span>

            <h1 className="lnd-hero-title">
              Study smarter with<br />
              <span className="lnd-accent">AI-powered learning</span>
            </h1>

            <p className="lnd-hero-desc">
              Upload your notes, PDFs, and syllabi. Get instant summaries, auto-generated quizzes,
              viva practice, flashcards, and personalized analytics — all in one place.
            </p>

            <div className="lnd-hero-actions">
              {isAuthenticated ? (
                <Link to="/dashboard" className="lnd-btn-primary" style={{ padding: '0.65rem 1.4rem', fontSize: '0.95rem' }}>
                  Go to Dashboard <ArrowRight size={17} />
                </Link>
              ) : (
                <>
                  <Link to="/register" className="lnd-btn-primary" style={{ padding: '0.65rem 1.4rem', fontSize: '0.95rem' }}>
                    Get Started Free <ArrowRight size={17} />
                  </Link>
                  <Link to="/login" className="lnd-btn-secondary">
                    Sign In
                  </Link>
                </>
              )}
            </div>

            <div className="lnd-stats">
              {stats.map(([val, label]) => (
                <div key={label} className="lnd-stat">
                  <span className="lnd-stat-val">{val}</span>
                  <span className="lnd-stat-label">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Features ── */}
        <section className="lnd-features">
          <div className="lnd-section-header">
            <h2 className="lnd-section-title">
              Everything you need to <span className="lnd-accent">ace your exams</span>
            </h2>
            <p className="lnd-section-sub">Six powerful AI tools, one unified platform.</p>
          </div>

          <div className="lnd-features-grid">
            {features.map((f) => (
              <div key={f.label} className="lnd-feature-card">
                <div
                  className="lnd-feature-icon"
                  style={{ background: `${f.color}18` }}
                >
                  {f.icon}
                </div>
                <h3 className="lnd-feature-title">{f.label}</h3>
                <p className="lnd-feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA strip ── */}
        <section className="lnd-cta">
          <h2 className="lnd-cta-title">Your study space, organized.</h2>
          <p className="lnd-cta-sub">Private notes. Smarter revision. Less stress.</p>
          {!isAuthenticated && (
            <Link to="/register" className="lnd-btn-white">
              Start for free <ArrowRight size={16} />
            </Link>
          )}
        </section>

        {/* ── Footer ── */}
        <footer className="lnd-footer">
          <Link to="/" className="lnd-footer-logo">
            <span className="lnd-nav-logo-icon" style={{ width: 26, height: 26, borderRadius: 7 }}>
              <Brain size={15} strokeWidth={2.2} />
            </span>
            StudyAI
          </Link>
          <span className="lnd-footer-copy">© {new Date().getFullYear()} StudyAI. All rights reserved.</span>
        </footer>
      </div>
    </>
  );
};

export default LandingPage;
