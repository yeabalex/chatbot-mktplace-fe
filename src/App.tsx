import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ChatProvider } from './context/ChatContext'
import LoginPage from './pages/LoginPage'
import MarketplacePage from './pages/MarketplacePage'
import AppsPage from './pages/AppsPage'
import SearchPage from './pages/SearchPage'
import BotDetailPage from './pages/BotDetailPage'
import ChatPage from './pages/ChatPage'
import ProfilePage from './pages/ProfilePage'
import SettingsPage from './pages/SettingsPage'
import BotStudioPage from './pages/BotStudioPage'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <Router>
      <AuthProvider>
        <ChatProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/marketplace" element={<MarketplacePage />} />
              <Route path="/apps" element={<AppsPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/bot/:id" element={<BotDetailPage />} />
              <Route path="/chat/:id" element={<ChatPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/studio" element={<BotStudioPage />} />
              <Route path="/studio/:id" element={<BotStudioPage />} />
            </Route>

            <Route path="/" element={<Navigate to="/marketplace" replace />} />
            <Route path="*" element={<Navigate to="/marketplace" replace />} />
          </Routes>
        </ChatProvider>
      </AuthProvider>
    </Router>
  )
}

export default App
