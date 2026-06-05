import React from 'react'
import BrandLogo from '../brand/BrandLogo'
import AuthHeroPanel from './AuthHeroPanel'
import { APP_NAME, AUTH_STRINGS } from '../../lib/constants'

interface AuthFormLayoutProps {
  /** Hero panel description text (desktop left panel). */
  heroDescription: string
  /** Mobile subtitle shown below the app name. */
  mobileSubtitle: string
  /** Desktop-only heading above the form. */
  heading: string
  /** Desktop-only subtitle below the heading. */
  subtitle: string
  children: React.ReactNode
}

/**
 * Shared layout wrapper for authentication screens (login, register).
 * Provides the two-column layout with hero panel + form area,
 * including the mobile header with brand logo.
 */
const AuthFormLayout: React.FC<AuthFormLayoutProps> = ({
  heroDescription,
  mobileSubtitle,
  heading,
  subtitle,
  children,
}) => {
  return (
    <div className="min-h-screen bg-background flex">
      <AuthHeroPanel description={heroDescription} />

      {/* Form column */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16 lg:max-w-xl">
        <div className="w-full max-w-md mx-auto">
          {/* Mobile header */}
          <div className="lg:hidden flex flex-col items-center mb-10">
            <BrandLogo
              size="w-[88px] h-[88px]"
              iconSize="w-12 h-12"
              className="mb-6 shadow-lg shadow-primary/25"
            />
            <h1 className="ios-large-title text-center mb-1">{APP_NAME}</h1>
            <p className="ios-subhead text-center">{mobileSubtitle}</p>
          </div>

          {/* Desktop heading */}
          <h2 className="hidden lg:block ios-large-title mb-2">{heading}</h2>
          <p className="hidden lg:block ios-subhead mb-8">{subtitle}</p>

          {children}

          <p className="ios-caption text-center mt-10 leading-relaxed">
            {AUTH_STRINGS.termsNotice}
          </p>
        </div>
      </div>
    </div>
  )
}

export default AuthFormLayout
