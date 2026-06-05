import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AuthFormLayout from '../components/auth/AuthFormLayout'
import Button from '../components/ui/Button'
import { AUTH_STRINGS } from '../lib/constants'

const RegisterPage: React.FC = () => {
  const navigate = useNavigate()
  const { register, isAuthenticated, isLoading: authLoading } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate('/marketplace', { replace: true })
    }
  }, [isAuthenticated, authLoading, navigate])

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setIsLoading(true)
    try {
      const res = await register(username, email, password)
      navigate('/verify-email', {
        state: {
          email: email,
          devOtp: res.devOtp
        }
      })
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (authLoading || isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-label-secondary text-[17px] font-medium">Loading...</div>
      </div>
    )
  }

  return (
    <AuthFormLayout
      heroDescription={AUTH_STRINGS.heroRegisterDescription}
      mobileSubtitle="Create an account to start your bot library."
      heading={AUTH_STRINGS.registerTitle}
      subtitle={AUTH_STRINGS.registerSubtitle}
    >
      {error && (
        <div className="mb-4 p-3.5 text-[15px] font-semibold bg-destructive/10 text-destructive rounded-[10px] text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleRegister} className="space-y-6">
        <div className="ios-grouped overflow-hidden">
          <input
            id="register-username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            required
            className="w-full px-4 py-3.5 text-[17px] bg-transparent outline-none placeholder:text-label-tertiary text-foreground"
          />
          <div className="ios-separator !ml-0" />
          <input
            id="register-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="w-full px-4 py-3.5 text-[17px] bg-transparent outline-none placeholder:text-label-tertiary text-foreground"
          />
          <div className="ios-separator !ml-0" />
          <input
            id="register-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            className="w-full px-4 py-3.5 text-[17px] bg-transparent outline-none placeholder:text-label-tertiary text-foreground"
          />
          <div className="ios-separator !ml-0" />
          <input
            id="register-confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm Password"
            required
            className="w-full px-4 py-3.5 text-[17px] bg-transparent outline-none placeholder:text-label-tertiary text-foreground"
          />
        </div>

        <Button type="submit" variant="primary" size="lg" fullWidth isLoading={isLoading}>
          Sign Up
        </Button>
      </form>

      <div className="mt-8 text-center">
        <span className="text-label-secondary text-[15px]">Already have an account? </span>
        <Link
          to="/login"
          className="text-primary text-[15px] font-semibold active:opacity-60 hover:underline"
        >
          Sign In
        </Link>
      </div>
    </AuthFormLayout>
  )
}

export default RegisterPage
