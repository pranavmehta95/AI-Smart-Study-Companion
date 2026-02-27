import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Brain, Sparkles, BookOpen, MessageSquare, Layers, BarChart2, Upload, Zap, Shield, ArrowRight } from 'lucide-react';

const features = [
    { icon: '📄', label: 'AI Summaries', desc: 'Upload PDFs and get instant AI-generated summaries, keywords, and structured revision notes.', color: '#7c3aed' },
    { icon: '❓', label: 'Smart Quizzes', desc: 'Auto-generated MCQs, short and long-answer questions with real-time evaluation.', color: '#06b6d4' },
    { icon: '🎙️', label: 'Viva Mode', desc: 'Simulate oral exams with AI that asks dynamic questions and gives instant feedback.', color: '#ec4899' },
    { icon: '🃏', label: 'Flashcards', desc: 'Flip-card style active recall with spaced repetition support for better memory.', color: '#10b981' },
    { icon: '📊', label: 'Analytics', desc: 'Track progress, identify weak topics, and get a personalized AI study plan.', color: '#f59e0b' },
    { icon: '🔍', label: 'Semantic Search', desc: 'Ask questions directly about your uploaded documents and get precise answers.', color: '#a78bfa' },
];

const LandingPage = () => {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    return (
        <div style={{ paddingTop: 0 }}>
            {/* Hero */}
            <section className="hero">
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div className="hero-badge">
                        <Sparkles size={14} />
                        Powered by Google Gemini AI
                    </div>
                    <h1 className="hero-title">
                        Study Smarter with<br />
                        <span className="gradient-text">AI-Powered Learning</span>
                    </h1>
                    <p className="hero-desc">
                        Upload your notes, PDFs, and syllabi. Get instant summaries, auto-generated quizzes,
                        viva practice, flash cards, and personalized analytics — all in one platform.
                    </p>
                    <div className="hero-actions">
                        {isAuthenticated ? (
                            <Link to="/dashboard" className="btn btn-primary btn-lg">
                                Go to Dashboard <ArrowRight size={18} />
                            </Link>
                        ) : (
                            <>
                                <Link to="/register" className="btn btn-primary btn-lg">
                                    Get Started Free <ArrowRight size={18} />
                                </Link>
                                <Link to="/login" className="btn btn-secondary btn-lg">
                                    Sign In
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Stats */}
                    <div style={{ display: 'flex', gap: '2.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        {[['6+', 'AI Features'], ['∞', 'Documents'], ['100%', 'Free to Start']].map(([val, label]) => (
                            <div key={label} style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '1.8rem', fontWeight: 800, background: 'linear-gradient(135deg, #a78bfa, #67e8f9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{val}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features */}
            <section style={{ padding: '1rem 0 5rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <h2 style={{ fontSize: '2rem', fontWeight: 700 }}>Everything You Need to <span className="gradient-text">Ace Your Exams</span></h2>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '0.75rem' }}>Six powerful AI tools, one unified platform.</p>
                </div>
                <div className="features-grid">
                    {features.map((f) => (
                        <div key={f.label} className="feature-card">
                            <div className="feature-icon" style={{ background: `${f.color}22` }}>{f.icon}</div>
                            <h3 className="feature-title">{f.label}</h3>
                            <p className="feature-desc">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default LandingPage;
