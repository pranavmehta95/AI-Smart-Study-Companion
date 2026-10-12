import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    extractedText: { type: String, default: '' },
    fileSize: { type: Number, default: 0 },
    mimeType: { type: String, default: 'application/pdf' },
    summary: { type: String, default: '' },
    keywords: [{ type: String }],
    notes: { type: String, default: '' },
    uploadedAt: { type: Date, default: Date.now }
});

export default mongoose.model('Document', documentSchema);
