import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Sparkles, BookOpen, Hash, Search } from 'lucide-react';
import MarkdownRenderer from '../components/MarkdownRenderer';
import type { Document, DocumentResponse, SummaryResponse } from '../types';

const SummaryPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [doc, setDoc] = useState<Document | null>(null);
  const [activeTab, setActiveTab] = useState('summary');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState('');
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    void fetchDoc();
  }, [id]);

  const fetchDoc = async () => {
    try {
      const { data } = await api.get<DocumentResponse>(`/documents/${id}`);
      setDoc(data.document);
      if (!data.document.summary) await generateContent();
    } catch {
      toast.error('Failed to load document');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const generateContent = async () => {
    setGenerating(true);
    try {
      const { data } = await api.post<SummaryResponse>(`/ai/summarize/${id}`);
      setDoc(prev => prev ? { ...prev, summary: data.summary, keywords: data.keywords, notes: data.notes } : prev);
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
      const { data } = await api.post<{ result: string }>(`/ai/search/${id}`, { query: searchQuery });
      setSearchResult(data.result);
    } catch {
      toast.error('Search failed');
    } finally {
      setSearching(false);
    }
  };

  if (loading || generating) {
    return (
      <div className="loading-state" style={{ minHeight: 'calc(100vh - 70px)' }}>
        <div className="spinner" />
        <p style={{ color: 'var(--text-secondary)' }}>
          {generating ? '✨ Generating AI summary, notes & keywords...' : 'Loading document...'}
        </p>
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
          <button className="btn btn-ghost" onClick={() => { void generateContent(); }}>
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
          <MarkdownRenderer content={doc?.summary || 'No summary available. Click Regenerate.'} />
        )}
        {activeTab === 'notes' && (
          <MarkdownRenderer content={doc?.notes || 'No notes available. Click Regenerate.'} />
        )}
        {activeTab === 'keywords' && (
          <div className="keywords-grid">
            {(doc?.keywords?.length ?? 0) > 0
              ? doc!.keywords.map((kw, i) => <span key={i} className="keyword-chip">#{kw}</span>)
              : <p style={{ color: 'var(--text-secondary)' }}>No keywords. Click Regenerate.</p>
            }
          </div>
        )}
        {activeTab === 'search' && (
          <div>
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <input className="form-input" placeholder="Ask anything about this document..."
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && void handleSearch()} />
              <button className="btn btn-primary" onClick={() => void handleSearch()} disabled={searching}>
                {searching ? '...' : <><Search size={16} /> Search</>}
              </button>
            </div>
            {searchResult && (
              <div className="card" style={{ background: 'var(--bg-overlay)' }}>
                <MarkdownRenderer content={searchResult} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SummaryPage;
