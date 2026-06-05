import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { cn } from '../../lib/utils'

interface SectionHeaderProps {
  title: string
  href?: string
  linkLabel?: string
  className?: string
  badge?: string
}

export default function SectionHeader({
  title,
  href,
  linkLabel = 'See All',
  className,
  badge,
}: SectionHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between mb-3', className)}>
      <div className="flex items-center gap-3">
        <h2 className="ios-title-2">{title}</h2>
        {badge && <span className="section-badge">{badge}</span>}
      </div>
      {href && (
        <Link
          to={href}
          className="flex items-center gap-0.5 text-primary text-[14px] font-semibold hover:text-primary/80 active:opacity-60 transition-colors"
        >
          {linkLabel}
          <ChevronRight size={16} strokeWidth={2.5} />
        </Link>
      )}
    </div>
  )
}
