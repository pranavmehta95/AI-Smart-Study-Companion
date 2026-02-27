const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const Document = require('../models/Document');
const Quiz = require('../models/Quiz');
const Flashcard = require('../models/Flashcard');
const VivaSession = require('../models/VivaSession');
const geminiService = require('../services/gemini.service');

// POST /api/ai/summarize/:docId
router.post('/summarize/:docId', authMiddleware, async (req, res) => {
    try {
        const doc = await Document.findOne({ _id: req.params.docId, userId: req.user._id });
        if (!doc) return res.status(404).json({ message: 'Document not found' });
        if (!doc.extractedText) return res.status(400).json({ message: 'No text to summarize' });

        const [summary, keywords, notes] = await Promise.all([
            geminiService.generateSummary(doc.extractedText),
            geminiService.extractKeywords(doc.extractedText),
            geminiService.generateNotes(doc.extractedText)
        ]);

        doc.summary = summary;
        doc.keywords = keywords;
        doc.notes = notes;
        await doc.save();

        res.json({ summary, keywords, notes });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/ai/quiz/:docId
router.post('/quiz/:docId', authMiddleware, async (req, res) => {
    try {
        const doc = await Document.findOne({ _id: req.params.docId, userId: req.user._id });
        if (!doc) return res.status(404).json({ message: 'Document not found' });

        const quizData = await geminiService.generateQuiz(doc.extractedText);

        const quiz = await Quiz.create({
            userId: req.user._id,
            documentId: doc._id,
            questions: quizData.questions,
            totalQuestions: quizData.questions.length
        });

        res.json({ quiz });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/ai/quiz/:quizId/submit
router.post('/quiz/:quizId/submit', authMiddleware, async (req, res) => {
    try {
        const { answers } = req.body; // [{ questionIndex, answer }]
        const quiz = await Quiz.findOne({ _id: req.params.quizId, userId: req.user._id }).populate('documentId');
        if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

        let score = 0;
        const evaluations = [];

        for (const ans of answers) {
            const q = quiz.questions[ans.questionIndex];
            if (!q) continue;

            if (q.type === 'mcq') {
                const isCorrect = ans.answer.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
                q.userAnswer = ans.answer;
                q.isCorrect = isCorrect;
                q.feedback = isCorrect ? 'Correct!' : `Correct answer: ${q.correctAnswer}`;
                if (isCorrect) score++;
                evaluations.push({ questionIndex: ans.questionIndex, isCorrect, feedback: q.feedback });
            } else {
                const eval_ = await geminiService.evaluateQuizAnswer(q.question, ans.answer, q.correctAnswer);
                q.userAnswer = ans.answer;
                q.isCorrect = eval_.isCorrect;
                q.feedback = eval_.feedback;
                if (eval_.isCorrect) score++;
                evaluations.push({ questionIndex: ans.questionIndex, isCorrect: eval_.isCorrect, feedback: eval_.feedback });
            }
        }

        quiz.score = score;
        quiz.percentage = Math.round((score / quiz.totalQuestions) * 100);
        quiz.completedAt = new Date();

        const incorrectQs = quiz.questions.filter(q => !q.isCorrect).map(q => q.question);
        if (incorrectQs.length > 0) {
            const keywords = await geminiService.extractKeywords(incorrectQs.join(' '));
            quiz.weakTopics = keywords.slice(0, 5);
        }

        await quiz.save();
        res.json({ quiz, evaluations });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/ai/quiz/:quizId
router.get('/quiz/:quizId', authMiddleware, async (req, res) => {
    try {
        const quiz = await Quiz.findOne({ _id: req.params.quizId, userId: req.user._id });
        if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
        res.json({ quiz });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/ai/viva/start/:docId
router.post('/viva/start/:docId', authMiddleware, async (req, res) => {
    try {
        const doc = await Document.findOne({ _id: req.params.docId, userId: req.user._id });
        if (!doc) return res.status(404).json({ message: 'Document not found' });

        const session = await VivaSession.create({
            userId: req.user._id,
            documentId: doc._id,
            exchanges: []
        });

        const question = await geminiService.generateVivaQuestion(doc.extractedText);
        session.exchanges.push({ question, answer: '', feedback: '' });
        await session.save();

        res.json({ sessionId: session._id, question });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/ai/viva/:sessionId/answer
router.post('/viva/:sessionId/answer', authMiddleware, async (req, res) => {
    try {
        const { answer } = req.body;
        const session = await VivaSession.findOne({ _id: req.params.sessionId, userId: req.user._id }).populate('documentId');
        if (!session) return res.status(404).json({ message: 'Viva session not found' });

        const lastExchange = session.exchanges[session.exchanges.length - 1];
        const evaluation = await geminiService.evaluateVivaAnswer(
            lastExchange.question, answer, session.documentId.extractedText
        );

        lastExchange.answer = answer;
        lastExchange.feedback = evaluation.feedback;
        lastExchange.score = evaluation.score;

        const prevQuestions = session.exchanges.map(e => e.question);
        let nextQuestion = null;

        if (session.exchanges.length < 5) {
            nextQuestion = await geminiService.generateVivaQuestion(session.documentId.extractedText, prevQuestions);
            session.exchanges.push({ question: nextQuestion, answer: '', feedback: '' });
        } else {
            const totalScore = session.exchanges.reduce((sum, e) => sum + (e.score || 0), 0);
            session.overallScore = Math.round(totalScore / session.exchanges.length);
            session.completedAt = new Date();
        }

        await session.save();
        res.json({ feedback: evaluation.feedback, idealAnswer: evaluation.idealAnswer, score: evaluation.score, nextQuestion, isComplete: session.exchanges.length >= 5 && !nextQuestion });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/ai/viva/:sessionId
router.get('/viva/:sessionId', authMiddleware, async (req, res) => {
    try {
        const session = await VivaSession.findOne({ _id: req.params.sessionId, userId: req.user._id });
        if (!session) return res.status(404).json({ message: 'Session not found' });
        res.json({ session });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/ai/flashcards/:docId
router.post('/flashcards/:docId', authMiddleware, async (req, res) => {
    try {
        const doc = await Document.findOne({ _id: req.params.docId, userId: req.user._id });
        if (!doc) return res.status(404).json({ message: 'Document not found' });

        const flashcardData = await geminiService.generateFlashcards(doc.extractedText);
        const existing = await Flashcard.findOne({ userId: req.user._id, documentId: doc._id });

        let flashcard;
        if (existing) {
            existing.cards = flashcardData.cards;
            existing.lastReviewed = new Date();
            flashcard = await existing.save();
        } else {
            flashcard = await Flashcard.create({
                userId: req.user._id,
                documentId: doc._id,
                cards: flashcardData.cards
            });
        }

        res.json({ flashcard });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/ai/flashcards/:docId
router.get('/flashcards/:docId', authMiddleware, async (req, res) => {
    try {
        const flashcard = await Flashcard.findOne({ userId: req.user._id, documentId: req.params.docId });
        if (!flashcard) return res.status(404).json({ message: 'No flashcards found for this document' });
        res.json({ flashcard });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/ai/search/:docId
router.post('/search/:docId', authMiddleware, async (req, res) => {
    try {
        const { query } = req.body;
        if (!query) return res.status(400).json({ message: 'Query required' });

        const doc = await Document.findOne({ _id: req.params.docId, userId: req.user._id });
        if (!doc) return res.status(404).json({ message: 'Document not found' });

        const result = await geminiService.semanticSearch(doc.extractedText, query);
        res.json({ result });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
