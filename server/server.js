require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth.routes');
const documentRoutes = require('./routes/document.routes');
const aiRoutes = require('./routes/ai.routes');
const progressRoutes = require('./routes/progress.routes');

const app = express();

// Middleware
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/progress', progressRoutes);

// Health check
app.get('/api/health', (req, res) =>
    res.json({ status: 'OK', message: 'AI Study Companion API is running 🚀' }));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('✅ MongoDB Connected');

        // Serve static assets in production
        if (process.env.NODE_ENV === 'production') {
            const clientPath = path.join(__dirname, '../client/dist');
            app.use(express.static(clientPath));

            app.get('*any', (req, res) => {
                res.sendFile(path.join(clientPath, 'index.html'));
            });
        }

        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () =>
            console.log(`🚀 Server running on http://localhost:${PORT}`));
    })
    .catch(err => {
        console.error('❌ MongoDB connection error:', err.message);
        process.exit(1);
    });

module.exports = app;
