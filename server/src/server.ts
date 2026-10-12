import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';

import authRoutes from './routes/auth.routes';
import documentRoutes from './routes/document.routes';
import aiRoutes from './routes/ai.routes';
import progressRoutes from './routes/progress.routes';

const app = express();

// Request logging for debugging
app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`[Request] ${req.method} ${req.url}`);
    next();
});

// Middleware
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
    process.env.FRONTEND_URL, // e.g., https://ai-smart-study.vercel.app
].filter(Boolean) as string[];

app.use(cors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        // Allow same-origin, allowed origins, Vercel preview deployments, and any localhost in development
        const isDevelopment = process.env.NODE_ENV !== 'production';
        const isLocalhost = origin && (origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1'));
        
        if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app') || (isDevelopment && isLocalhost)) {
            callback(null, true);
        } else {
            console.log(`[CORS] Blocked origin: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/progress', progressRoutes);

// Health check
app.get('/api/health', (req: Request, res: Response) =>
    res.json({ status: 'OK', message: 'AI Study Companion API is running 🚀' }));

// Connect to MongoDB
const PORT = process.env.PORT || 5000;
console.log('🔍 Attempting to connect to MongoDB...');
console.log('URI (password hidden):', process.env.MONGO_URI?.replace(/:[^:@]+@/, ':****@'));

mongoose.connect(process.env.MONGO_URI as string)
    .then(() => {
        console.log('✅ MongoDB Connected');
        app.listen(PORT, () =>
            console.log(`🚀 Server running on port ${PORT}`));
    })
    .catch((err: any) => {
        console.error('❌ Database/Server Error:', err.message);
        console.error('Full error:', err);
        process.exit(1);
    });

export default app;
