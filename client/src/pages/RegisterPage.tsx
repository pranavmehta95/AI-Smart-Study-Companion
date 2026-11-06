import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Brain, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { signInWithGoogle } from '../firebase';
import type { AuthResponse } from '../types';
import axios from 'axios';

type FormKey = 'name' | 'email' | 'password';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

  .rp-root {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    background: #f8f7f4;
    color: #1f2937;
  }

  /* ── Navbar ── */
  .rp-nav {
    position: sticky;
    top: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 2.5rem;
    height: 64px;
    background: #ffffff;
    border-bottom: 1px solid #e5e7eb;
    flex-shrink: 0;
  }

  .rp-nav-logo {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 800;
    font-size: 1.05rem;
    color: #1f2937;
    text-decoration: none;
    letter-spacing: -0.01em;
  }

  .rp-nav-logo-icon {
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

  .rp-nav-actions {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .rp-nav-ghost {
    padding: 0.45rem 0.85rem;
    font-family: inherit;
    font-size: 0.875rem;
    font-weight: 600;
    color: #4b5563;
    text-decoration: none;
    border-radius: 8px;
    transition: color 0.15s, background 0.15s;
  }
  .rp-nav-ghost:hover { color: #4f46e5; background: rgba(79,70,229,0.06); }

  .rp-nav-cta {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.5rem 1.05rem;
    font-family: inherit;
    font-size: 0.875rem;
    font-weight: 700;
    color: #fff;
    background: #4f46e5;
    border: none;
    border-radius: 10px;
    text-decoration: none;
    cursor: pointer;
    letter-spacing: 0.01em;
    transition: background 0.15s, box-shadow 0.15s, transform 0.1s;
  }
  .rp-nav-cta:hover {
    background: #4338ca;
    box-shadow: 0 4px 14px rgba(79,70,229,0.28);
    transform: translateY(-1px);
  }
  .rp-nav-cta:active { transform: translateY(0); }

  /* ── Two-column body ── */
  .rp-body {
    display: flex;
    flex: 1;
    min-height: 0;
  }

  /* ── LEFT PANEL ── */
  .rp-left {
    position: relative;
    flex: 1;
    background: #f8f7f4;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }

  .rp-grid-texture {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(to right, rgba(79,70,229,0.045) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(79,70,229,0.045) 1px, transparent 1px);
    background-size: 36px 36px;
    pointer-events: none;
  }

  .rp-left-inner {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    gap: 2rem;
    padding: 3rem 3.5rem;
    max-width: 520px;
    width: 100%;
  }

  .rp-headline {
    font-size: clamp(1.9rem, 2.8vw, 2.4rem);
    font-weight: 800;
    line-height: 1.2;
    letter-spacing: -0.03em;
    color: #1f2937;
    margin: 0;
  }

  .rp-subheadline {
    font-size: 1rem;
    line-height: 1.65;
    color: #6b7280;
    margin: 0;
  }

  .rp-illustration-wrap {
    border-radius: 20px;
    overflow: hidden;
    background: #eeeae2;
    box-shadow: 0 4px 24px rgba(79,70,229,0.08);
    max-width: 400px;
  }

  .rp-illustration {
    display: block;
    width: 100%;
    height: auto;
  }

  .rp-pills {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .rp-pill {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.35rem 0.85rem;
    background: rgba(79,70,229,0.07);
    color: #4f46e5;
    border-radius: 100px;
    font-size: 0.82rem;
    font-weight: 600;
    border: 1px solid rgba(79,70,229,0.12);
  }

  /* ── RIGHT PANEL ── */
  .rp-right {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: min(100%, 500px);
    background: #f0efe9;
    padding: 2.5rem 1.5rem;
  }

  /* ── Card ── */
  .rp-card {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 16px;
    padding: 2.25rem 2rem;
    width: 100%;
    max-width: 440px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.07);
    display: flex;
    flex-direction: column;
    gap: 1.2rem;
  }

  .rp-card-logo {
    display: flex;
    align-items: center;
    gap: 0.45rem;
    font-weight: 800;
    font-size: 1rem;
    color: #1f2937;
  }

  .rp-card-logo-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    background: #4f46e5;
    color: #fff;
    border-radius: 7px;
  }

  .rp-card-header { display: flex; flex-direction: column; gap: 0.25rem; }

  .rp-card-title {
    font-size: 1.35rem;
    font-weight: 800;
    color: #1f2937;
    margin: 0;
    letter-spacing: -0.025em;
  }

  .rp-card-sub {
    font-size: 0.875rem;
    color: #6b7280;
    margin: 0;
  }

  /* Google button */
  .rp-google-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.65rem;
    width: 100%;
    padding: 0.7rem 1rem;
    background: #fff;
    border: 1.5px solid #d1d5db;
    border-radius: 10px;
    font-family: inherit;
    font-size: 0.9rem;
    font-weight: 600;
    color: #1f2937;
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s, box-shadow 0.15s;
  }
  .rp-google-btn:hover:not(:disabled) {
    background: #f9fafb;
    border-color: #9ca3af;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  }
  .rp-google-btn:disabled { opacity: 0.65; cursor: not-allowed; }

  /* Divider */
  .rp-divider {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    color: #9ca3af;
    font-size: 0.78rem;
    font-weight: 500;
    letter-spacing: 0.02em;
    text-transform: uppercase;
  }
  .rp-divider::before, .rp-divider::after {
    content: '';
    flex: 1;
    height: 1px;
    background: #e5e7eb;
  }

  /* Form */
  .rp-form { display: flex; flex-direction: column; gap: 1rem; }

  .rp-field { display: flex; flex-direction: column; gap: 0.4rem; }

  .rp-label {
    font-size: 0.82rem;
    font-weight: 600;
    color: #374151;
    letter-spacing: 0.01em;
  }

  .rp-input-wrap { position: relative; }

  .rp-input {
    width: 100%;
    padding: 0.65rem 0.85rem;
    font-family: inherit;
    font-size: 0.9rem;
    color: #1f2937;
    background: #fafafa;
    border: 1.5px solid #e5e7eb;
    border-radius: 9px;
    outline: none;
    transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
    box-sizing: border-box;
  }
  .rp-input::placeholder { color: #c0c7d0; }
  .rp-input:focus {
    border-color: #4f46e5;
    background: #fff;
    box-shadow: 0 0 0 3px rgba(79,70,229,0.1);
  }
  .rp-input-wrap .rp-input { padding-right: 2.75rem; }

  .rp-eye-btn {
    position: absolute;
    right: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: #9ca3af;
    cursor: pointer;
    padding: 0;
    display: flex;
    align-items: center;
    transition: color 0.15s;
  }
  .rp-eye-btn:hover { color: #4f46e5; }

  /* Submit */
  .rp-submit-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    width: 100%;
    padding: 0.75rem 1rem;
    margin-top: 0.25rem;
    background: #4f46e5;
    color: #fff;
    border: none;
    border-radius: 10px;
    font-family: inherit;
    font-size: 0.95rem;
    font-weight: 700;
    cursor: pointer;
    letter-spacing: 0.01em;
    transition: background 0.15s, box-shadow 0.15s, transform 0.1s;
  }
  .rp-submit-btn:hover:not(:disabled) {
    background: #4338ca;
    box-shadow: 0 4px 16px rgba(79,70,229,0.28);
    transform: translateY(-1px);
  }
  .rp-submit-btn:active:not(:disabled) { transform: translateY(0); }
  .rp-submit-btn:disabled { opacity: 0.65; cursor: not-allowed; }

  /* Spinner */
  .rp-spinner {
    display: inline-block;
    width: 15px;
    height: 15px;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: rp-spin 0.7s linear infinite;
    flex-shrink: 0;
  }
  .rp-spinner-indigo {
    border-color: rgba(79,70,229,0.2);
    border-top-color: #4f46e5;
  }
  @keyframes rp-spin { to { transform: rotate(360deg); } }

  /* Sign-in link */
  .rp-signin-link {
    font-size: 0.85rem;
    color: #6b7280;
    margin: 0;
    text-align: center;
  }
  .rp-signin-link a {
    color: #4f46e5;
    font-weight: 600;
    text-decoration: none;
    transition: color 0.15s;
  }
  .rp-signin-link a:hover { color: #4338ca; text-decoration: underline; }

  /* Trust */
  .rp-trust {
    font-size: 0.77rem;
    color: #9ca3af;
    text-align: center;
    margin: 0;
    padding-top: 0.5rem;
    border-top: 1px solid #f3f4f6;
    letter-spacing: 0.01em;
  }

  /* ── Responsive ── */
  @media (max-width: 768px) {
    .rp-body { flex-direction: column; }
    .rp-left { min-height: auto; }
    .rp-left-inner { padding: 2rem 1.5rem 1.5rem; gap: 1.25rem; max-width: 100%; }
    .rp-headline { font-size: 1.6rem; }
    .rp-illustration-wrap { max-width: 260px; margin: 0 auto; }
    .rp-right { width: 100%; padding: 1.5rem 1.25rem 2.5rem; }
    .rp-card { padding: 1.75rem 1.5rem; }
    .rp-nav { padding: 0 1.25rem; }
  }
`;

const RegisterPage = () => {
  const [form, setForm] = useState<Record<FormKey, string>>({ name: '', email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (form.password.length < 6) return void toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      const { data } = await api.post<AuthResponse>('/auth/register', form);
      login(data.user, data.token);
      toast.success(`Welcome, ${data.user.name}! 🎉`);
      navigate('/dashboard');
    } catch (err) {
      const msg = axios.isAxiosError(err)
        ? (err.response?.data as { message?: string })?.message ?? err.message ?? 'Registration failed'
        : 'Registration failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true);
    try {
      const idToken = await signInWithGoogle();
      const { data } = await api.post<AuthResponse>('/auth/google', { idToken });
      login(data.user, data.token);
      toast.success(`Welcome, ${data.user.name}! 🎉`);
      navigate('/dashboard');
    } catch (err) {
      if (axios.isAxiosError(err) && err.code === 'auth/popup-closed-by-user') return;
      toast.error(
        axios.isAxiosError(err)
          ? (err.response?.data as { message?: string })?.message ?? 'Google sign-up failed'
          : 'Google sign-up failed',
      );
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="rp-root">

        {/* ── Navbar ── */}
        <nav className="rp-nav">
          <Link to="/" className="rp-nav-logo">
            <span className="rp-nav-logo-icon"><Brain size={17} strokeWidth={2.2} /></span>
            StudyAI
          </Link>
          <div className="rp-nav-actions">
            <Link to="/login" className="rp-nav-ghost">Sign in</Link>
            <Link to="/register" className="rp-nav-cta">
              Get started <ArrowRight size={14} />
            </Link>
          </div>
        </nav>

        {/* ── Two-column body ── */}
        <div className="rp-body">

          {/* Left panel */}
          <div className="rp-left">
            <div className="rp-grid-texture" aria-hidden="true" />
            <div className="rp-left-inner">
              <div>
                <h1 className="rp-headline">Start learning<br />with clarity.</h1>
                <p className="rp-subheadline" style={{ marginTop: '0.75rem' }}>
                  Turn your notes into summaries, quizzes, flashcards,<br />and focused study sessions.
                </p>
              </div>

              <div className="rp-illustration-wrap">
                <img
                  src="/register-desk.jpg"
                  alt="Study desk with notebook, books, sticky notes and a plant"
                  className="rp-illustration"
                />
              </div>

              <div className="rp-pills">
                <span className="rp-pill">📄 AI Summaries</span>
                <span className="rp-pill">🃏 Flashcards</span>
                <span className="rp-pill">❓ Smart Quizzes</span>
                <span className="rp-pill">🎙️ Viva Mode</span>
              </div>
            </div>
          </div>

          {/* Right panel — card */}
          <div className="rp-right">
            <div className="rp-card">

              {/* Card logo */}
              <div className="rp-card-logo">
                <span className="rp-card-logo-icon"><Brain size={16} strokeWidth={2.3} /></span>
                StudyAI
              </div>

              {/* Card header */}
              <div className="rp-card-header">
                <h2 className="rp-card-title">Create your account</h2>
                <p className="rp-card-sub">Start your AI-powered study journey today.</p>
              </div>

              {/* Google sign-up */}
              <button
                type="button"
                id="rp-google-btn"
                onClick={handleGoogleSignUp}
                disabled={googleLoading}
                className="rp-google-btn"
              >
                {googleLoading ? (
                  <span className="rp-spinner rp-spinner-indigo" />
                ) : (
                  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                  </svg>
                )}
                <span>{googleLoading ? 'Creating account…' : 'Continue with Google'}</span>
              </button>

              {/* Divider */}
              <div className="rp-divider" role="separator">
                <span>or sign up with email</span>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="rp-form" noValidate>

                {/* Full name */}
                <div className="rp-field">
                  <label htmlFor="rp-name" className="rp-label">Full name</label>
                  <input
                    id="rp-name"
                    className="rp-input"
                    type="text"
                    placeholder="Pranav Kumar"
                    autoComplete="name"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>

                {/* Email */}
                <div className="rp-field">
                  <label htmlFor="rp-email" className="rp-label">Email address</label>
                  <input
                    id="rp-email"
                    className="rp-input"
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </div>

                {/* Password */}
                <div className="rp-field">
                  <label htmlFor="rp-password" className="rp-label">Password</label>
                  <div className="rp-input-wrap">
                    <input
                      id="rp-password"
                      className="rp-input"
                      type={showPass ? 'text' : 'password'}
                      placeholder="Min. 6 characters"
                      autoComplete="new-password"
                      value={form.password}
                      onChange={e => setForm({ ...form, password: e.target.value })}
                      required
                    />
                    <button
                      type="button"
                      aria-label={showPass ? 'Hide password' : 'Show password'}
                      className="rp-eye-btn"
                      onClick={() => setShowPass(v => !v)}
                    >
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button id="rp-submit-btn" type="submit" className="rp-submit-btn" disabled={loading}>
                  {loading ? (
                    <><span className="rp-spinner" />Creating account…</>
                  ) : 'Create account'}
                </button>
              </form>

              {/* Sign-in link */}
              <p className="rp-signin-link">
                Already have an account?{' '}
                <Link to="/login" id="rp-signin-link">Sign in</Link>
              </p>

              {/* Trust */}
              <p className="rp-trust">Private notes.&ensp;Smarter revision.&ensp;Less stress.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RegisterPage;
