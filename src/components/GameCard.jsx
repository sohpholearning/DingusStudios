import { motion } from "motion/react";
import { Star, Trophy, Gamepad2, Ghost, Grid3X3, Hexagon, Bird, Zap, Orbit, Layers, ArrowRight } from "lucide-react";
import { playClickSound } from "../utils/sound";

// Icon mapper helper
const iconMap = {
  Ghost,
  Grid3X3,
  Hexagon,
  Bird,
  Zap,
  Orbit,
  Layers,
  Gamepad2,
};

export default function GameCard({
  game,
  isFavorite,
  onSelect,
  onToggleFavorite,
  playCount,
}) {
  const IconComponent = iconMap[game.iconName] || Gamepad2;

  // Map category to a badge design style
  const categoryStyles = {
    Retro: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    Puzzle: "bg-rose-500/10 text-rose-400 border-rose-500/30",
    Arcade: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    Action: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
    Strategy: "bg-pink-500/10 text-pink-400 border-pink-500/30",
    Custom: "bg-purple-500/10 text-purple-400 border-purple-500/30",
  };

  const currentCategoryStyle = categoryStyles[game.category] || "bg-indigo-500/10 text-indigo-400 border-indigo-500/30";

  // Difficulty badge colors
  const difficultyColors = {
    Easy: "text-emerald-400 bg-emerald-950/40",
    Medium: "text-amber-400 bg-amber-950/40",
    Hard: "text-rose-400 bg-rose-950/40",
  };

  const handleCardClick = () => {
    playClickSound();
    onSelect(game);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      id={`game-card-${game.id}`}
      className="group relative flex flex-col justify-between h-[340px] rounded-2xl game-card-premium overflow-hidden cursor-pointer backdrop-blur-md transition-all duration-300 shadow-lg"
      onClick={handleCardClick}
    >
      {/* Dynamic Background Glow Accordance */}
      <div 
        className={`absolute -top-12 -right-12 w-32 h-32 rounded-full bg-gradient-to-br ${game.themeColor} opacity-5 group-hover:opacity-15 blur-2xl transition-opacity duration-300`} 
      />

      {/* Top Header Card Info */}
      <div className="p-5 flex-1">
        <div className="flex items-start justify-between mb-4">
          {/* Card Icon Bubble */}
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-cyan-400 shadow-md group-hover:border-cyan-500/30 transition-colors">
            <IconComponent className="w-5 h-5 animate-pulse" />
          </div>

          <div className="flex items-center gap-2">
            {/* Rating badge */}
            <div className="flex items-center gap-1 text-xs text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/20">
              <Star className="w-3 h-3 fill-cyan-400 text-cyan-400" />
              <span>{game.rating.toFixed(1)}</span>
            </div>

            {/* Favorite Star Button */}
            <button
              id={`fav-btn-${game.id}`}
              onClick={(e) => onToggleFavorite(game.id, e)}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-cyan-400 transition-colors"
              title={isFavorite ? "Remove from Favorites" : "Mark as Favorite"}
            >
              <Star className={`w-4 h-4 ${isFavorite ? "fill-cyan-400 text-cyan-400" : ""}`} />
            </button>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-white tracking-tight group-hover:text-cyan-400 transition-colors line-clamp-1 mb-2">
          {game.title}
        </h3>

        {/* Description */}
        <p className="text-xs text-gray-400 line-clamp-3 leading-relaxed mb-4">
          {game.description}
        </p>
      </div>

      {/* Bottom Card Footer Info */}
      <div className="p-5 pt-0">
        <div className="flex items-center justify-between border-t border-white/5 pt-4 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            {/* Category badge */}
            <span className={`px-2 py-0.5 rounded-full border text-[9px] uppercase tracking-wider font-semibold ${currentCategoryStyle}`}>
              {game.category}
            </span>

            {/* Difficulty Badge */}
            <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wider ${difficultyColors[game.difficulty]}`}>
              {game.difficulty}
            </span>
          </div>

          {/* Played counter */}
          {playCount > 0 && (
            <div className="flex items-center gap-1 text-gray-500" title="Play history">
              <Trophy className="w-3.5 h-3.5 text-cyan-400/60" />
              <span>{playCount}x</span>
            </div>
          )}
        </div>

        {/* Instant Hover Overlay Play button */}
        <div className="mt-4 flex items-center justify-between text-[10px] font-mono text-gray-500 group-hover:text-white transition-colors">
          <span>{game.releaseYear ? `Released: ${game.releaseYear}` : "Unblocked Safe"}</span>
          <div className="flex items-center gap-1 font-semibold text-cyan-400 transform translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
            <span>PLAY NOW</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
