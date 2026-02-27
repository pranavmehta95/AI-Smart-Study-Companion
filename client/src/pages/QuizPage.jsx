import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, ArrowRight, Trophy, RotateCcw } from 'lucide-react';

const QuizPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [quiz, setQuiz] = useState(null);
    const [currentQ, setCurrentQ] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [selected, setSelected] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => { generateQuiz(); }, [id]);

    const generateQuiz = async () => {
        setLoading(true);
        try {
            const { data } = await api.post(`/ai/quiz/${id}`);
            setQuiz(data.quiz);
            setAnswers(new Array(data.quiz.questions.length).fill(''));
            setCurrentQ(0); setSelected(null); setSubmitted(false); setResult(null);
        } catch {
            toast.error('Failed to generate quiz');
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (option) => {
        if (submitted) return;
        setSelected(option);
        const newAnswers = [...answers];
        newAnswers[currentQ] = option;
        setAnswers(newAnswers);
    };

    const handleNext = () => {
        if (currentQ < quiz.questions.length - 1) {
            setCurrentQ(currentQ + 1);
            setSelected(answers[currentQ + 1] || null);
        }
    };

    const handleSubmitQuiz = async () => {
        if (answers.some(a => !a)) return toast.error('Please answer all questions first');
        setSubmitting(true);
        try {
            const payload = answers.map((answer, questionIndex) => ({ questionIndex, answer }));
            const { data } = await api.post(`/ai/quiz/${quiz._id}/submit`, { answers: payload });
            setResult(data.quiz);
            setSubmitted(true);
        } catch {
            toast.error('Submission failed');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="loading-state" style={{ minHeight: 'calc(100vh - 70px)' }}>
            <div className="spinner" />
            <p style={{ color: 'var(--text-secondary)' }}>🤖 Generating quiz questions...</p>
        </div>
    );

    if (!quiz) return null;

    const q = quiz.questions[currentQ];
    const pct = Math.round(((currentQ + 1) / quiz.questions.length) * 100);

    if (submitted && result) {
        return (
            <div className="page">
                <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
                    <div className="card">
                        <div style={{ '--score-pct': `${result.percentage * 3.6}deg` }}>
                            <div className="result-circle" style={{ '--score-pct': `${result.percentage}%` }}>
                                <div className="result-score">{result.percentage}%</div>
                                <div className="result-label">Score</div>
                            </div>
                        </div>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                            {result.percentage >= 70 ? '🎉 Great job!' : result.percentage >= 50 ? '👍 Good effort!' : '📚 Keep studying!'}
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                            You got {result.score}/{result.totalQuestions} questions correct
                        </p>

                        {result.weakTopics?.length > 0 && (
                            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1.5rem', textAlign: 'left' }}>
                                <p style={{ fontWeight: 600, marginBottom: '0.5rem', color: '#fca5a5' }}>📌 Weak Topics to Review:</p>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                                    {result.weakTopics.map((t, i) => <span key={i} className="badge badge-red">{t}</span>)}
                                </div>
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <button className="btn btn-primary" onClick={generateQuiz}><RotateCcw size={14} /> New Quiz</button>
                            <button className="btn btn-secondary" onClick={() => navigate(`/viva/${id}`)}>🎙️ Try Viva</button>
                            <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>Dashboard</button>
                        </div>
                    </div>

                    {/* Question Review */}
                    <div style={{ marginTop: '2rem', textAlign: 'left' }}>
                        <h3 className="section-title">📋 Question Review</h3>
                        {result.questions?.map((q, i) => (
                            <div key={i} className="card" style={{ marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                                    {q.isCorrect ? <CheckCircle size={18} style={{ color: 'var(--green)' }} /> : <XCircle size={18} style={{ color: 'var(--red)' }} />}
                                    <p style={{ fontWeight: 500, fontSize: '0.9rem' }}>Q{i + 1}: {q.question}</p>
                                </div>
                                {q.userAnswer && <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Your answer: <em>{q.userAnswer}</em></p>}
                                <p style={{ fontSize: '0.82rem', color: 'var(--green)' }}>✓ {q.correctAnswer}</p>
                                {q.feedback && <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem', fontStyle: 'italic' }}>{q.feedback}</p>}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="page">
            <div className="quiz-container">
                <div className="page-header">
                    <h1 className="page-title">❓ Quiz</h1>
                    <p className="page-subtitle">Question {currentQ + 1} of {quiz.questions.length}</p>
                </div>

                <div className="quiz-progress" style={{ marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        <span>Progress</span><span>{pct}%</span>
                    </div>
                    <div className="progress-bar"><div className="progress-fill" style={{ width: `${pct}%` }} /></div>
                </div>

                <div className="question-card">
                    <div className="question-number">
                        {q.type === 'mcq' ? 'Multiple Choice' : q.type === 'short' ? 'Short Answer' : 'Long Answer'}
                    </div>
                    <p className="question-text">{q.question}</p>

                    {q.type === 'mcq' ? (
                        <div className="options-list">
                            {q.options.map((opt, i) => (
                                <button key={i} className={`option-btn ${selected === opt ? 'selected' : ''}`} onClick={() => handleSelect(opt)}>
                                    {opt}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <textarea className="form-textarea text-answer" rows={q.type === 'long' ? 6 : 3}
                            placeholder={q.type === 'short' ? 'Write a brief answer...' : 'Write a detailed answer...'}
                            value={answers[currentQ] || ''}
                            onChange={(e) => { const a = [...answers]; a[currentQ] = e.target.value; setAnswers(a); setSelected(e.target.value); }} />
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {Array.from({ length: quiz.questions.length }).map((_, i) => (
                                <button key={i} onClick={() => { setCurrentQ(i); setSelected(answers[i] || null); }}
                                    style={{
                                        width: 28, height: 28, borderRadius: '50%', border: 'none', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 600,
                                        background: answers[i] ? 'var(--primary)' : i === currentQ ? 'var(--bg-card-hover)' : 'var(--bg-overlay)',
                                        color: answers[i] || i === currentQ ? 'white' : 'var(--text-muted)', transition: 'all 0.2s'
                                    }}>
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                        {currentQ < quiz.questions.length - 1
                            ? <button className="btn btn-primary" onClick={handleNext}>Next <ArrowRight size={14} /></button>
                            : <button className="btn btn-accent" onClick={handleSubmitQuiz} disabled={submitting}>
                                {submitting ? 'Evaluating...' : <><Trophy size={14} /> Submit Quiz</>}
                            </button>
                        }
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuizPage;
