const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const Quiz = require('../models/Quiz');
const Document = require('../models/Document');
const Flashcard = require('../models/Flashcard');
const VivaSession = require('../models/VivaSession');
const geminiService = require('../services/gemini.service');

// GET /api/progress/dashboard
router.get('/dashboard', authMiddleware, async (req, res) => {
    try {
        const userId = req.user._id;

        const [quizzes, documents, flashcards, vivaSessions] = await Promise.all([
            Quiz.find({ userId }).sort({ completedAt: -1 }),
            Document.find({ userId }).select('-extractedText').sort({ uploadedAt: -1 }),
            Flashcard.find({ userId }),
            VivaSession.find({ userId })
        ]);

        const completedQuizzes = quizzes.filter(q => q.percentage > 0);
        const avgScore = completedQuizzes.length
            ? Math.round(completedQuizzes.reduce((s, q) => s + q.percentage, 0) / completedQuizzes.length)
            : 0;

        const allWeakTopics = quizzes.flatMap(q => q.weakTopics || []);
        const weakTopicCount = {};
        allWeakTopics.forEach(t => weakTopicCount[t] = (weakTopicCount[t] || 0) + 1);
        const weakTopics = Object.entries(weakTopicCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([topic]) => topic);

        const recentScores = completedQuizzes.slice(0, 7).map(q => ({
            date: q.completedAt,
            score: q.percentage,
            docName: q.documentId
        }));

        res.json({
            stats: {
                totalDocuments: documents.length,
                totalQuizzes: completedQuizzes.length,
                totalFlashcards: flashcards.reduce((s, f) => s + f.cards.length, 0),
                totalViva: vivaSessions.filter(v => v.overallScore > 0).length,
                avgQuizScore: avgScore
            },
            recentDocuments: documents.slice(0, 5),
            weakTopics,
            recentScores
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/progress/study-plan
router.get('/study-plan', authMiddleware, async (req, res) => {
    try {
        const quizzes = await Quiz.find({ userId: req.user._id });
        const allWeakTopics = quizzes.flatMap(q => q.weakTopics || []);

        if (allWeakTopics.length === 0)
            return res.json({ studyPlan: 'Complete some quizzes first to generate a personalized study plan!' });

        const uniqueWeak = [...new Set(allWeakTopics)].slice(0, 5);
        const studyPlan = await geminiService.generateStudyPlan(uniqueWeak);
        res.json({ studyPlan, weakTopics: uniqueWeak });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/progress/analytics
router.get('/analytics', authMiddleware, async (req, res) => {
    try {
        const userId = req.user._id;
        const quizzes = await Quiz.find({ userId, percentage: { $gt: 0 } }).sort({ completedAt: 1 });

        const quizHistory = quizzes.map(q => ({
            date: q.completedAt,
            score: q.percentage,
            total: q.totalQuestions,
            correct: q.score
        }));

        const quizzesByDoc = {};
        for (const q of quizzes) {
            const key = q.documentId.toString();
            if (!quizzesByDoc[key]) quizzesByDoc[key] = [];
            quizzesByDoc[key].push(q.percentage);
        }

        res.json({ quizHistory, quizzesByDoc });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
