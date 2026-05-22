import { Link } from 'react-router-dom'
import type { Bot } from '../../data/bots'

interface FeaturedCardProps {
  bot: Bot
}

export default function FeaturedCard({ bot }: FeaturedCardProps) {
  return (
    <Link
      to={`/bot/${bot.id}`}
      className="ios-hero-card block active:scale-[0.98] lg:active:scale-100 lg:hover:scale-[1.02] transition-transform"
    >
      {/* Background image */}
      <img
        src={bot.image}
        alt=""
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* Gradient overlay — stronger at bottom for legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10" />

      {/* Text content */}
      <div className="absolute bottom-0 left-0 right-0 p-5">
        {bot.editorsChoice && (
          <span className="inline-block text-[11px] font-semibold uppercase tracking-widest bg-white/25 backdrop-blur-sm px-2.5 py-0.5 rounded-full mb-2 text-white/90">
            Editor&apos;s Choice
          </span>
        )}
        <p className="text-[13px] font-medium text-white/75 mb-1 tracking-wide">
          {bot.tagline || bot.category}
        </p>
        <h3 className="text-[28px] font-bold leading-tight tracking-tight mb-1.5 text-white">
          {bot.name}
        </h3>
        <p className="text-[15px] text-white/65 line-clamp-2 leading-snug">{bot.description}</p>
      </div>
    </Link>
  )
}
