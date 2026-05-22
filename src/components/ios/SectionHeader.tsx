import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { cn } from '../../lib/utils'

interface SectionHeaderProps {
  title: string
  href?: string
  linkLabel?: string
  className?: string
}

export default function SectionHeader({
  title,
  href,
  linkLabel = 'See All',
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between mb-2', className)}>
      <h2 className="ios-title-2">{title}</h2>
      {href && (
        <Link
          to={href}
          className="flex items-center gap-0.5 text-primary text-[15px] font-normal active:opacity-60"
        >
          {linkLabel}
          <ChevronRight size={18} strokeWidth={2.5} />
        </Link>
      )}
    </div>
  )
}
