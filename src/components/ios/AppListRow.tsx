import { Link } from 'react-router-dom'
import { Star, Heart } from 'lucide-react'
import AppIcon from './AppIcon'
import { cn, formatDownloads, formatPrice } from '../../lib/utils'
import type { Bot } from '../../data/bots'
import { useAuth } from '../../context/AuthContext'

interface AppListRowProps {
  bot: Bot
  rank?: number
  showChevron?: boolean
  className?: string
}

export default function AppListRow({ bot, rank, showChevron = true, className }: AppListRowProps) {
  const { user } = useAuth()
  const isLiked = (user && user.likedBots?.includes(bot.id)) || bot.isLiked

  return (
    <Link to={`/bot/${bot.id}`} className={cn('ios-list-row group', className)}>
      {rank != null && (
        <span className="rank-number w-8 text-center flex-shrink-0">
          {rank}
        </span>
      )}
      <div className="transition-transform duration-300 group-hover:scale-105">
        <AppIcon src={bot.iconImage ?? bot.image} alt={bot.name} size="md" />
      </div>
      <div className="flex-1 min-w-0">
        {/* Name + GET button on the same line */}
        <div className="flex items-center justify-between gap-3">
          <p className="ios-headline truncate group-hover:text-primary transition-colors duration-200">{bot.name}</p>
          <span className={cn('ios-get-btn flex-shrink-0', bot.price === 0 && 'ios-get-btn-filled')}>
            {formatPrice(bot.price)}
          </span>
        </div>
        <p className="ios-footnote truncate mt-0.5">{bot.subtitle}</p>
        <div className="flex items-center gap-1.5 mt-1">
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                size={11}
                className={cn(
                  'transition-colors',
                  i <= Math.round(bot.rating)
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-fill-secondary/40'
                )}
              />
            ))}
          </div>
          <span className="ios-caption ml-0.5">{formatDownloads(bot.downloads)}</span>
          <span className="text-label-tertiary text-[10px]">·</span>
          <Heart size={10} className={cn(isLiked ? "text-destructive fill-destructive" : "text-label-tertiary")} />
          <span className="ios-caption">{(bot.likeCount ?? 0).toLocaleString()}</span>
        </div>
      </div>
    </Link>
  )
}
