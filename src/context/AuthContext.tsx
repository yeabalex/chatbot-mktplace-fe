import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { loginRequest, registerRequest, fetchCurrentUser, verifyEmailRequest, RegisterResponse, resetPasswordRequest } from '../lib/api'
import { STORAGE_KEYS } from '../lib/constants'

// ─── Types ─────────────────────────────────────────────────────

export interface User {
  id: string
  username: string
  email: string
  role: 'user' | 'creator' | 'admin'
  profilePictureUrl?: string
  bio?: string
  createdAt: string
  // Backward-compat aliases used by Layout / ProfilePage / SettingsPage:
  name: string
  avatar?: string
  likedBots: string[]
  purchasedBots: string[]
}

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (emailOrUsername: string, password: string) => Promise<void>
  register: (username: string, email: string, password: string) => Promise<RegisterResponse>
  verifyEmail: (email: string, otp: string) => Promise<void>
  resetPasswordAndLogin: (payload: { email: string; otp: string; newPassword: string }) => Promise<void>
  logout: () => void
  updateUser: (user: Partial<User>) => void
}

// ─── Helpers ───────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | undefined>(undefined)

/** Maps the raw backend user object to our frontend User shape. */
function mapBackendUser(raw: any): User {
  return {
    id: raw.id || raw._id || '',
    username: raw.username || '',
    email: raw.email || '',
    role: raw.role || 'user',
    profilePictureUrl: raw.profilePictureUrl || '',
    bio: raw.bio || '',
    createdAt: raw.createdAt || new Date().toISOString(),
    // Compat:
    name: raw.username || '',
    avatar:
      raw.profilePictureUrl ||
      `https://api.dicebear.com/7.x/initials/svg?seed=${raw.username || 'user'}`,
    likedBots: raw.likedBots || [],
    purchasedBots: raw.purchasedBots || [],
  }
}

function persistSession(token: string, user: User) {
  localStorage.setItem(STORAGE_KEYS.token, token)
  localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user))
}

function clearSession() {
  localStorage.removeItem(STORAGE_KEYS.token)
  localStorage.removeItem(STORAGE_KEYS.user)
}

// ─── Provider ──────────────────────────────────────────────────

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Restore session on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem(STORAGE_KEYS.token)
      if (storedToken) {
        try {
          const data = await fetchCurrentUser()
          const mapped = mapBackendUser(data.user)
          setUser(mapped)
          setToken(storedToken)
          localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(mapped))
        } catch {
          // Network failure — try offline fallback
          const storedUser = localStorage.getItem(STORAGE_KEYS.user)
          if (storedUser) {
            try {
              setUser(JSON.parse(storedUser))
              setToken(storedToken)
            } catch {
              clearSession()
            }
          } else {
            clearSession()
          }
        }
      }
      setIsLoading(false)
    }

    initializeAuth()
  }, [])

  const login = async (emailOrUsername: string, password: string) => {
    setIsLoading(true)
    try {
      const data = await loginRequest(emailOrUsername, password)
      const mapped = mapBackendUser(data.user)
      setUser(mapped)
      setToken(data.token)
      persistSession(data.token, mapped)
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (username: string, email: string, password: string) => {
    setIsLoading(true)
    try {
      const data = await registerRequest(username, email, password)
      return data
    } finally {
      setIsLoading(false)
    }
  }

  const verifyEmail = async (email: string, otp: string) => {
    setIsLoading(true)
    try {
      const data = await verifyEmailRequest(email, otp)
      const mapped = mapBackendUser(data.user)
      setUser(mapped)
      setToken(data.token)
      persistSession(data.token, mapped)
    } finally {
      setIsLoading(false)
    }
  }

  const resetPasswordAndLogin = async (payload: { email: string; otp: string; newPassword: string }) => {
    setIsLoading(true)
    try {
      const data = await resetPasswordRequest(payload)
      const mapped = mapBackendUser(data.user)
      setUser(mapped)
      setToken(data.token)
      persistSession(data.token, mapped)
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    clearSession()
  }

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updated = { ...user, ...updates }
      if (updates.username) updated.name = updates.username
      if (updates.profilePictureUrl) updated.avatar = updates.profilePictureUrl
      setUser(updated)
      localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(updated))
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        verifyEmail,
        resetPasswordAndLogin,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// ─── Hook ──────────────────────────────────────────────────────

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
