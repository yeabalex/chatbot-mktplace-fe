import { Link } from 'react-router-dom'
import { Star } from 'lucide-react'
import AppIcon from './AppIcon'
import { cn, formatDownloads, formatPrice } from '../../lib/utils'
import type { Bot } from '../../data/bots'

interface AppListRowProps {
  bot: Bot
  rank?: number
  showChevron?: boolean
  className?: string
}

export default function AppListRow({ bot, rank, showChevron = true, className }: AppListRowProps) {
  return (
    <Link to={`/bot/${bot.id}`} className={cn('ios-list-row', className)}>
      {rank != null && (
        <span className="w-6 text-center ios-title-3 text-label-tertiary tabular-nums flex-shrink-0">
          {rank}
        </span>
      )}
      <AppIcon src={bot.iconImage ?? bot.image} alt={bot.name} size="md" />
      <div className="flex-1 min-w-0">
        {/* Name + GET button on the same line */}
        <div className="flex items-center justify-between gap-3">
          <p className="ios-headline truncate">{bot.name}</p>
          <span className={cn('ios-get-btn flex-shrink-0', bot.price === 0 && 'ios-get-btn-filled')}>
            {formatPrice(bot.price)}
          </span>
        </div>
        <p className="ios-footnote truncate mt-0.5">{bot.subtitle}</p>
        <div className="flex items-center gap-1 mt-0.5">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                size={10}
                className={cn(
                  i <= Math.round(bot.rating)
                    ? 'fill-label-tertiary text-label-tertiary'
                    : 'text-fill-secondary'
                )}
              />
            ))}
          </div>
          <span className="ios-caption ml-1">{formatDownloads(bot.downloads)}</span>
        </div>
      </div>
    </Link>
  )
}
