import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { forgotPasswordRequest } from '../lib/api'
import AuthFormLayout from '../components/auth/AuthFormLayout'
import Button from '../components/ui/Button'
import { Mail, RefreshCw, Key, ShieldAlert, ArrowLeft, Eye, EyeOff } from 'lucide-react'
import { cn } from '../lib/utils'

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const { resetPasswordAndLogin } = useAuth()

  // Steps: 'request' (enter email) -> 'reset' (enter OTP and new password)
  const [step, setStep] = useState<'request' | 'reset'>('request')
  
  // Form fields
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  
  // Status states
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Password Visibility toggles
  const [showPassword, setShowPassword] = useState(false)

  // Resend OTP Cooldown Timer
  const [resendCooldown, setResendCooldown] = useState(0)
  const [resendMessage, setResendMessage] = useState<string | null>(null)

  const otpInputRef = useRef<HTMLInputElement>(null)

  // Cooldown timer effect
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  // Handle Step 1: Request Reset Code
  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email) {
      setError('Email address is required')
      return
    }

    setIsLoading(true)
    try {
      await forgotPasswordRequest(email)
      setStep('reset')
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Failed to send reset code. Please check the email.')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle Step 2: Reset Password and Login
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (otp.length !== 6 || !/^\d+$/.test(otp)) {
      setError('Verification code must be exactly 6 digits')
      return
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setIsLoading(true)
    try {
      await resetPasswordAndLogin({ email, otp, newPassword })
      setSuccess(true)
      setTimeout(() => {
        navigate('/marketplace', { replace: true })
      }, 1500)
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Reset failed. Please verify the code and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Resend code handler
  const handleResend = async () => {
    if (resendCooldown > 0) return
    setError(null)
    setResendMessage(null)

    try {
      await forgotPasswordRequest(email)
      setResendMessage('A new reset code has been sent.')
      setResendCooldown(60) // 60s lock
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Failed to resend code.')
    }
  }

  const focusInput = () => {
    otpInputRef.current?.focus()
  }

  return (
    <AuthFormLayout
      heroDescription="Reset your credentials securely and regain immediate access to your customized AI chatbot directory."
      mobileSubtitle={step === 'request' ? "Enter your email to request a reset code." : "Enter code and set your new password."}
      heading="Reset Password"
      subtitle={step === 'request' ? "Regain access to your account." : "Set your new account credentials."}
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
          <h3 className="text-xl font-bold text-foreground mb-1">Password Reset!</h3>
          <p className="text-[14px] text-label-tertiary">Logging you in to the marketplace...</p>
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

          {step === 'request' ? (
            /* =========================================================
               STEP 1: REQUEST CODE FORM
               ========================================================= */
            <form onSubmit={handleRequestCode} className="space-y-6 animate-fade">
              <div className="space-y-2">
                <label htmlFor="forgot-email-input" className="text-[12px] font-bold text-label-secondary uppercase tracking-wider">
                  Email Address
                </label>
                <div className="bg-card border border-border/50 rounded-xl px-4 py-3 flex items-center gap-3">
                  <Mail size={18} className="text-label-tertiary" />
                  <input
                    id="forgot-email-input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                    className="bg-transparent outline-none flex-1 text-[16px] text-foreground"
                  />
                </div>
              </div>

              <Button type="submit" variant="primary" size="lg" fullWidth isLoading={isLoading}>
                Request Reset Code
              </Button>
            </form>
          ) : (
            /* =========================================================
               STEP 2: RESET PASSWORD FORM
               ========================================================= */
            <form onSubmit={handleResetPassword} className="space-y-5 animate-fade">
              {/* Back to Step 1 */}
              <button
                type="button"
                onClick={() => setStep('request')}
                className="flex items-center gap-1 text-[13px] text-primary font-bold hover:underline mb-2 cursor-pointer"
              >
                <ArrowLeft size={14} />
                <span>Change Email ({email})</span>
              </button>

              {/* Custom 6-digit OTP Box Visualizer */}
              <div className="space-y-2.5">
                <label className="text-[12px] font-bold text-label-secondary uppercase tracking-wider">
                  Verification Code
                </label>
                <div className="relative flex justify-center py-1" onClick={focusInput}>
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
                  
                  <div className="flex gap-2.5 sm:gap-3.5 justify-center">
                    {[0, 1, 2, 3, 4, 5].map((index) => {
                      const digit = otp[index] || ''
                      const isCurrent = otp.length === index
                      return (
                        <div
                          key={index}
                          className={cn(
                            'w-11 h-13 sm:w-12 sm:h-14 border rounded-xl flex items-center justify-center text-xl sm:text-2xl font-black bg-card transition-all duration-150',
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

              {/* New Password input */}
              <div className="space-y-2">
                <label htmlFor="new-password" className="text-[12px] font-bold text-label-secondary uppercase tracking-wider">
                  New Password
                </label>
                <div className="bg-card border border-border/50 rounded-xl px-4 py-3 flex items-center gap-3">
                  <Key size={18} className="text-label-tertiary" />
                  <input
                    id="new-password"
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    required
                    className="bg-transparent outline-none flex-1 text-[16px] text-foreground"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-0.5 text-label-tertiary hover:text-foreground cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password input */}
              <div className="space-y-2">
                <label htmlFor="confirm-new-password" className="text-[12px] font-bold text-label-secondary uppercase tracking-wider">
                  Confirm Password
                </label>
                <div className="bg-card border border-border/50 rounded-xl px-4 py-3 flex items-center gap-3">
                  <Key size={18} className="text-label-tertiary" />
                  <input
                    id="confirm-new-password"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    required
                    className="bg-transparent outline-none flex-1 text-[16px] text-foreground"
                  />
                </div>
              </div>

              <Button type="submit" variant="primary" size="lg" fullWidth isLoading={isLoading}>
                Reset Password
              </Button>

              {/* Resend reset code action */}
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendCooldown > 0}
                  className={cn(
                    'flex items-center gap-1.5 mx-auto text-[14px] font-semibold transition-colors cursor-pointer',
                    resendCooldown > 0 
                      ? 'text-label-tertiary cursor-not-allowed' 
                      : 'text-primary hover:underline'
                  )}
                >
                  <RefreshCw size={14} className={cn(resendCooldown > 0 && 'animate-spin-slow')} />
                  {resendCooldown > 0 ? `Resend Code in ${resendCooldown}s` : 'Resend Verification Code'}
                </button>
              </div>
            </form>
          )}

          {/* Footer Navigation */}
          <div className="text-center pt-4 border-t border-border/10">
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
