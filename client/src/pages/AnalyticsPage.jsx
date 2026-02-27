import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { BookOpen, Brain } from 'lucide-react';
import MarkdownRenderer from '../components/MarkdownRenderer';

const AnalyticsPage = () => {
    const navigate = useNavigate();
    const [dashboard, setDashboard] = useState(null);
    const [analytics, setAnalytics] = useState(null);
    const [studyPlan, setStudyPlan] = useState('');
    const [loading, setLoading] = useState(true);
    const [loadingPlan, setLoadingPlan] = useState(false);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const [dashRes, analyticsRes] = await Promise.all([
                api.get('/progress/dashboard'),
                api.get('/progress/analytics')
            ]);
            setDashboard(dashRes.data);
            setAnalytics(analyticsRes.data);
        } catch {
            toast.error('Failed to load analytics');
        } finally {
            setLoading(false);
        }
    };

    const fetchStudyPlan = async () => {
        setLoadingPlan(true);
        try {
            const { data } = await api.get('/progress/study-plan');
            setStudyPlan(data.studyPlan);
        } catch {
            toast.error('Failed to generate study plan');
        } finally {
            setLoadingPlan(false);
        }
    };



    if (loading) return <div className="loading-state" style={{ minHeight: 'calc(100vh - 70px)' }}><div className="spinner" /></div>;

    const quizHistory = analytics?.quizHistory || [];
    const chartData = quizHistory.slice(-10).map((q, i) => ({
        name: `Q${i + 1}`, score: q.score, correct: q.correct, total: q.total
    }));

    return (
        <div className="page">
            <div className="page-header">
                <h1 className="page-title">📊 Analytics & Progress</h1>
                <p className="page-subtitle">Track your learning journey and identify areas to improve</p>
            </div>

            {/* Stats Row */}
            <div className="stats-grid" style={{ marginBottom: '2rem' }}>
                {[
                    { label: 'Avg Quiz Score', value: `${dashboard?.stats.avgQuizScore || 0}%`, icon: '🎯', color: 'var(--primary)' },
                    { label: 'Total Quizzes', value: dashboard?.stats.totalQuizzes || 0, icon: '❓', color: 'var(--accent)' },
                    { label: 'Flashcards', value: dashboard?.stats.totalFlashcards || 0, icon: '🃏', color: 'var(--green)' },
                    { label: 'Documents', value: dashboard?.stats.totalDocuments || 0, icon: '📄', color: 'var(--yellow)' },
                ].map(s => (
                    <div key={s.label} className="stat-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
                                <div className="stat-label">{s.label}</div>
                            </div>
                            <div style={{ fontSize: '1.4rem' }}>{s.icon}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-2" style={{ marginBottom: '2rem' }}>
                {/* Quiz History Chart */}
                <div className="chart-card">
                    <h3 className="section-title">Quiz Score History</h3>
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={220}>
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                                <YAxis domain={[0, 100]} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)' }} />
                                <Line type="monotone" dataKey="score" stroke="#a78bfa" strokeWidth={2} dot={{ fill: '#a78bfa', r: 4 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="empty-state" style={{ padding: '2rem' }}>
                            <p>No quiz data yet. Take a quiz to see your progress!</p>
                        </div>
                    )}
                </div>

                {/* Weak Topics */}
                <div className="chart-card">
                    <h3 className="section-title">⚠️ Weak Topics</h3>
                    {dashboard?.weakTopics?.length > 0 ? (
                        <div>
                            {dashboard.weakTopics.map((topic, i) => (
                                <div key={i} className="score-bar">
                                    <div className="score-label">{topic}</div>
                                    <div className="progress-bar" style={{ flex: 1 }}>
                                        <div className="progress-fill" style={{ width: `${100 - (i * 15)}%`, background: `linear-gradient(90deg, var(--red), var(--yellow))` }} />
                                    </div>
                                    <div className="score-pct">{100 - (i * 15)}% weak</div>
                                </div>
                            ))}
                            <button className="btn btn-secondary btn-sm" style={{ marginTop: '1rem', width: '100%', justifyContent: 'center' }}
                                onClick={fetchStudyPlan} disabled={loadingPlan}>
                                {loadingPlan ? '🤖 Generating...' : '🧠 Generate AI Study Plan'}
                            </button>
                        </div>
                    ) : (
                        <div className="empty-state" style={{ padding: '2rem' }}>
                            <p>No weak topics identified yet. Complete some quizzes!</p>
                        </div>
                    )}
                </div>
            </div>

            {/* AI Study Plan */}
            {studyPlan && (
                <div className="card">
                    <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Brain size={18} style={{ color: 'var(--primary-light)' }} /> AI Personalized Study Plan
                    </h3>
                    <MarkdownRenderer content={studyPlan} />
                </div>
            )}
        </div>
    );
};

export default AnalyticsPage;
