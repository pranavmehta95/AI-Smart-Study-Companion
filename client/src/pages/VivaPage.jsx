import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Send, Trophy } from 'lucide-react';
import MarkdownRenderer from '../components/MarkdownRenderer';

const VivaPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [sessionId, setSessionId] = useState(null);
    const [exchanges, setExchanges] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [isComplete, setIsComplete] = useState(false);
    const [overallScore, setOverallScore] = useState(0);

    useEffect(() => { startViva(); }, [id]);

    const startViva = async () => {
        setLoading(true);
        try {
            const { data } = await api.post(`/ai/viva/start/${id}`);
            setSessionId(data.sessionId);
            setCurrentQuestion(data.question);
            setExchanges([{ type: 'ai', text: data.question }]);
        } catch {
            toast.error('Failed to start viva session');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitAnswer = async () => {
        if (!answer.trim()) return;
        const userAnswer = answer;
        setAnswer('');
        setSubmitting(true);

        setExchanges(prev => [...prev, { type: 'user', text: userAnswer }]);

        try {
            const { data } = await api.post(`/ai/viva/${sessionId}/answer`, { answer: userAnswer });
            const newExchanges = [
                { type: 'feedback', text: data.feedback, score: data.score },
            ];
            if (data.idealAnswer) newExchanges.push({ type: 'ideal', text: `📚 Ideal Answer: ${data.idealAnswer}` });
            if (data.nextQuestion) newExchanges.push({ type: 'ai', text: data.nextQuestion });

            setExchanges(prev => [...prev, ...newExchanges]);
            if (data.nextQuestion) setCurrentQuestion(data.nextQuestion);
            if (data.isComplete) {
                setIsComplete(true);
                const session = await api.get(`/ai/viva/${sessionId}`);
                setOverallScore(session.data.session.overallScore);
            }
        } catch {
            toast.error('Failed to submit answer');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="loading-state" style={{ minHeight: 'calc(100vh - 70px)' }}>
            <div className="spinner" />
            <p style={{ color: 'var(--text-secondary)' }}>🎙️ Starting viva session...</p>
        </div>
    );

    return (
        <div className="page">
            <div className="viva-container">
                <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 className="page-title">🎙️ Viva Mode</h1>
                        <p className="page-subtitle">Oral examination simulation — answer verbally</p>
                    </div>
                    {isComplete && (
                        <div className="card" style={{ padding: '0.75rem 1.25rem', textAlign: 'center' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--yellow)' }}>{overallScore}/10</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Overall</div>
                        </div>
                    )}
                </div>

                <div className="card" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column' }}>
                    <div className="viva-chat" style={{ flex: 1 }}>
                        {exchanges.map((ex, i) => {
                            if (ex.type === 'ai') return (
                                <div key={i} className="viva-bubble ai">
                                    <div className="bubble-avatar ai-avatar">🤖</div>
                                    <div className="bubble-content ai-bubble"><MarkdownRenderer content={ex.text} /></div>
                                </div>
                            );
                            if (ex.type === 'user') return (
                                <div key={i} className="viva-bubble user">
                                    <div className="bubble-avatar user-avatar">👤</div>
                                    <div className="bubble-content user-bubble">{ex.text}</div>
                                </div>
                            );
                            if (ex.type === 'feedback') return (
                                <div key={i} className="feedback-box" style={{ marginLeft: '3.5rem' }}>
                                    <strong>Feedback (Score: {ex.score}/10):</strong>
                                    <MarkdownRenderer content={ex.text} />
                                </div>
                            );
                            if (ex.type === 'ideal') return (
                                <div key={i} style={{ marginLeft: '3.5rem', background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.2)', borderRadius: 'var(--radius-sm)', padding: '0.75rem', fontSize: '0.85rem', color: 'var(--accent-light)' }}>
                                    <MarkdownRenderer content={ex.text} />
                                </div>
                            );
                            return null;
                        })}

                        {submitting && (
                            <div className="viva-bubble ai">
                                <div className="bubble-avatar ai-avatar">🤖</div>
                                <div className="bubble-content ai-bubble" style={{ color: 'var(--text-muted)' }}>
                                    <span style={{ animation: 'blink 1s infinite' }}>Evaluating your answer...</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {!isComplete ? (
                        <div className="viva-input-area" style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: '1rem' }}>
                            <textarea className="form-textarea viva-input" rows={3}
                                placeholder="Type your answer here..." value={answer}
                                onChange={e => setAnswer(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) handleSubmitAnswer(); }}
                                disabled={submitting} style={{ resize: 'none' }} />
                            <button className="btn btn-primary" onClick={handleSubmitAnswer} disabled={submitting || !answer.trim()}
                                style={{ alignSelf: 'flex-end' }}>
                                <Send size={16} />
                            </button>
                        </div>
                    ) : (
                        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: '1rem', textAlign: 'center' }}>
                            <p style={{ color: 'var(--green)', fontWeight: 600, marginBottom: '1rem' }}>✅ Viva complete! Overall Score: {overallScore}/10</p>
                            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                                <button className="btn btn-primary" onClick={startViva}><Trophy size={14} /> New Viva</button>
                                <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>Dashboard</button>
                            </div>
                        </div>
                    )}
                </div>
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.75rem' }}>
                    Press Ctrl+Enter to submit your answer
                </p>
            </div>
        </div>
    );
};

export default VivaPage;
