const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const authMiddleware = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');
const Document = require('../models/Document');
const pdfService = require('../services/pdf.service');

// POST /api/documents/upload
router.post('/upload', authMiddleware, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

        const filePath = req.file.path;
        const extractedText = await pdfService.extractText(filePath);

        const doc = await Document.create({
            userId: req.user._id,
            filename: req.file.filename,
            originalName: req.file.originalname,
            extractedText,
            fileSize: req.file.size,
            mimeType: req.file.mimetype
        });

        res.status(201).json({ message: 'File uploaded successfully', document: doc });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/documents
router.get('/', authMiddleware, async (req, res) => {
    try {
        const docs = await Document.find({ userId: req.user._id })
            .sort({ uploadedAt: -1 })
            .select('-extractedText');
        res.json({ documents: docs });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/documents/:id
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const doc = await Document.findOne({ _id: req.params.id, userId: req.user._id });
        if (!doc) return res.status(404).json({ message: 'Document not found' });
        res.json({ document: doc });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// DELETE /api/documents/:id
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const doc = await Document.findOne({ _id: req.params.id, userId: req.user._id });
        if (!doc) return res.status(404).json({ message: 'Document not found' });

        const filePath = path.join(__dirname, '../uploads', doc.filename);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

        await doc.deleteOne();
        res.json({ message: 'Document deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
