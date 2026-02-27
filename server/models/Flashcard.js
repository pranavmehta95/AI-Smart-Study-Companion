const mongoose = require('mongoose');

const flashcardSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', required: true },
    cards: [{
        front: { type: String, required: true },
        back: { type: String, required: true },
        difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' }
    }],
    lastReviewed: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Flashcard', flashcardSchema);
