# AI Smart Study Companion 🧠

An AI-powered full-stack web application that transforms your study materials into interactive learning experiences.

## Features

| Feature | Description |
|---------|-------------|
| 📄 AI Summaries | Upload PDFs → get instant summaries, structured notes, and keywords |
| ❓ Smart Quiz | Auto-generated MCQ, short, and long-answer questions with evaluation |
| 🎙️ Viva Mode | Oral exam simulation with AI questions and instant feedback |
| 🃏 Flashcards | Flip-card active recall with difficulty tracking |
| 📊 Analytics | Progress dashboard, weak topic detection, AI study plan |
| 🔍 Semantic Search | Ask questions directly about your uploaded documents |

## Tech Stack

**Frontend:** React + Vite, React Router, Framer Motion, Recharts, Lucide  
**Backend:** Node.js, Express, MongoDB (Mongoose), JWT Auth  
**AI:** Google Gemini 1.5 Flash API  
**File Handling:** Multer, pdf-parse

## Setup Instructions

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Google Gemini API Key ([Get one free](https://aistudio.google.com/))

### 1. Backend Setup

```bash
cd server
npm install
```

Edit `server/.env`:
```
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_secret_key_here
GEMINI_API_KEY=your_gemini_api_key_here
```

```bash
npm run dev
```

### 2. Frontend Setup

```bash
cd client
npm install
npm run dev
```

The app runs at `http://localhost:5173`

## Project Structure

```
AI-Smart-Study-Companion/
├── client/                  # React + Vite frontend
│   └── src/
│       ├── pages/           # 9 page components
│       ├── components/      # Navbar, ProtectedRoute
│       ├── context/         # AuthContext
│       └── services/        # Axios API service
└── server/                  # Node.js + Express backend
    ├── models/              # MongoDB models (User, Document, Quiz, Flashcard, VivaSession)
    ├── routes/              # API routes
    ├── middleware/          # JWT auth, Multer upload
    └── services/            # Gemini AI, PDF extraction
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/documents/upload` | Upload document |
| GET | `/api/documents` | List documents |
| POST | `/api/ai/summarize/:id` | Generate AI summary |
| POST | `/api/ai/quiz/:id` | Generate quiz |
| POST | `/api/ai/viva/start/:id` | Start viva session |
| POST | `/api/ai/flashcards/:id` | Generate flashcards |
| POST | `/api/ai/search/:id` | Semantic search |
| GET | `/api/progress/dashboard` | Dashboard stats |
| GET | `/api/progress/study-plan` | AI study plan |
