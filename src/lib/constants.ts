/**
 * Application-wide constants and branding configuration.
 * Change these values to rebrand the entire application.
 */

export const APP_NAME = 'Bot Store'
export const APP_TAGLINE = 'Discover, deploy, and build AI chatbots in one marketplace.'

export const AUTH_STRINGS = {
  loginTitle: 'Sign In',
  loginSubtitle: 'Sign in with your email or username.',
  registerTitle: 'Create Account',
  registerSubtitle: 'Sign up for a new account.',
  heroHeading: APP_NAME,
  heroLoginDescription: 'Discover AI chatbots built by creators worldwide. Browse, download, and build your collection.',
  heroRegisterDescription: 'Create an account to browse, rate, and publish your own AI chatbots.',
  termsNotice: 'By continuing, you agree to the Terms of Service and Privacy Policy.',
} as const

export const STORAGE_KEYS = {
  token: 'chatbot_token',
  user: 'chatbot_user',
} as const
