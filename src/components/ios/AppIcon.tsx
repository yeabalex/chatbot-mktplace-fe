import { cn } from '../../lib/utils'

interface AppIconProps {
  src: string
  alt: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizes = {
  sm: 'w-12 h-12',
  md: 'w-[60px] h-[60px]',
  lg: 'w-20 h-20',
  xl: 'w-[100px] h-[100px]',
}

export default function AppIcon({ src, alt, size = 'md', className }: AppIconProps) {
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className={cn('app-icon object-cover bg-fill-secondary/20 flex-shrink-0', sizes[size], className)}
    />
  )
}
