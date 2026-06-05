import { Link } from 'react-router-dom'
import type { Bot } from '../../data/bots'

interface FeaturedCardProps {
  bot: Bot
  index?: number
}

export default function FeaturedCard({ bot, index = 0 }: FeaturedCardProps) {
  return (
    <Link
      to={`/bot/${bot.id}`}
      className="ios-hero-card block group"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Background image */}
      <img
        src={bot.image}
        alt=""
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
      />

      {/* Gradient overlay — multi-layer for richness */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Top badge */}
      {bot.editorsChoice && (
        <div className="absolute top-4 left-4">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.15em] bg-white/15 backdrop-blur-md px-3 py-1.5 rounded-full text-white/90 border border-white/10">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-[pulse-soft_2s_infinite]" />
            Editor&apos;s Choice
          </span>
        </div>
      )}

      {/* Text content */}
      <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
        <p className="text-[12px] font-semibold text-white/55 uppercase tracking-wider mb-1.5">
          {bot.tagline || bot.category}
        </p>
        <h3 className="text-[26px] sm:text-[30px] font-bold leading-tight tracking-tight text-white mb-1.5">
          {bot.name}
        </h3>
        <p className="text-[14px] text-white/55 line-clamp-2 leading-relaxed max-w-[85%]">
          {bot.description}
        </p>

        {/* CTA hint on hover */}
        <div className="mt-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
          <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-white/80 bg-white/10 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/10">
            Explore →
          </span>
        </div>
      </div>
    </Link>
  )
}
