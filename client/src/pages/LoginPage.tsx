import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Brain, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { signInWithGoogle } from '../firebase';
import type { AuthResponse } from '../types';
import axios from 'axios';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

  .lp-root {
    display: flex;
    min-height: 100vh;
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    background: #f8f7f4;
    color: #1f2937;
  }

  /* ── LEFT PANEL ── */
  .lp-left {
    position: relative;
    flex: 1;
    background: #f8f7f4;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    min-height: 100vh;
  }

  .lp-grid-texture {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(to right, rgba(79,70,229,0.045) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(79,70,229,0.045) 1px, transparent 1px);
    background-size: 36px 36px;
    pointer-events: none;
  }

  .lp-left-inner {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    gap: 2rem;
    padding: 3rem 3.5rem;
    max-width: 520px;
    width: 100%;
  }

  .lp-logo {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 800;
    font-size: 1.1rem;
    color: #4f46e5;
    letter-spacing: -0.01em;
  }

  .lp-logo-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 34px;
    height: 34px;
    background: #4f46e5;
    color: #fff;
    border-radius: 9px;
  }

  .lp-logo-text { color: #1f2937; }

  .lp-headline-block {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .lp-headline {
    font-size: clamp(1.9rem, 3vw, 2.5rem);
    font-weight: 800;
    line-height: 1.2;
    letter-spacing: -0.03em;
    color: #1f2937;
    margin: 0;
  }

  .lp-subheadline {
    font-size: 1rem;
    line-height: 1.65;
    color: #6b7280;
    margin: 0;
  }

  .lp-br { display: none; }
  @media (min-width: 960px) { .lp-br { display: inline; } }

  .lp-illustration-wrap {
    border-radius: 20px;
    overflow: hidden;
    background: #eeeae2;
    box-shadow: 0 4px 24px rgba(79,70,229,0.08);
    max-width: 400px;
  }

  .lp-illustration {
    display: block;
    width: 100%;
    height: auto;
    border-radius: 20px;
  }

  .lp-pills {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .lp-pill {
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
    letter-spacing: 0.01em;
  }

  /* ── RIGHT PANEL ── */
  .lp-right {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: min(100%, 480px);
    background: #f0efe9;
    padding: 2rem 1.5rem;
    min-height: 100vh;
  }

  .lp-card {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 16px;
    padding: 2.25rem 2rem;
    width: 100%;
    max-width: 400px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.07);
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .lp-card-header { display: flex; flex-direction: column; gap: 0.3rem; }

  .lp-card-title {
    font-size: 1.45rem;
    font-weight: 800;
    color: #1f2937;
    margin: 0;
    letter-spacing: -0.025em;
  }

  .lp-card-sub { font-size: 0.875rem; color: #6b7280; margin: 0; }

  .lp-google-btn {
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

  .lp-google-btn:hover:not(:disabled) {
    background: #f9fafb;
    border-color: #9ca3af;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  }

  .lp-google-btn:disabled { opacity: 0.65; cursor: not-allowed; }

  .lp-divider {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    color: #9ca3af;
    font-size: 0.78rem;
    font-weight: 500;
    letter-spacing: 0.02em;
    text-transform: uppercase;
  }

  .lp-divider::before, .lp-divider::after {
    content: '';
    flex: 1;
    height: 1px;
    background: #e5e7eb;
  }

  .lp-form { display: flex; flex-direction: column; gap: 1rem; }

  .lp-field { display: flex; flex-direction: column; gap: 0.4rem; }

  .lp-label { font-size: 0.82rem; font-weight: 600; color: #374151; letter-spacing: 0.01em; }

  .lp-label-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .lp-forgot {
    font-size: 0.78rem;
    font-weight: 500;
    color: #4f46e5;
    text-decoration: none;
    transition: color 0.15s;
  }

  .lp-forgot:hover { color: #4338ca; text-decoration: underline; }

  .lp-input-wrap { position: relative; }

  .lp-input {
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

  .lp-input::placeholder { color: #c0c7d0; }

  .lp-input:focus {
    border-color: #4f46e5;
    background: #fff;
    box-shadow: 0 0 0 3px rgba(79,70,229,0.1);
  }

  .lp-input-wrap .lp-input { padding-right: 2.75rem; }

  .lp-eye-btn {
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

  .lp-eye-btn:hover { color: #4f46e5; }

  .lp-submit-btn {
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

  .lp-submit-btn:hover:not(:disabled) {
    background: #4338ca;
    box-shadow: 0 4px 16px rgba(79,70,229,0.28);
    transform: translateY(-1px);
  }

  .lp-submit-btn:active:not(:disabled) { transform: translateY(0); }
  .lp-submit-btn:disabled { opacity: 0.65; cursor: not-allowed; }

  .lp-spinner {
    display: inline-block;
    width: 15px;
    height: 15px;
    border: 2px solid rgba(79,70,229,0.2);
    border-top-color: #4f46e5;
    border-radius: 50%;
    animation: lp-spin 0.7s linear infinite;
    flex-shrink: 0;
  }

  .lp-spinner-white {
    border-color: rgba(255,255,255,0.3);
    border-top-color: #fff;
  }

  @keyframes lp-spin { to { transform: rotate(360deg); } }

  .lp-signup-link {
    font-size: 0.85rem;
    color: #6b7280;
    margin: 0;
    text-align: center;
  }

  .lp-signup-link a {
    color: #4f46e5;
    font-weight: 600;
    text-decoration: none;
    transition: color 0.15s;
  }

  .lp-signup-link a:hover { color: #4338ca; text-decoration: underline; }

  .lp-trust {
    font-size: 0.77rem;
    color: #9ca3af;
    text-align: center;
    margin: 0;
    padding-top: 0.5rem;
    border-top: 1px solid #f3f4f6;
    letter-spacing: 0.01em;
  }

  @media (max-width: 768px) {
    .lp-root { flex-direction: column; }
    .lp-left { min-height: auto; padding: 0; }
    .lp-left-inner { padding: 2rem 1.5rem 1.5rem; gap: 1.25rem; max-width: 100%; }
    .lp-headline { font-size: 1.6rem; }
    .lp-illustration-wrap { max-width: 260px; margin: 0 auto; }
    .lp-right { width: 100%; min-height: auto; padding: 1.5rem 1.25rem 2.5rem; }
    .lp-card { padding: 1.75rem 1.5rem; }
  }
`;

const LoginPage = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post<AuthResponse>('/auth/login', form);
      login(data.user, data.token);
      toast.success(`Welcome back, ${data.user.name}!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(
        axios.isAxiosError(err)
          ? (err.response?.data as { message?: string })?.message ?? 'Login failed'
          : 'Login failed',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const idToken = await signInWithGoogle();
      const { data } = await api.post<AuthResponse>('/auth/google', { idToken });
      login(data.user, data.token);
      toast.success(`Welcome back, ${data.user.name}! 👋`);
      navigate('/dashboard');
    } catch (err) {
      if (axios.isAxiosError(err) && err.code === 'auth/popup-closed-by-user') return;
      toast.error(
        axios.isAxiosError(err)
          ? (err.response?.data as { message?: string })?.message ?? 'Google sign-in failed'
          : 'Google sign-in failed',
      );
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="lp-root">
        {/* ── Left panel ── */}
        <div className="lp-left">
          <div className="lp-grid-texture" aria-hidden="true" />
          <div className="lp-left-inner">
            <div className="lp-logo">
              <span className="lp-logo-icon"><Brain size={20} strokeWidth={2.2} /></span>
              <span className="lp-logo-text">StudyAI</span>
            </div>

            <div className="lp-headline-block">
              <h1 className="lp-headline">Your study space,<br />organized.</h1>
              <p className="lp-subheadline">
                Plan, learn, and revise with an AI study partner<br className="lp-br" /> that keeps you focused.
              </p>
            </div>

            <div className="lp-illustration-wrap">
              <img
                src="/study-desk.jpg"
                alt="A calm study desk with open notebook, books, and a plant"
                className="lp-illustration"
              />
            </div>

            <div className="lp-pills">
              <span className="lp-pill">📚 Smart flashcards</span>
              <span className="lp-pill">✏️ AI notes</span>
              <span className="lp-pill">📅 Study planner</span>
            </div>
          </div>
        </div>

        {/* ── Right panel ── */}
        <div className="lp-right">
          <div className="lp-card">
            <div className="lp-card-header">
              <h2 className="lp-card-title">Welcome back</h2>
              <p className="lp-card-sub">Sign in to continue your learning journey</p>
            </div>

            <button
              type="button"
              id="google-signin-btn"
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              className="lp-google-btn"
            >
              {googleLoading ? (
                <span className="lp-spinner" />
              ) : (
                <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                </svg>
              )}
              <span>{googleLoading ? 'Signing in…' : 'Continue with Google'}</span>
            </button>

            <div className="lp-divider" role="separator"><span>or sign in with email</span></div>

            <form onSubmit={handleSubmit} className="lp-form" noValidate>
              <div className="lp-field">
                <label htmlFor="lp-email" className="lp-label">Email address</label>
                <input
                  id="lp-email"
                  className="lp-input"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>

              <div className="lp-field">
                <div className="lp-label-row">
                  <label htmlFor="lp-password" className="lp-label">Password</label>
                  <a href="#" className="lp-forgot">Forgot password?</a>
                </div>
                <div className="lp-input-wrap">
                  <input
                    id="lp-password"
                    className="lp-input"
                    type={showPass ? 'text' : 'password'}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    aria-label={showPass ? 'Hide password' : 'Show password'}
                    className="lp-eye-btn"
                    onClick={() => setShowPass(v => !v)}
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button id="lp-signin-btn" type="submit" className="lp-submit-btn" disabled={loading}>
                {loading ? (
                  <><span className="lp-spinner lp-spinner-white" />Signing in…</>
                ) : 'Sign in'}
              </button>
            </form>

            <p className="lp-signup-link">
              Don't have an account?{' '}
              <Link to="/register" id="lp-create-account-link">Create one free</Link>
            </p>

            <p className="lp-trust">Private notes.&ensp;Smarter revision.&ensp;Less stress.</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
