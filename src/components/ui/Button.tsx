import React from 'react'
import { cn } from '../../lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  fullWidth?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = '',
      variant = 'primary',
      size = 'md',
      isLoading = false,
      fullWidth = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const variants = {
      primary: 'bg-primary text-primary-foreground active:opacity-80',
      secondary: 'bg-fill-secondary/30 text-primary active:opacity-80',
      outline: 'bg-transparent text-primary border border-primary/30 active:bg-fill-secondary/20',
      ghost: 'bg-transparent text-primary active:opacity-60',
      destructive: 'bg-destructive text-white active:opacity-80',
    }

    const sizes = {
      sm: 'h-[30px] px-4 text-[15px] rounded-full font-semibold',
      md: 'h-[44px] px-6 text-[17px] rounded-full font-semibold',
      lg: 'h-[50px] px-8 text-[17px] rounded-full font-bold',
    }

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-2 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed',
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        )}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button
