import React from 'react'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'destructive'
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className = '', variant = 'default', children, ...props }, ref) => {
    const variants = {
      default: 'bg-primary/10 text-primary border border-primary/20',
      secondary: 'bg-accent/10 text-accent border border-accent/20',
      outline: 'border border-border text-foreground',
      success: 'bg-success/10 text-success border border-success/20',
      warning: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
      destructive: 'bg-destructive/10 text-destructive border border-destructive/20',
    }

    return (
      <span
        ref={ref}
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}
        {...props}
      >
        {children}
      </span>
    )
  }
)

Badge.displayName = 'Badge'

export default Badge
