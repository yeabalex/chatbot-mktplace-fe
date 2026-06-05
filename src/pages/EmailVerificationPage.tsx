import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { resendVerificationRequest } from '../lib/api'
import AuthFormLayout from '../components/auth/AuthFormLayout'
import Button from '../components/ui/Button'
import { Mail, RefreshCw, Key, ShieldAlert } from 'lucide-react'
import { cn } from '../lib/utils'

export default function EmailVerificationPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { verifyEmail } = useAuth()

  // Get initial values from router state
  const stateEmail = location.state?.email || ''
  const stateDevOtp = location.state?.devOtp || ''

  // State
  const [email, setEmail] = useState(stateEmail)
  const [otp, setOtp] = useState('')
  const [devOtp, setDevOtp] = useState(stateDevOtp)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Resend OTP Cooldown Timer
  const [resendCooldown, setResendCooldown] = useState(0)
  const [resendMessage, setResendMessage] = useState<string | null>(null)

  const otpInputRef = useRef<HTMLInputElement>(null)

  // Handle cooldown decrement
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  // Handle OTP submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email) {
      setError('Email address is required')
      return
    }

    if (otp.length !== 6 || !/^\d+$/.test(otp)) {
      setError('Verification code must be exactly 6 digits')
      return
    }

    setIsLoading(true)
    try {
      await verifyEmail(email, otp)
      setSuccess(true)
      setTimeout(() => {
        navigate('/marketplace', { replace: true })
      }, 1500)
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Verification failed. Please check the code and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle Resend Verification Code
  const handleResend = async () => {
    if (resendCooldown > 0) return
    setError(null)
    setResendMessage(null)

    if (!email) {
      setError('Email address is required to resend the code')
      return
    }

    try {
      const res = await resendVerificationRequest(email)
      setResendMessage(res.message || 'Verification code sent successfully.')
      setResendCooldown(60) // 60 seconds lock
      // If devOtp is returned in subsequent responses
      if ((res as any).devOtp) {
        setDevOtp((res as any).devOtp)
      }
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Failed to resend verification code.')
    }
  }

  const focusInput = () => {
    otpInputRef.current?.focus()
  }

  return (
    <AuthFormLayout
      heroDescription="Verify your email address to activate your account and start building your AI chatbot library."
      mobileSubtitle="Enter the 6-digit OTP code to verify your account."
      heading="Email Verification"
      subtitle="We sent a 6-digit verification code to your email."
    >
      {success ? (
        <div className="text-center py-6 animate-fade">
          <div className="w-16 h-16 rounded-full bg-success/15 flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-success animate-bounce"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-foreground mb-1">Email Verified!</h3>
          <p className="text-[14px] text-label-tertiary">Directing you to the marketplace...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {error && (
            <div className="p-3.5 text-[14px] font-semibold bg-destructive/10 text-destructive rounded-xl text-center flex items-center justify-center gap-2">
              <ShieldAlert size={16} />
              <span>{error}</span>
            </div>
          )}

          {resendMessage && (
            <div className="p-3.5 text-[14px] font-semibold bg-success/10 text-success rounded-xl text-center">
              {resendMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email field (editable if not passed from state) */}
            <div className="space-y-2">
              <label htmlFor="verify-email-input" className="text-[12px] font-bold text-label-secondary uppercase tracking-wider">
                Email Address
              </label>
              <div className="bg-card border border-border/50 rounded-xl px-4 py-3 flex items-center gap-3">
                <Mail size={18} className="text-label-tertiary" />
                <input
                  id="verify-email-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  disabled={!!stateEmail}
                  required
                  className="bg-transparent outline-none flex-1 text-[16px] text-foreground disabled:text-label-tertiary"
                />
              </div>
            </div>

            {/* Custom 6-digit OTP Box Visualizer */}
            <div className="space-y-3.5">
              <label className="text-[12px] font-bold text-label-secondary uppercase tracking-wider">
                Verification Code
              </label>
              <div className="relative flex justify-center py-2" onClick={focusInput}>
                {/* Hidden input overlays for raw text capturing */}
                <input
                  ref={otpInputRef}
                  type="text"
                  pattern="\d*"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '')
                    setOtp(val)
                  }}
                  autoFocus
                  required
                  className="absolute inset-0 w-full h-full opacity-0 cursor-default select-none pointer-events-none"
                />
                
                {/* Render 6 separate iOS passcode blocks */}
                <div className="flex gap-2.5 sm:gap-3.5 justify-center">
                  {[0, 1, 2, 3, 4, 5].map((index) => {
                    const digit = otp[index] || ''
                    const isCurrent = otp.length === index
                    return (
                      <div
                        key={index}
                        className={cn(
                          'w-11 h-13 sm:w-13 sm:h-15 border rounded-xl flex items-center justify-center text-xl sm:text-2xl font-black bg-card transition-all duration-150',
                          isCurrent 
                            ? 'border-primary ring-4 ring-primary/10 shadow-xs' 
                            : 'border-border/60',
                          digit && 'border-border/90 text-foreground'
                        )}
                      >
                        {digit}
                        {isCurrent && (
                          <span className="w-[2px] h-6 bg-primary animate-pulse" />
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            <Button type="submit" variant="primary" size="lg" fullWidth isLoading={isLoading}>
              Verify & Log In
            </Button>
          </form>

          {/* Development Helper Box */}
          {devOtp && (
            <div className="p-4 bg-muted/60 border border-border/40 rounded-2xl flex flex-col gap-1 items-center justify-center animate-fade">
              <span className="text-[10px] font-black text-accent bg-accent/15 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Development OTP
              </span>
              <p className="text-[14px] text-foreground font-semibold mt-1">
                Use code: <span className="font-black text-primary text-[16px] tracking-widest">{devOtp}</span>
              </p>
            </div>
          )}

          {/* Actions Footer */}
          <div className="flex flex-col items-center gap-4 pt-2">
            <button
              onClick={handleResend}
              disabled={resendCooldown > 0}
              className={cn(
                'flex items-center gap-1.5 text-[15px] font-semibold transition-colors cursor-pointer',
                resendCooldown > 0 
                  ? 'text-label-tertiary cursor-not-allowed' 
                  : 'text-primary hover:underline'
              )}
            >
              <RefreshCw size={15} className={cn(resendCooldown > 0 && 'animate-spin-slow')} />
              {resendCooldown > 0 ? `Resend Code in ${resendCooldown}s` : 'Resend Verification Code'}
            </button>

            <Link
              to="/login"
              className="text-label-secondary text-[14px] hover:underline"
            >
              Back to Sign In
            </Link>
          </div>
        </div>
      )}
    </AuthFormLayout>
  )
}
