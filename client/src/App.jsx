import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import UploadPage from './pages/UploadPage';
import SummaryPage from './pages/SummaryPage';
import QuizPage from './pages/QuizPage';
import VivaPage from './pages/VivaPage';
import FlashcardsPage from './pages/FlashcardsPage';
import AnalyticsPage from './pages/AnalyticsPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
              <Route path="/upload" element={<ProtectedRoute><UploadPage /></ProtectedRoute>} />
              <Route path="/summary/:id" element={<ProtectedRoute><SummaryPage /></ProtectedRoute>} />
              <Route path="/quiz/:id" element={<ProtectedRoute><QuizPage /></ProtectedRoute>} />
              <Route path="/viva/:id" element={<ProtectedRoute><VivaPage /></ProtectedRoute>} />
              <Route path="/flashcards/:id" element={<ProtectedRoute><FlashcardsPage /></ProtectedRoute>} />
              <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
        </div>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: '#1e1e2e', color: '#cdd6f4', border: '1px solid #313244' },
            success: { iconTheme: { primary: '#a6e3a1', secondary: '#1e1e2e' } },
            error: { iconTheme: { primary: '#f38ba8', secondary: '#1e1e2e' } }
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
