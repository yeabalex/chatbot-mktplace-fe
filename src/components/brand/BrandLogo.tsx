import React from 'react'
import { cn } from '../../lib/utils'

interface BrandLogoProps {
  /** Tailwind dimension class for the outer container, e.g. "w-9 h-9" */
  size?: string
  /** Tailwind dimension class for the inner icon, e.g. "w-5 h-5" */
  iconSize?: string
  className?: string
}

/**
 * Bot Store brand logo — a friendly robot/bot icon inside a gradient pill.
 * Replaces the old Apple logo throughout the app.
 */
const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'w-9 h-9',
  iconSize = 'w-5 h-5',
  className,
}) => {
  return (
    <div
      className={cn(
        'rounded-[22%] bg-gradient-to-br from-primary to-indigo-400 flex items-center justify-center shadow-md',
        size,
        className
      )}
    >
      <svg
        viewBox="0 0 24 24"
        className={cn(iconSize, 'text-white')}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Robot head */}
        <rect x="4" y="6" width="16" height="12" rx="3" />
        {/* Antenna */}
        <line x1="12" y1="6" x2="12" y2="2" />
        <circle cx="12" cy="2" r="1" fill="currentColor" stroke="none" />
        {/* Eyes */}
        <circle cx="9" cy="12" r="1.5" fill="currentColor" stroke="none" />
        <circle cx="15" cy="12" r="1.5" fill="currentColor" stroke="none" />
        {/* Mouth */}
        <path d="M9 15.5h6" />
      </svg>
    </div>
  )
}

export default BrandLogo
