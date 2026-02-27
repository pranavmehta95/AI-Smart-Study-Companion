import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Upload, FileText, BookOpen, MessageSquare, Layers, BarChart2, Trash2, Plus } from 'lucide-react';

const DashboardPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [dashRes, docsRes] = await Promise.all([
                api.get('/progress/dashboard'),
                api.get('/documents')
            ]);
            setStats(dashRes.data.stats);
            setDocuments(docsRes.data.documents);
        } catch {
            toast.error('Failed to load dashboard');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this document?')) return;
        try {
            await api.delete(`/documents/${id}`);
            setDocuments(d => d.filter(doc => doc._id !== id));
            toast.success('Document deleted');
        } catch {
            toast.error('Delete failed');
        }
    };

    const statCards = stats ? [
        { label: 'Documents', value: stats.totalDocuments, icon: '📄', color: '#7c3aed' },
        { label: 'Quizzes', value: stats.totalQuizzes, icon: '❓', color: '#06b6d4' },
        { label: 'Flashcards', value: stats.totalFlashcards, icon: '🃏', color: '#10b981' },
        { label: 'Avg Score', value: `${stats.avgQuizScore}%`, icon: '🏆', color: '#f59e0b' },
    ] : [];

    if (loading) return <div className="loading-state"><div className="spinner" /></div>;

    return (
        <div className="page">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 className="page-title">👋 Hey, {user?.name}!</h1>
                    <p className="page-subtitle">Here's your study overview.</p>
                </div>
                <Link to="/upload" className="btn btn-primary"><Plus size={16} /> Upload Document</Link>
            </div>

            {/* Stats */}
            <div className="stats-grid" style={{ marginBottom: '2.5rem' }}>
                {statCards.map(s => (
                    <div key={s.label} className="stat-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
                                <div className="stat-label">{s.label}</div>
                            </div>
                            <div className="stat-icon" style={{ background: `${s.color}22`, fontSize: '1.4rem' }}>{s.icon}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Documents */}
            <div style={{ marginBottom: '2rem' }}>
                <h2 className="section-title">📚 Your Documents</h2>
                {documents.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">📤</div>
                        <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>No documents yet</p>
                        <p style={{ fontSize: '0.875rem', marginBottom: '1.5rem' }}>Upload a PDF or text file to get started</p>
                        <Link to="/upload" className="btn btn-primary"><Upload size={14} /> Upload First Document</Link>
                    </div>
                ) : (
                    <div className="docs-grid">
                        {documents.map(doc => (
                            <div key={doc._id} className="doc-card">
                                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                                    <span style={{ fontSize: '1.5rem' }}>📄</span>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div className="doc-title">{doc.originalName}</div>
                                        <div className="doc-meta">{new Date(doc.uploadedAt).toLocaleDateString()} · {(doc.fileSize / 1024).toFixed(0)} KB</div>
                                    </div>
                                </div>
                                <div className="doc-actions">
                                    <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/summary/${doc._id}`)}>
                                        <BookOpen size={12} /> Summary
                                    </button>
                                    <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/quiz/${doc._id}`)}>
                                        <FileText size={12} /> Quiz
                                    </button>
                                    <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/viva/${doc._id}`)}>
                                        <MessageSquare size={12} /> Viva
                                    </button>
                                    <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/flashcards/${doc._id}`)}>
                                        <Layers size={12} /> Cards
                                    </button>
                                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(doc._id)}>
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashboardPage;
