import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Button from '../components/ui/Button'

const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const { loginWithGoogle } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await loginWithGoogle({
        id: Math.random().toString(36).slice(2, 11),
        email: email || 'user@example.com',
        name: email.split('@')[0] || 'User',
        picture: `https://api.dicebear.com/7.x/initials/svg?seed=${email || 'user'}`,
      })
      navigate('/marketplace')
    } catch {
      alert('Sign in failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop hero panel */}
      <div className="hidden lg:flex lg:flex-1 lg:flex-col lg:justify-center lg:items-center lg:bg-gradient-to-br lg:from-primary lg:to-[#5ac8fa] lg:text-white lg:p-16">
        <div className="max-w-md text-center">
          <div className="w-24 h-24 rounded-[22%] bg-white/20 backdrop-blur flex items-center justify-center mx-auto mb-8">
            <svg viewBox="0 0 24 24" className="w-14 h-14 text-white" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17.2 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-4">Bot Store</h1>
          <p className="text-lg text-white/90 leading-relaxed">
            Discover AI bots like apps. Browse, download, and build your library on any device.
          </p>
        </div>
      </div>

      {/* Sign-in form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16 lg:max-w-xl">
        <div className="w-full max-w-md mx-auto">
          <div className="lg:hidden flex flex-col items-center mb-10">
            <div className="w-[88px] h-[88px] rounded-[22%] bg-gradient-to-br from-primary to-[#5ac8fa] flex items-center justify-center mb-6 shadow-lg shadow-primary/25">
              <svg viewBox="0 0 24 24" className="w-12 h-12 text-white" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
              </svg>
            </div>
            <h1 className="ios-large-title text-center mb-1">Bot Store</h1>
            <p className="ios-subhead text-center">Sign in to download bots and sync your library.</p>
          </div>

          <h2 className="hidden lg:block ios-large-title mb-2">Sign In</h2>
          <p className="hidden lg:block ios-subhead mb-8">Use your Apple ID to continue.</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="ios-grouped overflow-hidden">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
                className="w-full px-4 py-3.5 text-[17px] bg-transparent outline-none placeholder:text-label-tertiary"
              />
              <div className="ios-separator !ml-0" />
              <input
                type="password"
                placeholder="Password"
                className="w-full px-4 py-3.5 text-[17px] bg-transparent outline-none placeholder:text-label-tertiary"
              />
            </div>

            <Button type="submit" variant="primary" size="lg" fullWidth isLoading={isLoading}>
              Sign In
            </Button>
          </form>

          <button
            type="button"
            onClick={() => {
              setEmail('demo@example.com')
              handleLogin({ preventDefault: () => {} } as React.FormEvent)
            }}
            className="mt-6 w-full text-center text-primary text-[17px] font-medium active:opacity-60"
          >
            Continue as Guest
          </button>

          <p className="ios-caption text-center mt-10 leading-relaxed">
            By continuing, you agree to the Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
