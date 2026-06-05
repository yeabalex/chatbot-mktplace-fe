import { Link } from 'react-router-dom'
import AppIcon from './AppIcon'
import { formatPrice } from '../../lib/utils'
import type { Bot } from '../../data/bots'

interface AppGridItemProps {
  bot: Bot
  index?: number
}

export default function AppGridItem({ bot, index = 0 }: AppGridItemProps) {
  return (
    <Link
      to={`/bot/${bot.id}`}
      className="flex flex-col items-center w-[84px] sm:w-[96px] flex-shrink-0 group animate-in"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="mb-2 transition-transform duration-300 group-hover:scale-110 group-active:scale-95">
        <AppIcon src={bot.iconImage ?? bot.image} alt={bot.name} size="md" />
      </div>
      <p className="text-[12px] text-center text-foreground font-medium leading-tight line-clamp-2 w-full px-0.5 group-hover:text-primary transition-colors duration-200">
        {bot.name}
      </p>
      <span className="ios-caption mt-1">
        {bot.price === 0 ? (
          <span className="text-primary font-bold">GET</span>
        ) : (
          formatPrice(bot.price)
        )}
      </span>
    </Link>
  )
}
