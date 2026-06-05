import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ChatProvider } from './context/ChatContext'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import EmailVerificationPage from './pages/EmailVerificationPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import MarketplacePage from './pages/MarketplacePage'
import BotsPage from './pages/BotsPage'
import MyBotsPage from './pages/MyBotsPage'
import SearchPage from './pages/SearchPage'
import BotDetailPage from './pages/BotDetailPage'
import ChatPage from './pages/ChatPage'
import ProfilePage from './pages/ProfilePage'
import SettingsPage from './pages/SettingsPage'
import BotStudioPage from './pages/BotStudioPage'
import PurchasesAnalyticsPage from './pages/PurchasesAnalyticsPage'
import ProtectedRoute from './components/ProtectedRoute'

import { ThemeProvider } from './context/ThemeContext'

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <ChatProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/verify-email" element={<EmailVerificationPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />

              <Route element={<ProtectedRoute />}>
                <Route path="/marketplace" element={<MarketplacePage />} />
                <Route path="/bots" element={<BotsPage />} />
                <Route path="/my-bots" element={<MyBotsPage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/bot/:id" element={<BotDetailPage />} />
                <Route path="/chat/:id" element={<ChatPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/purchases-analytics" element={<PurchasesAnalyticsPage />} />
                <Route path="/studio" element={<BotStudioPage />} />
                <Route path="/studio/:id" element={<BotStudioPage />} />
              </Route>

              <Route path="/" element={<Navigate to="/marketplace" replace />} />
              <Route path="*" element={<Navigate to="/marketplace" replace />} />
            </Routes>
          </ChatProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  )
}

export default App
