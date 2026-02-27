const mongoose = require('mongoose');

const vivaSessionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', required: true },
    exchanges: [{
        question: { type: String, required: true },
        answer: { type: String, default: '' },
        feedback: { type: String, default: '' },
        score: { type: Number, default: 0 }
    }],
    overallScore: { type: Number, default: 0 },
    completedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('VivaSession', vivaSessionSchema);
