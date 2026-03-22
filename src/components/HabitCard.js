"use client";

// ===== SINGLE HABIT ROW =====
// Shows icon, name, streak badge, checkmark toggle, and delete.

import { useState } from "react";

export default function HabitCard({
  habit,
  isCompleted,
  streak,
  onToggle,
  onDelete,
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div
      className={`backdrop-blur-xl border rounded-2xl p-5 transition-all duration-300 hover:scale-[1.01] ${
        isCompleted
          ? "bg-green-500/10 border-green-500/30"
          : "bg-white/5 border-white/10 hover:bg-white/[0.08]"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        {/* Left: toggle + habit info */}
        <div className="flex items-center gap-4 min-w-0">
          {/* Checkmark button */}
          <button
            onClick={onToggle}
            className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center transition-all duration-300 cursor-pointer ${
              isCompleted
                ? "bg-green-500 shadow-lg shadow-green-500/30"
                : "bg-white/10 border border-white/20 hover:border-purple-500"
            }`}
          >
            {isCompleted && (
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
          </button>

          {/* Icon + name */}
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xl shrink-0">{habit.icon}</span>
            <span
              className={`font-semibold truncate ${
                isCompleted ? "line-through text-gray-500" : "text-white"
              }`}
            >
              {habit.name}
            </span>
          </div>
        </div>

        {/* Right: streak + delete */}
        <div className="flex items-center gap-3 shrink-0">
          {streak > 0 && (
            <span className="px-3 py-1 rounded-lg bg-orange-500/10 text-orange-400 text-sm font-medium whitespace-nowrap">
              🔥 {streak}d
            </span>
          )}

          <button
            onClick={() => setConfirmDelete(!confirmDelete)}
            className="p-2 rounded-lg hover:bg-white/10 transition-all duration-300 text-gray-500 hover:text-red-400 cursor-pointer"
            title="Delete habit"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Delete confirmation row */}
      {confirmDelete && (
        <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-end gap-2">
          <span className="text-sm text-gray-400 mr-auto">
            Delete this habit?
          </span>
          <button
            onClick={() => setConfirmDelete(false)}
            className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-sm transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onDelete}
            className="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm transition-all cursor-pointer"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}