import { Link } from 'react-router-dom'
import AppIcon from './AppIcon'
import { formatPrice } from '../../lib/utils'
import type { Bot } from '../../data/bots'

interface AppGridItemProps {
  bot: Bot
}

export default function AppGridItem({ bot }: AppGridItemProps) {
  return (
    <Link
      to={`/bot/${bot.id}`}
      className="flex flex-col items-center w-[76px] sm:w-[84px] flex-shrink-0 active:opacity-70 lg:hover:opacity-80 transition-opacity"
    >
      <AppIcon src={bot.iconImage ?? bot.image} alt={bot.name} size="md" className="mb-2" />
      <p className="text-[11px] text-center text-foreground leading-tight line-clamp-2 w-full px-0.5">
        {bot.name}
      </p>
      <span className="ios-caption mt-1">{bot.price === 0 ? 'GET' : formatPrice(bot.price)}</span>
    </Link>
  )
}
