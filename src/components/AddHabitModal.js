"use client";

// ===== ADD HABIT MODAL =====
// Simple overlay with a name field and emoji picker grid.

import { useState } from "react";

// A small hand-picked set of emojis (no library needed)
const EMOJIS = [
  "💪", "🏃", "📚", "💧", "🧘", "😴",
  "🍎", "💊", "✍️", "🎯", "🏋️", "🧹",
  "🎵", "💻", "🙏", "🌅",
];

export default function AddHabitModal({ onAdd, onClose }) {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("🎯");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    await onAdd(name.trim(), icon);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Dark backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal card */}
      <div className="relative w-full max-w-md backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl">
        <h3 className="text-xl font-bold mb-6">Add New Habit</h3>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Habit Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 text-white placeholder-gray-500 transition-colors"
              placeholder="e.g., Morning Exercise"
              required
              autoFocus
              maxLength={50}
            />
          </div>

          {/* Emoji grid */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Choose Icon
            </label>
            <div className="grid grid-cols-8 gap-2">
              {EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setIcon(emoji)}
                  className={`p-2 rounded-xl text-xl transition-all duration-200 cursor-pointer ${
                    icon === emoji
                      ? "bg-purple-500/30 border-2 border-purple-500 scale-110"
                      : "bg-white/5 border border-transparent hover:bg-white/10"
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 font-semibold transition-all duration-300 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? "Adding…" : "Add Habit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}