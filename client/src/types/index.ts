// ============================================================
// Shared Application Types — Frontend
// ============================================================

// ----- Auth / User -----
export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

export interface AuthContextValue {
  user: User | null;
  token: string | null;
  login: (userData: User, userToken: string) => void;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
}

// ----- API Auth Responses -----
export interface AuthResponse {
  token: string;
  user: User;
}

// ----- Documents -----
export interface Document {
  _id: string;
  userId: string;
  filename: string;
  originalName: string;
  extractedText?: string;
  summary: string;
  keywords: string[];
  notes: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
}

export interface DocumentListResponse {
  documents: Document[];
}

export interface DocumentResponse {
  document: Document;
}

// ----- Quiz -----
export type QuestionType = 'mcq' | 'short' | 'long';

export interface QuizQuestion {
  _id?: string;
  question: string;
  type: QuestionType;
  options: string[];
  correctAnswer: string;
  userAnswer: string;
  isCorrect: boolean;
  feedback: string;
}

export interface Quiz {
  _id: string;
  userId: string;
  documentId: string;
  questions: QuizQuestion[];
  score: number;
  totalQuestions: number;
  percentage: number;
  weakTopics: string[];
  completedAt: string;
}

export interface QuizResponse {
  quiz: Quiz;
}

export interface QuizEvaluation {
  questionIndex: number;
  isCorrect: boolean;
  feedback: string;
}

export interface QuizSubmitResponse {
  quiz: Quiz;
  evaluations: QuizEvaluation[];
}

export interface QuizAnswer {
  questionIndex: number;
  answer: string;
}

// ----- Flashcards -----
export type FlashcardDifficulty = 'easy' | 'medium' | 'hard';

export interface FlashcardItem {
  _id?: string;
  front: string;
  back: string;
  difficulty: FlashcardDifficulty;
}

export interface Flashcard {
  _id: string;
  userId: string;
  documentId: string;
  cards: FlashcardItem[];
  lastReviewed: string;
  createdAt: string;
}

export interface FlashcardResponse {
  flashcard: Flashcard;
}

// ----- Viva -----
export interface VivaExchange {
  question: string;
  answer: string;
  feedback: string;
  score: number;
}

export interface VivaSession {
  _id: string;
  userId: string;
  documentId: string;
  exchanges: VivaExchange[];
  overallScore: number;
  completedAt: string;
}

export interface VivaStartResponse {
  sessionId: string;
  question: string;
}

export interface VivaAnswerResponse {
  feedback: string;
  idealAnswer: string;
  score: number;
  nextQuestion: string | null;
  isComplete: boolean;
}

export interface VivaSessionResponse {
  session: VivaSession;
}

// ----- AI / Summary -----
export interface SummaryResponse {
  summary: string;
  keywords: string[];
  notes: string;
}

export interface SearchResponse {
  result: string;
}

// ----- Progress / Dashboard -----
export interface DashboardStats {
  totalDocuments: number;
  totalQuizzes: number;
  totalFlashcards: number;
  totalViva: number;
  avgQuizScore: number;
}

export interface RecentScore {
  date: string;
  score: number;
  docName: string;
}

export interface DashboardResponse {
  stats: DashboardStats;
  recentDocuments: Document[];
  weakTopics: string[];
  recentScores: RecentScore[];
}

export interface StudyPlanResponse {
  studyPlan: string;
  weakTopics?: string[];
}

export interface QuizHistoryEntry {
  date: string;
  score: number;
  total: number;
  correct: number;
}

export interface AnalyticsResponse {
  quizHistory: QuizHistoryEntry[];
  quizzesByDoc: Record<string, number[]>;
}

// ----- Navigation -----
import type { LucideIcon } from 'lucide-react';

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}
