import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Upload, File, X, CheckCircle } from 'lucide-react';

const UploadPage = () => {
    const navigate = useNavigate();
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);

    const onDrop = useCallback((accepted) => {
        if (accepted.length > 0) setFile(accepted[0]);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop, maxSize: 10 * 1024 * 1024,
        accept: { 'application/pdf': ['.pdf'], 'text/plain': ['.txt'] },
        multiple: false
    });

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true);
        setProgress(0);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const { data } = await api.post('/documents/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (e) => setProgress(Math.round((e.loaded * 100) / e.total))
            });
            toast.success('Document uploaded successfully!');
            navigate(`/summary/${data.document._id}`);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="page">
            <div className="page-header">
                <h1 className="page-title">📤 Upload Document</h1>
                <p className="page-subtitle">Upload a PDF or text file to start using AI features</p>
            </div>

            <div style={{ maxWidth: 600, margin: '0 auto' }}>
                <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
                    <input {...getInputProps()} />
                    <div className="dropzone-icon">
                        {file ? <CheckCircle style={{ color: 'var(--green)' }} size={48} /> : <Upload size={48} />}
                    </div>
                    {file ? (
                        <>
                            <p className="dropzone-title" style={{ color: 'var(--green)' }}>{file.name}</p>
                            <p className="dropzone-hint">{(file.size / 1024).toFixed(0)} KB — Click to change file</p>
                        </>
                    ) : (
                        <>
                            <p className="dropzone-title">{isDragActive ? 'Drop your file here' : 'Drag & drop your document'}</p>
                            <p className="dropzone-hint">or click to browse — PDF, TXT up to 10MB</p>
                        </>
                    )}
                </div>

                {file && (
                    <div className="card" style={{ marginTop: '1rem', flexDirection: 'row', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <File size={24} style={{ color: 'var(--primary-light)' }} />
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{file.name}</div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{(file.size / 1024).toFixed(0)} KB</div>
                        </div>
                        <button className="btn-ghost" onClick={(e) => { e.stopPropagation(); setFile(null); }}>
                            <X size={16} />
                        </button>
                    </div>
                )}

                {uploading && (
                    <div style={{ marginTop: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            <span>Uploading & extracting text...</span>
                            <span>{progress}%</span>
                        </div>
                        <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${progress}%` }} />
                        </div>
                    </div>
                )}

                <button className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center', marginTop: '1.5rem' }}
                    onClick={handleUpload} disabled={!file || uploading}>
                    {uploading ? 'Processing...' : <><Upload size={18} /> Upload & Analyze</>}
                </button>

                <div style={{ marginTop: '2rem' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center', marginBottom: '1rem' }}>After uploading, you can:</p>
                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        {['📄 AI Summary', '❓ Generate Quiz', '🎙️ Viva Mode', '🃏 Flashcards', '🔍 Search'].map(f => (
                            <span key={f} className="badge badge-purple">{f}</span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UploadPage;
