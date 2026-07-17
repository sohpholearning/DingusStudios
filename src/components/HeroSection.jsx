import { motion } from "motion/react";
import { Play, Star, Ghost, Grid3X3, Hexagon, Bird, Zap, Orbit, Layers, Gamepad2 } from "lucide-react";
import { playClickSound, playPowerupSound } from "../utils/sound";

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

export default function HeroSection({
  game,
  isFavorite,
  onSelect,
  onToggleFavorite,
}) {
  const IconComponent = iconMap[game.iconName] || Gamepad2;

  const handleLaunchClick = () => {
    playPowerupSound();
    onSelect(game);
  };

  const handleFavClick = (e) => {
    playClickSound();
    onToggleFavorite(game.id, e);
  };

  return (
    <div id="featured-hero" className="relative w-full rounded-2xl glass p-6 md:p-8 overflow-hidden shadow-2xl mb-10 border border-white/10">
      {/* Visual Backdrops / Glowing Grids */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex-1 max-w-2xl">
          {/* Tagline */}
          <span className="px-2.5 py-1 bg-cyan-500 text-black text-[10px] font-black rounded uppercase mb-4 inline-block tracking-widest">
            FEATURED GAME PREVIEW
          </span>

          {/* Heading */}
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-3">
            {game.title}
          </h1>

          {/* Descriptions */}
          <p className="text-white/70 text-xs md:text-sm leading-relaxed mb-6">
            {game.longDescription || game.description}
          </p>

          {/* Controls Mini list */}
          {game.controls && game.controls.length > 0 && (
            <div className="mb-6">
              <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest block mb-2">QUICK CONTROLS</span>
              <div className="flex flex-wrap gap-2">
                {game.controls.slice(0, 2).map((ctrl, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-black/40 border border-white/5 px-3 py-1.5 rounded-lg text-xs font-mono text-gray-300">
                    <span className="text-cyan-400 bg-cyan-400/10 border border-cyan-400/20 px-1.5 py-0.5 rounded text-[10px]">{ctrl.key}</span>
                    <span>{ctrl.action}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              id="hero-launch-btn"
              onClick={handleLaunchClick}
              className="px-8 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xs rounded transition-all tracking-wider shadow-lg shadow-cyan-500/25 transform hover:-translate-y-0.5 cursor-pointer flex items-center gap-2"
            >
              <Play className="w-3.5 h-3.5 fill-black" />
              <span>PLAY NOW</span>
            </button>

            <button
              id="hero-fav-btn"
              onClick={handleFavClick}
              className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-bold text-xs rounded border border-white/10 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Star className={`w-3.5 h-3.5 ${isFavorite ? "fill-cyan-400 text-cyan-400" : ""}`} />
              <span>{isFavorite ? "FAVORITED" : "ADD TO FAVORITES"}</span>
            </button>
          </div>
        </div>

        {/* Dynamic Interactive Console Render on Right side */}
        <div className="relative flex-shrink-0 mx-auto md:mx-0 w-44 h-44 md:w-56 md:h-56 rounded-2xl bg-black/60 border border-white/5 p-6 flex flex-col items-center justify-center shadow-inner overflow-hidden group">
          {/* Glowing orbital line */}
          <div className="absolute inset-0 bg-cyan-500/5 blur-xl group-hover:opacity-10 transition-opacity duration-300" />
          
          <motion.div
            animate={{ 
              scale: [1, 1.05, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="p-6 rounded-3xl bg-cyan-500 text-black shadow-xl relative z-10 glow-blue"
          >
            <IconComponent className="w-12 h-12 stroke-[2.5]" />
          </motion.div>

          <div className="mt-4 text-center relative z-10">
            <div className="text-[10px] font-mono text-white/30 uppercase tracking-widest">DIFFICULTY</div>
            <div className={`text-xs font-bold mt-1 ${
              game.difficulty === "Easy" ? "text-emerald-400" : 
              game.difficulty === "Medium" ? "text-amber-400" : "text-rose-400"
            }`}>
              {game.difficulty.toUpperCase()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
