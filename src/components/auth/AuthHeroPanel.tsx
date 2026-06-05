import React from 'react'
import BrandLogo from '../brand/BrandLogo'
import { APP_NAME } from '../../lib/constants'

interface AuthHeroPanelProps {
  description: string
}

/**
 * Left-side hero panel displayed on desktop auth screens (login / register).
 * Hidden on mobile viewports.
 */
const AuthHeroPanel: React.FC<AuthHeroPanelProps> = ({ description }) => {
  return (
    <div className="hidden lg:flex lg:flex-1 lg:flex-col lg:justify-center lg:items-center lg:bg-gradient-to-br lg:from-primary lg:to-[#5ac8fa] lg:text-white lg:p-16">
      <div className="max-w-md text-center">
        <BrandLogo
          size="w-24 h-24"
          iconSize="w-14 h-14"
          className="mx-auto mb-8 bg-white/20 backdrop-blur shadow-none"
        />
        <h1 className="text-4xl font-bold tracking-tight mb-4">{APP_NAME}</h1>
        <p className="text-lg text-white/90 leading-relaxed">{description}</p>
      </div>
    </div>
  )
}

export default AuthHeroPanel
