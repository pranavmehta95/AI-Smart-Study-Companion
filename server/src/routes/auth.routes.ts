import express from 'express';
const router = express.Router();
import jwt from 'jsonwebtoken';
import User from '../models/User';
import admin from 'firebase-admin';
import authMiddleware from '../middleware/auth.middleware';

// Initialize Firebase Admin (only once)
if (!admin.apps.length) {
    try {
        const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n').replace(/"/g, '');
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: privateKey,
            }),
        });
        console.log('✅ Firebase Admin Initialized');
    } catch (err: any) {
        console.error('❌ Firebase Admin init error:', err.message);
    }
}

const generateToken = (id: string) => {
    return jwt.sign({ id }, process.env.JWT_SECRET as string, { expiresIn: '7d' });
};

// POST /api/auth/register
router.post('/register', async (req: any, res: any) => {
    console.log(`[Auth] Registration attempt for: ${req.body.email}`);
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            console.warn('[Auth] Registration failed: Missing fields');
            return res.status(400).json({ message: 'All fields required' });
        }

        const exists = await User.findOne({ email });
        if (exists) {
            console.warn(`[Auth] Registration failed: Email ${email} already exists`);
            return res.status(400).json({ message: 'Email already registered' });
        }

        const user = await User.create({ name, email, password });
        console.log(`[Auth] User created successfully: ${user.email}`);

        const token = generateToken(user._id.toString());

        res.status(201).json({
            token,
            user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar }
        });
    } catch (err: any) {
        console.error('[Auth] Registration error:', err.message);
        res.status(500).json({ message: err.message });
    }
});

// POST /api/auth/login
router.post('/login', async (req: any, res: any) => {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({ message: 'Email and password required' });

        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ message: 'Invalid credentials' });

        // Prevent Google-only accounts from using password login
        if (!user.password)
            return res.status(401).json({ message: 'This account uses Google sign-in. Please use "Continue with Google".' });

        const match = await (user as any).comparePassword(password);
        if (!match) return res.status(401).json({ message: 'Invalid credentials' });

        const token = generateToken(user._id.toString());
        res.json({
            token,
            user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar }
        });
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/auth/google
router.post('/google', async (req: any, res: any) => {
    try {
        const { idToken } = req.body;
        if (!idToken) return res.status(400).json({ message: 'ID token required' });

        // Verify the Firebase ID token
        const decoded = await admin.auth().verifyIdToken(idToken);
        const { uid, email, name, picture } = decoded;

        if (!email) return res.status(400).json({ message: 'Could not retrieve email from Google account' });

        // Find existing user or create a new one
        let user = await User.findOne({ email });

        if (user) {
            // Update googleId and avatar if signing in via Google for the first time
            if (!user.googleId) {
                user.googleId = uid;
                user.avatar = picture || user.avatar;
                await user.save();
            }
        } else {
            // New Google user — create account without a password
            user = await User.create({
                name: name || email.split('@')[0],
                email,
                googleId: uid,
                avatar: picture || '',
            });
        }

        const token = generateToken(user._id.toString());
        res.json({
            token,
            user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar }
        });
    } catch (err: any) {
        if (err.code === 'auth/argument-error' || err.code === 'auth/id-token-expired') {
            return res.status(401).json({ message: 'Invalid or expired Google token' });
        }
        res.status(500).json({ message: err.message });
    }
});

// GET /api/auth/me
router.get('/me', authMiddleware, async (req: any, res: any) => {
    res.json({ user: { id: req.user._id, name: req.user.name, email: req.user.email, avatar: req.user.avatar } });
});

export default router;
