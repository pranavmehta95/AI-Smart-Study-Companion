import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { ChevronLeft, ChevronRight, RotateCcw, Shuffle } from 'lucide-react';

const FlashcardsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [cards, setCards] = useState([]);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [flipped, setFlipped] = useState(false);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);

    useEffect(() => { loadOrGenerate(); }, [id]);

    const loadOrGenerate = async () => {
        setLoading(true);
        try {
            const { data } = await api.get(`/ai/flashcards/${id}`);
            setCards(data.flashcard.cards);
        } catch {
            await generateCards();
        } finally {
            setLoading(false);
        }
    };

    const generateCards = async () => {
        setGenerating(true);
        try {
            const { data } = await api.post(`/ai/flashcards/${id}`);
            setCards(data.flashcard.cards);
            toast.success('Flashcards generated!');
        } catch {
            toast.error('Failed to generate flashcards');
        } finally {
            setGenerating(false);
        }
    };

    const shuffle = () => {
        setCards(c => [...c].sort(() => Math.random() - 0.5));
        setCurrentIdx(0); setFlipped(false);
    };

    const prev = () => { setCurrentIdx(i => Math.max(0, i - 1)); setFlipped(false); };
    const next = () => { setCurrentIdx(i => Math.min(cards.length - 1, i + 1)); setFlipped(false); };

    if (loading || generating) return (
        <div className="loading-state" style={{ minHeight: 'calc(100vh - 70px)' }}>
            <div className="spinner" />
            <p style={{ color: 'var(--text-secondary)' }}>{generating ? '🃏 Generating flashcards...' : 'Loading...'}</p>
        </div>
    );

    const card = cards[currentIdx];
    const diffColor = { easy: 'var(--green)', medium: 'var(--yellow)', hard: 'var(--red)' };

    return (
        <div className="page">
            <div className="flashcard-container">
                <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 className="page-title">🃏 Flashcards</h1>
                        <p className="page-subtitle">{cards.length} cards — click to flip</p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-secondary btn-sm" onClick={shuffle}><Shuffle size={14} /> Shuffle</button>
                        <button className="btn btn-secondary btn-sm" onClick={generateCards}><RotateCcw size={14} /> Regenerate</button>
                    </div>
                </div>

                {/* Progress */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${((currentIdx + 1) / cards.length) * 100}%` }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.4rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        <span>{currentIdx + 1} / {cards.length}</span>
                        <span style={{ color: diffColor[card?.difficulty] || 'var(--text-muted)', fontWeight: 600 }}>
                            {card?.difficulty?.toUpperCase()}
                        </span>
                    </div>
                </div>

                {/* Card */}
                <div className="flashcard-scene" onClick={() => setFlipped(f => !f)}>
                    <div className={`flashcard ${flipped ? 'flipped' : ''}`}>
                        <div className="flashcard-face flashcard-front">
                            <div className="flashcard-label">Question</div>
                            <div className="flashcard-text">{card?.front}</div>
                            <div style={{ marginTop: '1.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tap to reveal answer</div>
                        </div>
                        <div className="flashcard-face flashcard-back">
                            <div className="flashcard-label" style={{ color: 'var(--accent-light)' }}>Answer</div>
                            <div className="flashcard-text">{card?.back}</div>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <div className="flashcard-nav">
                    <button className="btn btn-secondary" onClick={prev} disabled={currentIdx === 0}>
                        <ChevronLeft size={18} />
                    </button>
                    <div className="flashcard-count">
                        {Array.from({ length: Math.min(cards.length, 15) }).map((_, i) => (
                            <span key={i} onClick={() => { setCurrentIdx(i); setFlipped(false); }}
                                style={{
                                    display: 'inline-block', width: 8, height: 8, borderRadius: '50%', cursor: 'pointer',
                                    margin: '0 2px', background: i === currentIdx ? 'var(--primary)' : 'var(--border)', transition: 'all 0.2s'
                                }} />
                        ))}
                    </div>
                    <button className="btn btn-secondary" onClick={next} disabled={currentIdx === cards.length - 1}>
                        <ChevronRight size={18} />
                    </button>
                </div>

                {/* Difficulty guide */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '1.5rem', fontSize: '0.8rem' }}>
                    {[['Easy', 'var(--green)'], ['Medium', 'var(--yellow)'], ['Hard', 'var(--red)']].map(([label, color]) => (
                        <span key={label} style={{ color, opacity: 0.8 }}>● {label}</span>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FlashcardsPage;
