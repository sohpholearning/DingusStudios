import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Gamepad2, Search, Plus, Volume2, VolumeX, Sparkles, Trophy, Trash2
} from "lucide-react";

import defaultGamesData from "./data/games.json";
import GameCard from "./components/GameCard.jsx";
import GamePlayer from "./components/GamePlayer.jsx";
import HeroSection from "./components/HeroSection.jsx";
import CustomGameModal from "./components/CustomGameModal.jsx";
import { 
  playClickSound, playTickSound, playPowerupSound, 
  setSoundMuted
} from "./utils/sound.js";

export default function App() {
  const [games, setGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [sortBy, setSortBy] = useState("rating");
  const [soundMuted, setSoundMutedState] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [playCounts, setPlayCounts] = useState({});
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [featuredGame, setFeaturedGame] = useState(null);

  // Initialize data on mount
  useEffect(() => {
    // 1. Sound muted setting
    const storedMute = localStorage.getItem("hub_sound_muted");
    if (storedMute === "true") {
      setSoundMuted(true);
      setSoundMutedState(true);
    } else {
      setSoundMuted(false);
      setSoundMutedState(false);
    }

    // 2. Load custom games
    const storedCustom = localStorage.getItem("hub_custom_games");
    let customList = [];
    if (storedCustom) {
      try {
        customList = JSON.parse(storedCustom);
      } catch (e) {
        console.error("Error parsing custom games:", e);
      }
    }

    // Combine defaults with custom games
    const initialGames = [...defaultGamesData, ...customList];
    setGames(initialGames);

    // 3. Load favorites
    const storedFavs = localStorage.getItem("hub_favorite_game_ids");
    if (storedFavs) {
      try {
        setFavorites(JSON.parse(storedFavs));
      } catch (e) {
        console.error("Error parsing favorites:", e);
      }
    }

    // 4. Load play counts
    const storedPlayCounts = localStorage.getItem("hub_game_play_counts");
    if (storedPlayCounts) {
      try {
        setPlayCounts(JSON.parse(storedPlayCounts));
      } catch (e) {
        console.error("Error parsing play counts:", e);
      }
    }

    // 5. Pick random featured game from default list
    const defaults = defaultGamesData;
    if (defaults.length > 0) {
      const randomIndex = Math.floor(Math.random() * defaults.length);
      setFeaturedGame(defaults[randomIndex]);
    }
  }, []);

  // Sync favorites to localStorage
  const handleToggleFavorite = (gameId, e) => {
    e.stopPropagation(); // Stop card clicking
    playTickSound();
    
    let updated;
    if (favorites.includes(gameId)) {
      updated = favorites.filter((id) => id !== gameId);
    } else {
      updated = [...favorites, gameId];
    }
    setFavorites(updated);
    localStorage.setItem("hub_favorite_game_ids", JSON.stringify(updated));
  };

  // Sound toggle callback
  const handleToggleMute = () => {
    const newState = !soundMuted;
    setSoundMutedState(newState);
    setSoundMuted(newState);
    localStorage.setItem("hub_sound_muted", String(newState));
  };

  // Launch a game
  const handleSelectGame = (game) => {
    setSelectedGame(game);
    
    // Update play counts
    const gameId = game.id;
    const currentCount = playCounts[gameId] || 0;
    const updatedCounts = {
      ...playCounts,
      [gameId]: currentCount + 1,
    };
    setPlayCounts(updatedCounts);
    localStorage.setItem("hub_game_play_counts", JSON.stringify(updatedCounts));
  };

  // Save new custom game
  const handleAddCustomGame = (newGame) => {
    const updatedGames = [...games, newGame];
    setGames(updatedGames);

    // Save custom list to local storage
    const customList = updatedGames.filter((g) => g.isCustom);
    localStorage.setItem("hub_custom_games", JSON.stringify(customList));
  };

  // Delete a custom game
  const handleDeleteCustomGame = (gameId, e) => {
    e.stopPropagation();
    playTickSound();
    
    if (confirm("Are you sure you want to delete this custom game? Your log records for this game will remain saved.")) {
      const updatedGames = games.filter((g) => g.id !== gameId);
      setGames(updatedGames);

      const customList = updatedGames.filter((g) => g.isCustom);
      localStorage.setItem("hub_custom_games", JSON.stringify(customList));

      // Remove from favorites if favorited
      if (favorites.includes(gameId)) {
        const updatedFavs = favorites.filter((id) => id !== gameId);
        setFavorites(updatedFavs);
        localStorage.setItem("hub_favorite_game_ids", JSON.stringify(updatedFavs));
      }
    }
  };

  // Clean wipe local data
  const handleClearHubData = () => {
    playTickSound();
    if (confirm("WARNING: This will delete all custom games, favorites, logs, and play history. Continue?")) {
      localStorage.removeItem("hub_custom_games");
      localStorage.removeItem("hub_favorite_game_ids");
      localStorage.removeItem("hub_game_play_counts");
      
      // Clean individual game logs
      games.forEach((game) => {
        localStorage.removeItem(`game_logs_${game.id}`);
      });

      setFavorites([]);
      setPlayCounts({});
      setGames(defaultGamesData);
      setSelectedGame(null);
      playPowerupSound();
      alert("Hub data wiped successfully.");
    }
  };

  // Categories set mapping
  const categories = useMemo(() => {
    const list = new Set(games.map((g) => g.category));
    return ["All", "Favorites", ...Array.from(list)];
  }, [games]);

  // Filter & Sort Logic
  const filteredGames = useMemo(() => {
    return games
      .filter((game) => {
        // 1. Search Query Match
        const matchesSearch = 
          game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          game.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          game.category.toLowerCase().includes(searchQuery.toLowerCase());

        // 2. Category Filter
        let matchesCategory = true;
        if (selectedCategory === "Favorites") {
          matchesCategory = favorites.includes(game.id);
        } else if (selectedCategory !== "All") {
          matchesCategory = game.category === selectedCategory;
        }

        // 3. Difficulty Filter
        const matchesDifficulty = 
          selectedDifficulty === "All" || game.difficulty === selectedDifficulty;

        return matchesSearch && matchesCategory && matchesDifficulty;
      })
      .sort((a, b) => {
        if (sortBy === "rating") {
          return b.rating - a.rating;
        }
        if (sortBy === "alphabetical") {
          return a.title.localeCompare(b.title);
        }
        if (sortBy === "year") {
          return (b.releaseYear || 0) - (a.releaseYear || 0);
        }
        return 0;
      });
  }, [games, searchQuery, selectedCategory, selectedDifficulty, sortBy, favorites]);

  return (
    <div className="min-h-screen bg-[#050507] cyber-grid text-gray-100 flex flex-col font-sans transition-all duration-300">
      
      {/* Dynamic Background Accents */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none animate-pulse" />

      {/* Main Top Header Navigation */}
      <header className="border-b border-white/5 bg-black/40 backdrop-blur-md sticky top-0 z-40 select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          
          {/* Logo Brand branding */}
          <div 
            onClick={() => {
              playClickSound();
              setSelectedGame(null);
            }}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="p-2.5 rounded bg-cyan-500 text-black shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
              <Gamepad2 className="w-5 h-5 fill-black" />
            </div>
            <div>
              <h1 className="text-lg font-black text-white tracking-wider flex items-center gap-1.5 uppercase font-sans">
                <span>UNBLOCKED</span>
                <span className="text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded text-[10px] border border-cyan-400/20 font-bold tracking-widest">PORTAL</span>
              </h1>
              <p className="text-[9px] font-mono text-white/30 uppercase tracking-widest mt-0.5">Secure HTML5 Portal • Client Cache</p>
            </div>
          </div>

          {/* Quick Header Controls */}
          <div className="flex items-center gap-2">
            {/* Play Sound Engine Indicator */}
            <button
              id="header-mute-toggle"
              onClick={handleToggleMute}
              className="p-2.5 rounded bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all cursor-pointer"
              title={soundMuted ? "Unmute Retro UI Sound" : "Mute Retro UI Sound"}
            >
              {soundMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
            </button>

            {/* Custom Game Add trigger */}
            <button
              id="header-add-custom"
              onClick={() => {
                playPowerupSound();
                setIsCustomModalOpen(true);
              }}
              className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xs rounded transition-all cursor-pointer shadow-lg shadow-cyan-500/10"
            >
              <Plus className="w-3.5 h-3.5 text-black stroke-[3]" />
              <span>ADD GAME URL</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container Stage */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <AnimatePresence mode="wait">
          {selectedGame ? (
            // ACTIVE PLAY VIEW WINDOW
            <motion.div
              key="game-player-mode"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              <GamePlayer
                game={selectedGame}
                isFavorite={favorites.includes(selectedGame.id)}
                onBack={() => setSelectedGame(null)}
                onToggleFavorite={handleToggleFavorite}
                soundMuted={soundMuted}
                onToggleMute={handleToggleMute}
              />
            </motion.div>
          ) : (
            // BROWSE DASHBOARD HUB VIEW
            <motion.div
              key="catalog-browse-mode"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* Featured Banner Hero */}
              {featuredGame && (
                <HeroSection
                  game={featuredGame}
                  isFavorite={favorites.includes(featuredGame.id)}
                  onSelect={handleSelectGame}
                  onToggleFavorite={handleToggleFavorite}
                />
              )}

              {/* Filtering Controls Bar */}
              <div className="glass p-5 rounded-xl mb-8 flex flex-col gap-4 border border-white/5 select-none">
                
                {/* Search Bar Input */}
                <div className="relative w-full">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/30">
                    <Search className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search games by title, genre, tagline or play style..."
                    className="w-full bg-black/40 border border-white/10 rounded px-4 py-3 pl-10 text-xs text-white placeholder-white/20 focus:outline-none focus:border-cyan-400 transition-colors"
                  />
                  {searchQuery && (
                    <button
                      id="clear-search-btn"
                      onClick={() => setSearchQuery("")}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[10px] font-mono text-white/40 hover:text-white"
                    >
                      CLEAR
                    </button>
                  )}
                </div>

                {/* Filters Row */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                  
                  {/* Category badgework */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {categories.map((cat) => {
                      const isActive = selectedCategory === cat;
                      return (
                        <button
                          key={cat}
                          id={`cat-filter-${cat}`}
                          onClick={() => {
                            playClickSound();
                            setSelectedCategory(cat);
                          }}
                          className={`px-4 py-2 rounded text-[10px] font-bold transition-all cursor-pointer uppercase ${
                            isActive
                              ? "bg-cyan-500 text-black shadow-lg shadow-cyan-500/20 font-black"
                              : "bg-white/5 border border-white/5 text-white/60 hover:text-white hover:bg-white/10"
                          }`}
                        >
                          {cat}
                        </button>
                      );
                    })}
                  </div>

                  {/* Settings Filters select */}
                  <div className="flex flex-wrap items-center gap-3 text-[10px] font-mono">
                    
                    {/* Sort By selection */}
                    <div className="flex items-center gap-1.5 bg-black/40 border border-white/10 p-1.5 rounded text-white/60">
                      <span className="text-[9px] uppercase text-white/30 pl-1">SORT:</span>
                      <select
                        value={sortBy}
                        onChange={(e) => {
                          playClickSound();
                          setSortBy(e.target.value);
                        }}
                        className="bg-transparent text-white focus:outline-none cursor-pointer font-sans font-medium"
                      >
                        <option value="rating">Highest Rated</option>
                        <option value="alphabetical">Alphabetical (A-Z)</option>
                        <option value="year">Newest First</option>
                      </select>
                    </div>

                    {/* Difficulty selection */}
                    <div className="flex items-center gap-1.5 bg-black/40 border border-white/10 p-1.5 rounded text-white/60">
                      <span className="text-[9px] uppercase text-white/30 pl-1">DIFFICULTY:</span>
                      <select
                        value={selectedDifficulty}
                        onChange={(e) => {
                          playClickSound();
                          setSelectedDifficulty(e.target.value);
                        }}
                        className="bg-transparent text-white focus:outline-none cursor-pointer font-sans font-medium"
                      >
                        <option value="All">All Levels</option>
                        <option value="Easy">Easy Only</option>
                        <option value="Medium">Medium Only</option>
                        <option value="Hard">Hard Only</option>
                      </select>
                    </div>

                  </div>

                </div>
              </div>

              {/* Title Section header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <h2 className="text-sm font-black text-white uppercase tracking-widest font-sans">
                    {selectedCategory === "Favorites" ? "Favorite Games" : `${selectedCategory} Catalog`}
                  </h2>
                  <span className="text-[10px] font-mono text-white/40 bg-white/5 border border-white/5 px-2 py-0.5 rounded">
                    {filteredGames.length}
                  </span>
                </div>

                {/* Mobile custom add url button */}
                <button
                  id="mobile-add-custom-btn"
                  onClick={() => {
                    playPowerupSound();
                    setIsCustomModalOpen(true);
                  }}
                  className="sm:hidden flex items-center gap-1 text-[10px] font-bold text-black bg-cyan-500 px-3 py-1.5 rounded shadow-md"
                >
                  <Plus className="w-3.5 h-3.5 text-black stroke-[3]" />
                  <span>ADD URL</span>
                </button>
              </div>

              {/* Grid Games list */}
              {filteredGames.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-white/10 rounded-2xl bg-white/2 select-none">
                  <Gamepad2 className="w-10 h-10 text-white/20 mx-auto mb-3 animate-bounce" />
                  <p className="text-xs font-mono text-white/50">No unblocked games match those criteria.</p>
                  <p className="text-[10px] text-white/30 mt-1">Try adjusting your filters or search query.</p>
                  {selectedCategory === "Favorites" && (
                    <button
                      onClick={() => setSelectedCategory("All")}
                      className="mt-4 text-xs font-bold text-cyan-400 hover:underline cursor-pointer"
                    >
                      BROWSE ALL GAMES
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredGames.map((game) => (
                    <div key={game.id} className="relative">
                      <GameCard
                        game={game}
                        isFavorite={favorites.includes(game.id)}
                        onSelect={handleSelectGame}
                        onToggleFavorite={handleToggleFavorite}
                        playCount={playCounts[game.id] || 0}
                      />
                      
                      {/* Trash bin overlay for custom-added cards */}
                      {game.isCustom && (
                        <button
                          id={`delete-custom-${game.id}`}
                          onClick={(e) => handleDeleteCustomGame(game.id, e)}
                          className="absolute bottom-5 left-5 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded bg-rose-950/90 border border-rose-500/30 hover:border-rose-500 hover:bg-rose-900 text-rose-300 text-[9px] font-mono transition-colors"
                          title="Delete custom game card"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>REMOVE</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Main Footer */}
      <footer className="border-t border-white/5 bg-black/20 backdrop-blur-md py-8 mt-12 select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col md:flex-row items-center justify-between gap-6 text-[10px] text-white/40 font-mono">
          <div className="text-left">
            <p className="font-bold text-white/70 uppercase tracking-widest text-[9px] mb-1">UNBLOCKED HUB PROTOCOL</p>
            <p>Built with React, Motion & Tailwind. Sandbox container ready.</p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <button
              id="clear-all-data-btn"
              onClick={handleClearHubData}
              className="px-3 py-1.5 rounded border border-rose-500/30 hover:border-rose-500 text-rose-400 hover:bg-rose-500/10 text-[9px] tracking-wider transition-all cursor-pointer uppercase font-bold"
              title="Factory reset local storage records"
            >
              FACTORY RESET HUB
            </button>
            <span>|</span>
            <div className="flex items-center gap-1 text-white/60">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>100% Client-Side Persistence</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Custom Game Add Modal Dialog */}
      <AnimatePresence>
        {isCustomModalOpen && (
          <CustomGameModal
            onClose={() => setIsCustomModalOpen(false)}
            onAddGame={handleAddCustomGame}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
