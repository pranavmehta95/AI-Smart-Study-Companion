const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    question: { type: String, required: true },
    type: { type: String, enum: ['mcq', 'short', 'long'], required: true },
    options: [{ type: String }],
    correctAnswer: { type: String },
    userAnswer: { type: String, default: '' },
    isCorrect: { type: Boolean, default: false },
    feedback: { type: String, default: '' }
});

const quizSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', required: true },
    questions: [questionSchema],
    score: { type: Number, default: 0 },
    totalQuestions: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
    weakTopics: [{ type: String }],
    completedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Quiz', quizSchema);
