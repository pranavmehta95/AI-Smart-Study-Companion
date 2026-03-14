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

// Request logging for debugging
app.use((req, res, next) => {
    console.log(`[Request] ${req.method} ${req.url}`);
    next();
});

// Middleware
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
    process.env.RENDER_EXTERNAL_URL, // Auto-added by Render if they use the web service
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        // Allow same-origin or allowed origins
        if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.onrender.com')) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
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

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
    const clientPath = path.join(__dirname, '../client/dist');
    app.use(express.static(clientPath));

    // Express 5 catch-all syntax requires a named parameter
    app.get('/:any*', (req, res, next) => {
        if (req.url.startsWith('/api')) return next();
        res.sendFile(path.join(clientPath, 'index.html'));
    });
}

// Connect to MongoDB
const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('✅ MongoDB Connected');
        app.listen(PORT, '0.0.0.0', () =>
            console.log(`🚀 Server running on port ${PORT}`));
    })
    .catch(err => {
        console.error('❌ Database/Server Error:', err.message);
        process.exit(1);
    });

module.exports = app;
