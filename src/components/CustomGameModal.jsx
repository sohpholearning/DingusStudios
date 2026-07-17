import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Sparkles, Plus, HelpCircle, ShieldAlert } from "lucide-react";
import { playClickSound, playPowerupSound } from "../utils/sound";

export default function CustomGameModal({
  onClose,
  onAddGame,
}) {
  const [title, setTitle] = useState("");
  const [iframeUrl, setIframeUrl] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Custom");
  const [difficulty, setDifficulty] = useState("Easy");
  const [errorText, setErrorText] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorText("");

    if (!title.trim() || !iframeUrl.trim()) {
      setErrorText("Title and Game URL fields are strictly required.");
      playClickSound();
      return;
    }

    // Basic URL parsing/sanitization
    let formattedUrl = iframeUrl.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = "https://" + formattedUrl;
    }

    try {
      new URL(formattedUrl);
    } catch (_) {
      setErrorText("Please enter a valid absolute web URL destination.");
      playClickSound();
      return;
    }

    // Play successful submission bleep
    playPowerupSound();

    // Trigger parent callback
    onAddGame({
      id: "custom-" + Date.now(),
      title: title.trim(),
      description: description.trim() || "A user-submitted unblocked iframe game card running on sandbox mode.",
      controls: [
        { key: "MOUSE / TAP", action: "Interactions and menus navigation" },
        { key: "KEYBOARD", action: "Standard input for supported games" }
      ],
      category,
      iframeUrl: formattedUrl,
      themeColor: "from-cyan-500 to-blue-600",
      glowColor: "rgba(6, 182, 212, 0.4)",
      difficulty,
      iconName: "Gamepad2",
      rating: 5.0,
      releaseYear: new Date().getFullYear(),
      isCustom: true,
    });

    // Reset state values
    setTitle("");
    setIframeUrl("");
    setDescription("");
    setCategory("Custom");
    setDifficulty("Easy");
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop overlay blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            playClickSound();
            onClose();
          }}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
        />

        {/* Modal Main Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-lg glass border border-white/5 rounded-xl p-6 md:p-8 shadow-2xl overflow-hidden"
        >
          {/* Glow backdrop */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between mb-5 relative z-10">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              <h3 className="text-xl font-black text-white tracking-tight">Add Custom Iframe Game</h3>
            </div>
            <button
              id="close-modal-btn"
              onClick={() => {
                playClickSound();
                onClose();
              }}
              className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Informative notice */}
          <div className="p-3 bg-cyan-500/5 border border-cyan-500/10 rounded-xl flex items-start gap-2.5 text-xs text-cyan-300 font-mono mb-6 relative z-10">
            <HelpCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-cyan-400" />
            <p className="leading-relaxed">
              Have a game you love? Paste the unblocked direct game URL below to integrate it. Ensure the URL supports iframe embedding.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
            <div>
              <label className="block text-xs font-mono text-white/40 uppercase tracking-widest mb-1.5">Game Title <span className="text-cyan-400">*</span></label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Space Combat"
                className="w-full bg-black/40 border border-white/10 rounded px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-cyan-400 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-white/40 uppercase tracking-widest mb-1.5">Iframe Game URL <span className="text-cyan-400">*</span></label>
              <input
                type="text"
                value={iframeUrl}
                onChange={(e) => setIframeUrl(e.target.value)}
                placeholder="https://example.com/game/"
                className="w-full bg-black/40 border border-white/10 rounded px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-cyan-400 transition-colors font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-white/40 uppercase tracking-widest mb-1.5">Brief Description (Optional)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief summary of game goals..."
                rows={2}
                className="w-full bg-black/40 border border-white/10 rounded px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-cyan-400 transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-white/40 uppercase tracking-widest mb-1.5">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded px-3 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400 transition-colors [&>option]:bg-neutral-900"
                >
                  <option value="Custom">Custom</option>
                  <option value="Arcade">Arcade</option>
                  <option value="Action">Action</option>
                  <option value="Retro">Retro</option>
                  <option value="Puzzle">Puzzle</option>
                  <option value="Strategy">Strategy</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-white/40 uppercase tracking-widest mb-1.5">Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded px-3 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400 transition-colors [&>option]:bg-neutral-900"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
            </div>

            {errorText && (
              <p className="text-xs font-mono text-rose-400 flex items-center gap-1.5 bg-rose-500/5 border border-rose-500/10 p-2.5 rounded">
                <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                <span>{errorText}</span>
              </p>
            )}

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/5">
              <button
                id="cancel-modal-btn"
                type="button"
                onClick={() => {
                  playClickSound();
                  onClose();
                }}
                className="px-4 py-2.5 rounded border border-white/10 text-xs font-mono text-white/70 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
              >
                CANCEL
              </button>
              <button
                id="submit-custom-game-btn"
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2.5 rounded bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-mono font-black tracking-wider transition-all cursor-pointer shadow-lg shadow-cyan-500/10"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>ADD GAME TO HUB</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
