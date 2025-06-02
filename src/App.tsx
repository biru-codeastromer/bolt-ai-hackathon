import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ChatProvider } from './contexts/ChatContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import ChatPage from './pages/ChatPage';
import FormsPage from './pages/FormsPage';
import AdminDashboard from './pages/AdminDashboard';
import { ConsentBanner } from './components/privacy/ConsentBanner';

function App() {
  const handleConsentAccept = (limitedPurpose: boolean) => {
    console.log('Consent accepted with limited purpose:', limitedPurpose);
  };

  const handleConsentDecline = () => {
    console.log('Consent declined');
  };

  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ChatProvider>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<LoginPage />} />
              
              {/* Protected routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<ChatPage />} />
                <Route path="/forms" element={<FormsPage />} />
                <Route path="/admin" element={<AdminDashboard />} />
              </Route>
              
              {/* Catch-all redirect */}
              <Route path="*" element={<Navigate to="/\" replace />} />
            </Routes>

            <ConsentBanner
              onAccept={handleConsentAccept}
              onDecline={handleConsentDecline}
            />
          </ChatProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;