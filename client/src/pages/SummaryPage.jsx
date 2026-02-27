import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Sparkles, BookOpen, Hash, FileText, Search, Download } from 'lucide-react';

const SummaryPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [doc, setDoc] = useState(null);
    const [activeTab, setActiveTab] = useState('summary');
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResult, setSearchResult] = useState('');
    const [searching, setSearching] = useState(false);

    useEffect(() => {
        fetchDoc();
    }, [id]);

    const fetchDoc = async () => {
        try {
            const { data } = await api.get(`/documents/${id}`);
            setDoc(data.document);
            if (!data.document.summary) await generateContent(data.document);
        } catch {
            toast.error('Failed to load document');
            navigate('/dashboard');
        } finally {
            setLoading(false);
        }
    };

    const generateContent = async (document) => {
        setGenerating(true);
        try {
            const { data } = await api.post(`/ai/summarize/${id}`);
            setDoc(prev => ({ ...prev, summary: data.summary, keywords: data.keywords, notes: data.notes }));
            toast.success('AI content generated!');
        } catch {
            toast.error('AI generation failed. Check your Gemini API key.');
        } finally {
            setGenerating(false);
        }
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        setSearching(true);
        try {
            const { data } = await api.post(`/ai/search/${id}`, { query: searchQuery });
            setSearchResult(data.result);
        } catch {
            toast.error('Search failed');
        } finally {
            setSearching(false);
        }
    };

    const renderMarkdown = (text) => {
        if (!text) return null;
        const lines = text.split('\n');
        return lines.map((line, i) => {
            if (line.startsWith('### ')) return <h3 key={i} style={{ marginTop: '1.25rem', marginBottom: '0.5rem', fontSize: '1rem', color: 'var(--primary-light)' }}>{line.slice(4)}</h3>;
            if (line.startsWith('## ')) return <h2 key={i} style={{ marginTop: '1.5rem', marginBottom: '0.5rem', fontSize: '1.15rem' }}>{line.slice(3)}</h2>;
            if (line.startsWith('# ')) return <h1 key={i} style={{ marginTop: '1.5rem', marginBottom: '0.75rem', fontSize: '1.3rem' }}>{line.slice(2)}</h1>;
            if (line.startsWith('**') && line.endsWith('**')) return <p key={i} style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>{line.slice(2, -2)}</p>;
            if (line.startsWith('- ') || line.startsWith('* ')) return <li key={i} style={{ color: 'var(--text-secondary)', marginBottom: '0.3rem', marginLeft: '1rem' }}>{line.slice(2)}</li>;
            if (line.match(/^\d+\. /)) return <li key={i} style={{ color: 'var(--text-secondary)', marginBottom: '0.3rem', marginLeft: '1rem' }}>{line.replace(/^\d+\. /, '')}</li>;
            if (!line.trim()) return <br key={i} />;
            return <p key={i} style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem', lineHeight: 1.7 }}>{line}</p>;
        });
    };

    if (loading || generating) {
        return (
            <div className="loading-state" style={{ minHeight: 'calc(100vh - 70px)' }}>
                <div className="spinner" />
                <p style={{ color: 'var(--text-secondary)' }}>{generating ? '✨ Generating AI summary, notes & keywords...' : 'Loading document...'}</p>
            </div>
        );
    }

    const tabs = [
        { id: 'summary', label: '📄 Summary', icon: Sparkles },
        { id: 'notes', label: '📝 Notes', icon: BookOpen },
        { id: 'keywords', label: '🔑 Keywords', icon: Hash },
        { id: 'search', label: '🔍 Search', icon: Search },
    ];

    return (
        <div className="page">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 className="page-title">📄 AI Analysis</h1>
                    <p className="page-subtitle">{doc?.originalName}</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button className="btn btn-secondary" onClick={() => navigate(`/quiz/${id}`)}>❓ Take Quiz</button>
                    <button className="btn btn-secondary" onClick={() => navigate(`/viva/${id}`)}>🎙️ Viva Mode</button>
                    <button className="btn btn-secondary" onClick={() => navigate(`/flashcards/${id}`)}>🃏 Flashcards</button>
                    <button className="btn btn-ghost" onClick={() => { setGenerating(true); generateContent(doc); }}>
                        <Sparkles size={14} /> Regenerate
                    </button>
                </div>
            </div>

            <div className="card">
                <div className="summary-tabs">
                    {tabs.map(t => (
                        <button key={t.id} className={`tab-btn ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)}>
                            {t.label}
                        </button>
                    ))}
                </div>

                {activeTab === 'summary' && (
                    <div className="markdown-content">{renderMarkdown(doc?.summary || 'No summary available. Click Regenerate.')}</div>
                )}
                {activeTab === 'notes' && (
                    <div className="markdown-content">{renderMarkdown(doc?.notes || 'No notes available. Click Regenerate.')}</div>
                )}
                {activeTab === 'keywords' && (
                    <div className="keywords-grid">
                        {doc?.keywords?.length > 0
                            ? doc.keywords.map((kw, i) => <span key={i} className="keyword-chip">#{kw}</span>)
                            : <p style={{ color: 'var(--text-secondary)' }}>No keywords. Click Regenerate.</p>
                        }
                    </div>
                )}
                {activeTab === 'search' && (
                    <div>
                        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            <input className="form-input" placeholder="Ask anything about this document..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSearch()} />
                            <button className="btn btn-primary" onClick={handleSearch} disabled={searching}>
                                {searching ? '...' : <><Search size={16} /> Search</>}
                            </button>
                        </div>
                        {searchResult && (
                            <div className="card" style={{ background: 'var(--bg-overlay)' }}>
                                <div className="markdown-content">{renderMarkdown(searchResult)}</div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SummaryPage;
