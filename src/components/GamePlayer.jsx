import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ArrowLeft, Star, Volume2, VolumeX, Maximize2, 
  RotateCcw, Tv, Sparkles, Trophy, CalendarRange, 
  Send, Trash2, ShieldAlert, Info, HelpCircle, Gamepad2
} from "lucide-react";
import { playClickSound, playSuccessSound, playTickSound } from "../utils/sound";

export default function GamePlayer({
  game,
  isFavorite,
  onBack,
  onToggleFavorite,
  soundMuted,
  onToggleMute,
}) {
  const [crtEnabled, setCrtEnabled] = useState(false);
  const [ambientGlow, setAmbientGlow] = useState(true);
  const [isIframeLoading, setIsIframeLoading] = useState(true);
  const [theatreMode, setTheatreMode] = useState(false);
  const [logs, setLogs] = useState([]);
  const [newScore, setNewScore] = useState("");
  const [newNote, setNewNote] = useState("");
  const [errorText, setErrorText] = useState("");

  const iframeRef = useRef(null);
  const containerRef = useRef(null);

  // Load custom scores & notes from localStorage
  useEffect(() => {
    const storedLogs = localStorage.getItem(`game_logs_${game.id}`);
    if (storedLogs) {
      try {
        setLogs(JSON.parse(storedLogs));
      } catch (err) {
        console.error("Error reading game logs:", err);
      }
    } else {
      setLogs([]);
    }
    // Scroll player into view
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [game.id]);

  // Handle saving high scores or general player notes
  const handleAddLog = (e) => {
    e.preventDefault();
    if (!newScore.trim() && !newNote.trim()) {
      setErrorText("Please enter a score or note.");
      return;
    }

    const scoreNum = newScore.trim() ? parseInt(newScore.trim(), 10) : undefined;
    if (newScore.trim() && isNaN(scoreNum || 0)) {
      setErrorText("Score must be a valid number.");
      return;
    }

    setErrorText("");
    playSuccessSound();

    const newLog = {
      id: `log_${Date.now()}`,
      gameId: game.id,
      score: scoreNum,
      note: newNote.trim() || undefined,
      timestamp: new Date().toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    const updatedLogs = [newLog, ...logs];
    setLogs(updatedLogs);
    localStorage.setItem(`game_logs_${game.id}`, JSON.stringify(updatedLogs));

    setNewScore("");
    setNewNote("");
  };

  // Delete a specific game log entry
  const handleDeleteLog = (logId) => {
    playTickSound();
    const updatedLogs = logs.filter((l) => l.id !== logId);
    setLogs(updatedLogs);
    localStorage.setItem(`game_logs_${game.id}`, JSON.stringify(updatedLogs));
  };

  // Reload the game iframe
  const handleReloadGame = () => {
    playClickSound();
    setIsIframeLoading(true);
    if (iframeRef.current) {
      iframeRef.current.src = game.iframeUrl;
    }
  };

  // Native browser fullscreen mode trigger
  const handleToggleFullscreen = () => {
    playClickSound();
    if (containerRef.current) {
      if (!document.fullscreenElement) {
        containerRef.current.requestFullscreen().catch((err) => {
          console.error("Error enabling fullscreen mode:", err);
        });
      } else {
        document.exitFullscreen();
      }
    }
  };

  // Toggle buttons bleep
  const toggleCrt = () => {
    playTickSound();
    setCrtEnabled(!crtEnabled);
  };

  const toggleGlow = () => {
    playTickSound();
    setAmbientGlow(!ambientGlow);
  };

  const toggleTheatre = () => {
    playTickSound();
    setTheatreMode(!theatreMode);
  };

  return (
    <div id="active-game-workspace" className="w-full">
      {/* Top Breadcrumb Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <button
          id="back-to-hub-btn"
          onClick={() => {
            playClickSound();
            onBack();
          }}
          className="flex items-center gap-2 text-xs font-mono text-white/80 hover:text-white bg-white/5 border border-white/10 px-4 py-2.5 rounded transition-all cursor-pointer hover:bg-white/10"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>BACK TO HUB</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Audio toggle button */}
          <button
            id="sound-toggle-btn"
            onClick={() => {
              onToggleMute();
              playClickSound();
            }}
            className="p-2.5 rounded bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all cursor-pointer"
            title={soundMuted ? "Unmute Hub Sounds" : "Mute Hub Sounds"}
          >
            {soundMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>

          {/* Favorited Star */}
          <button
            id="workspace-fav-btn"
            onClick={(e) => {
              playClickSound();
              onToggleFavorite(game.id, e);
            }}
            className={`flex items-center gap-1.5 text-xs font-mono px-4 py-2.5 border rounded bg-white/5 transition-all cursor-pointer hover:bg-white/10 ${
              isFavorite ? "text-cyan-400 border-cyan-500/30 bg-cyan-500/5" : "text-white/75 border-white/10"
            }`}
          >
            <Star className={`w-4 h-4 ${isFavorite ? "fill-cyan-400 text-cyan-400" : ""}`} />
            <span>{isFavorite ? "FAVORITED" : "FAVORITE"}</span>
          </button>
        </div>
      </div>

      {/* Main Grid View */}
      <div className={`grid grid-cols-1 ${theatreMode ? "lg:grid-cols-1" : "lg:grid-cols-12"} gap-8 items-start transition-all duration-300`}>
        
        {/* Left Console Workspace Column */}
        <div className={`${theatreMode ? "lg:col-span-12" : "lg:col-span-8"} flex flex-col gap-6`}>
          
          {/* Header Title Section (hidden in full theatre mode is optional, let's keep a compact one) */}
          <div className="glass p-5 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-white/5">
            <div>
              <div className="flex items-center gap-2 text-[10px] font-mono text-white/40 mb-1">
                <span className="text-cyan-400 uppercase tracking-widest font-black">{game.category}</span>
                <span>•</span>
                <span>Released in {game.releaseYear || "Unknown"}</span>
              </div>
              <h2 className="text-xl font-black text-white tracking-tight">{game.title}</h2>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-mono text-white/40">
              <span>Rating:</span>
              <span className="text-cyan-400 font-bold">{game.rating.toFixed(1)}/5.0</span>
            </div>
          </div>

          {/* Interactive CRT IFrame Container Box */}
          <div 
            ref={containerRef}
            style={{ 
              boxShadow: ambientGlow && !isIframeLoading ? `0 25px 50px -12px ${game.glowColor || "rgba(6, 182, 212, 0.2)"}` : "none" 
            }}
            className="relative w-full aspect-[4/3] max-h-[640px] md:aspect-video rounded-2xl border border-white/10 bg-black overflow-hidden flex flex-col transition-all duration-300"
          >
            
            {/* Retro Console Border Frame Bar */}
            <div className="bg-black/80 border-b border-white/5 px-4 py-3 flex items-center justify-between text-[10px] font-mono text-white/50 select-none">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-white font-bold uppercase tracking-widest text-[9px]">CONSOLE STAGE ONLINE</span>
              </div>
              
              <div className="flex flex-wrap items-center gap-2">
                {/* CRT screen Toggle */}
                <button 
                  onClick={toggleCrt}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded text-[9px] font-bold transition-all cursor-pointer ${
                    crtEnabled ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30" : "bg-white/5 hover:bg-white/10 text-white/60"
                  }`}
                  title="Toggle Retro CRT Scanlines Effect"
                >
                  <Tv className="w-3 h-3" />
                  <span>CRT: {crtEnabled ? "ON" : "OFF"}</span>
                </button>

                {/* Glow lights toggle */}
                <button 
                  onClick={toggleGlow}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded text-[9px] font-bold transition-all cursor-pointer ${
                    ambientGlow ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30" : "bg-white/5 hover:bg-white/10 text-white/60"
                  }`}
                  title="Toggle Ambient Console Backlights"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>GLOW: {ambientGlow ? "ON" : "OFF"}</span>
                </button>

                {/* Theatre Mode Toggle */}
                <button 
                  onClick={toggleTheatre}
                  className={`hidden md:flex items-center gap-1 px-2.5 py-1 rounded text-[9px] font-bold transition-all cursor-pointer ${
                    theatreMode ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30" : "bg-white/5 hover:bg-white/10 text-white/60"
                  }`}
                  title="Toggle Large Theatre Mode Layout"
                >
                  <span>THEATRE</span>
                </button>

                {/* Fullscreen Trigger */}
                <button 
                  onClick={handleToggleFullscreen}
                  className="p-1 rounded bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
                  title="True Fullscreen Mode"
                >
                  <Maximize2 className="w-3 h-3" />
                </button>

                {/* Reload trigger */}
                <button 
                  onClick={handleReloadGame}
                  className="p-1 rounded bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
                  title="Reboot / Restart Game"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* IFrame Viewport Wrapper */}
            <div className="relative flex-1 bg-black">
              
              {/* Retro CRT Overlays */}
              {crtEnabled && (
                <div className="crt-overlay crt-flicker" />
              )}

              {/* Loader Spinner Overlay */}
              {isIframeLoading && (
                <div className="absolute inset-0 bg-black flex flex-col items-center justify-center gap-4 z-20">
                  <div className="relative w-10 h-10">
                    <span className="absolute inset-0 rounded-full border-2 border-white/5" />
                    <span className="absolute inset-0 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
                  </div>
                  <div className="text-center">
                    <p className="text-[9px] font-mono text-cyan-400 uppercase tracking-widest animate-pulse">SYNCHRONIZING CONSOLE...</p>
                    <p className="text-[9px] font-mono text-white/30 mt-1">Booting secure unblocked iframe</p>
                  </div>
                </div>
              )}

              {/* The Actual Secure Frame */}
              <iframe
                ref={iframeRef}
                src={game.iframeUrl}
                title={game.title}
                referrerPolicy="no-referrer"
                allow="autoplay; gamepad; fullscreen; keyboard"
                onLoad={() => setIsIframeLoading(false)}
                className="w-full h-full border-none bg-black select-none"
              />
            </div>

            {/* Console Bottom Status Rim */}
            <div className="bg-black border-t border-white/5 px-4 py-2.5 flex items-center justify-between text-[9px] font-mono text-white/30">
              <span className="uppercase">EMBEDDED SECURE PROTOCOL</span>
              <span className="flex items-center gap-1">
                <span>PRESS</span>
                <span className="bg-white/10 text-white px-1 rounded">ESC</span>
                <span>TO ESCAPE FULLSCREEN</span>
              </span>
            </div>
          </div>

          {/* Quick Notice about Iframe permissions */}
          <div className="p-4 glass border border-cyan-500/20 rounded-xl flex items-start gap-3 text-xs text-cyan-400 font-mono">
            <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-cyan-400" />
            <p className="leading-relaxed">
              <strong>Unblocked Sandbox Protocol:</strong> Games run safely within sandboxed frames. If keyboard controls aren't registering, click inside the game window once to focus it. Some external game features like remote cloud servers may have limits in frame containers.
            </p>
          </div>

          {/* Controls & Description - expanded below frame when in theatre mode */}
          {theatreMode && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
              {/* How to play card */}
              <div className="glass border border-white/5 p-5 rounded-xl">
                <h3 className="text-xs font-black text-white uppercase tracking-widest mb-3 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-cyan-400" />
                  <span>How to Play & Game Intel</span>
                </h3>
                <p className="text-xs text-white/70 leading-relaxed mb-4">
                  {game.longDescription || game.description}
                </p>
                <div className="text-[10px] text-white/40 font-mono">
                  Release details: {game.releaseYear ? `Circa ${game.releaseYear}` : "Latest HTML5 Release"} | Category: {game.category}
                </div>
              </div>

              {/* Game Key Controls Map */}
              <div className="glass border border-white/5 p-5 rounded-xl">
                <h3 className="text-xs font-black text-white uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Gamepad2 className="w-4 h-4 text-cyan-400" />
                  <span>Keyboard & Console Controls</span>
                </h3>
                {game.controls && game.controls.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {game.controls.map((ctrl, i) => (
                      <div key={i} className="flex items-center justify-between bg-black/40 border border-white/5 p-2.5 rounded text-xs font-mono">
                        <span className="text-cyan-400 bg-cyan-400/10 px-2 py-1 rounded border border-cyan-400/20 font-bold">{ctrl.key}</span>
                        <span className="text-white/80">{ctrl.action}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-white/40 italic">No specific keyboard mapping declared. Use standard arrow keys, mouse click, WASD, or tap on the active game view.</p>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Right Sidebar Column - metadata & personal metrics logs (hidden or placed below in full theatre) */}
        {!theatreMode && (
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* Intel Deck */}
            <div className="glass border border-white/5 p-5 rounded-xl">
              <h3 className="text-xs font-black text-white uppercase tracking-widest mb-3 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-cyan-400" />
                <span>Intel Deck</span>
              </h3>
              <p className="text-xs text-white/70 leading-relaxed mb-4">
                {game.longDescription || game.description}
              </p>
              
              <div className="border-t border-white/5 pt-4 mt-4">
                <h4 className="text-[10px] font-mono text-white/30 uppercase tracking-widest mb-2">Controls Mapping</h4>
                {game.controls && game.controls.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {game.controls.map((ctrl, i) => (
                      <div key={i} className="flex items-start justify-between bg-black/40 p-2 rounded text-xs font-mono border border-white/5">
                        <span className="text-cyan-400 bg-cyan-400/5 px-1.5 py-0.5 rounded border border-cyan-400/15 font-bold text-[9px] whitespace-nowrap mr-2">{ctrl.key}</span>
                        <span className="text-white/80 text-right">{ctrl.action}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-white/40 italic">Use standard keyboard arrow keys, WASD, space, or mouse dragging.</p>
                )}
              </div>
            </div>

            {/* Retro Score Logger & Notes Organizer */}
            <div className="glass border border-white/5 p-5 rounded-xl flex flex-col">
              <h3 className="text-xs font-black text-white uppercase tracking-widest mb-1.5 flex items-center gap-2">
                <Trophy className="w-4.5 h-4.5 text-cyan-400" />
                <span>Player Record Log</span>
              </h3>
              <p className="text-[9px] text-white/30 font-mono mb-4">Track high scores and logs client-side</p>

              {/* Form Input */}
              <form onSubmit={handleAddLog} className="space-y-3">
                <div className="grid grid-cols-1 gap-2.5">
                  <div>
                    <label className="block text-[9px] font-mono text-white/40 uppercase tracking-widest mb-1.5">Score / High Score (Optional)</label>
                    <input
                      type="text"
                      value={newScore}
                      onChange={(e) => setNewScore(e.target.value)}
                      placeholder="e.g., 2048"
                      className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-cyan-400 transition-colors font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-mono text-white/40 uppercase tracking-widest mb-1.5">Game Notes / Commentary</label>
                    <textarea
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Beat my record on Level 3!"
                      rows={2}
                      className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-cyan-400 transition-colors"
                    />
                  </div>
                </div>

                {errorText && (
                  <p className="text-xs font-mono text-rose-400 flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>{errorText}</span>
                  </p>
                )}

                <button
                  id="save-log-btn"
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-black rounded text-xs font-mono tracking-wider transition-all cursor-pointer shadow-md shadow-cyan-500/10"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>RECORD SCORE / NOTE</span>
                </button>
              </form>

              {/* Logs List */}
              <div className="mt-5 border-t border-white/5 pt-4 flex-1">
                <h4 className="text-[10px] font-mono text-white/30 uppercase tracking-widest mb-3">Saved Progress Records</h4>
                
                {logs.length === 0 ? (
                  <div className="text-center py-6 border border-dashed border-white/10 rounded bg-black/20 text-white/30 text-xs italic font-mono">
                    No scores recorded yet. Submit your first score above!
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                    <AnimatePresence initial={false}>
                      {logs.map((log) => (
                        <motion.div
                          key={log.id}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="group/log relative bg-black/40 border border-white/5 rounded p-3 flex flex-col justify-between"
                        >
                          <div className="flex items-start justify-between gap-2">
                            {log.score !== undefined ? (
                              <div className="flex items-center gap-1 text-xs font-bold text-cyan-400 font-mono">
                                <Trophy className="w-3.5 h-3.5" />
                                <span>{log.score.toLocaleString()}</span>
                              </div>
                            ) : (
                              <div className="text-[10px] font-mono text-white/30">Note log</div>
                            )}

                            <button
                              id={`delete-log-${log.id}`}
                              onClick={() => handleDeleteLog(log.id)}
                              className="p-1 rounded text-white/40 hover:text-rose-400 hover:bg-rose-500/10 opacity-0 group-hover/log:opacity-100 transition-all"
                              title="Delete log entry"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {log.note && (
                            <p className="text-xs text-white/70 leading-normal mt-1.5 break-words">
                              {log.note}
                            </p>
                          )}

                          <div className="text-[9px] font-mono text-white/30 mt-2 flex items-center gap-1">
                            <CalendarRange className="w-2.5 h-2.5" />
                            <span>{log.timestamp}</span>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
