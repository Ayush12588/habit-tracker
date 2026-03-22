"use client";

// ===== DASHBOARD =====
// The core screen: stats bar, habit list, add/toggle/delete habits.

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import HabitCard from "@/components/HabitCard";
import AddHabitModal from "@/components/AddHabitModal";

// ──────────────────────────────
// HELPERS
// ──────────────────────────────

/** Returns today's date as YYYY-MM-DD in the user's **local** timezone. */
function getTodayLocal() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/** Returns yesterday in the same format. */
function getYesterdayLocal() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Calculate a habit's current streak from its log entries.
 *
 * Rules:
 *  • The most recent log must be today or yesterday (otherwise streak = 0).
 *  • Count consecutive calendar days going backwards.
 */
function calculateStreak(logs) {
  if (!logs || logs.length === 0) return 0;

  // Unique dates, newest first
  const dates = [...new Set(logs.map((l) => l.completed_date))]
    .sort()
    .reverse();

  const today = getTodayLocal();
  const yesterday = getYesterdayLocal();

  // Streak must touch today or yesterday
  if (dates[0] !== today && dates[0] !== yesterday) return 0;

  let streak = 1;
  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1] + "T00:00:00");
    const curr = new Date(dates[i] + "T00:00:00");
    const diffDays = (prev - curr) / 86_400_000; // ms in a day
    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

// ──────────────────────────────
// COMPONENT
// ──────────────────────────────

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [habits, setHabits] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const today = getTodayLocal();

  // ── Guard: redirect if not logged in ──
  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  // ── Fetch habits + all logs ──
  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      const [habitsRes, logsRes] = await Promise.all([
        supabase
          .from("habits")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: true }),
        supabase
          .from("habit_logs")
          .select("*")
          .eq("user_id", user.id)
          .order("completed_date", { ascending: false }),
      ]);

      if (habitsRes.error) throw habitsRes.error;
      if (logsRes.error) throw logsRes.error;

      setHabits(habitsRes.data ?? []);
      setLogs(logsRes.data ?? []);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Toggle today's completion ──
  const toggleHabit = async (habitId) => {
    const existing = logs.find(
      (l) => l.habit_id === habitId && l.completed_date === today
    );

    if (existing) {
      // UN-complete
      const { error } = await supabase
        .from("habit_logs")
        .delete()
        .eq("id", existing.id);
      if (!error) setLogs((prev) => prev.filter((l) => l.id !== existing.id));
    } else {
      // COMPLETE
      const { data, error } = await supabase
        .from("habit_logs")
        .insert({ habit_id: habitId, user_id: user.id, completed_date: today })
        .select()
        .single();
      if (!error && data) setLogs((prev) => [...prev, data]);
    }
  };

  // ── Delete a habit (cascade removes its logs too) ──
  const deleteHabit = async (habitId) => {
    const { error } = await supabase
      .from("habits")
      .delete()
      .eq("id", habitId);
    if (!error) {
      setHabits((prev) => prev.filter((h) => h.id !== habitId));
      setLogs((prev) => prev.filter((l) => l.habit_id !== habitId));
    }
  };

  // ── Add a habit ──
  const addHabit = async (name, icon) => {
    const { data, error } = await supabase
      .from("habits")
      .insert({ user_id: user.id, name, icon })
      .select()
      .single();
    if (!error && data) {
      setHabits((prev) => [...prev, data]);
      setShowAddModal(false);
    }
  };

  // ── Derived stats ──
  const completedToday = habits.filter((h) =>
    logs.some((l) => l.habit_id === h.id && l.completed_date === today)
  ).length;

  const bestStreak = habits.reduce((max, h) => {
    const s = calculateStreak(logs.filter((l) => l.habit_id === h.id));
    return Math.max(max, s);
  }, 0);

  // ── Loading / auth guard ──
  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-white" />
      </div>
    );
  }

  // ── Render ──
  return (
    <div className="min-h-screen pb-12">
      <Header user={user} />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* ── STATS ROW ── */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-8">
          {/* Total habits */}
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-6 text-center hover:bg-white/[0.08] transition-all duration-300">
            <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {habits.length}
            </p>
            <p className="text-gray-400 text-xs sm:text-sm mt-1">
              Total Habits
            </p>
          </div>

          {/* Completed today */}
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-6 text-center hover:bg-white/[0.08] transition-all duration-300">
            <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              {completedToday}
            </p>
            <p className="text-gray-400 text-xs sm:text-sm mt-1">Done Today</p>
          </div>

          {/* Best streak */}
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-6 text-center hover:bg-white/[0.08] transition-all duration-300">
            <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent">
              {bestStreak}🔥
            </p>
            <p className="text-gray-400 text-xs sm:text-sm mt-1">
              Best Streak
            </p>
          </div>
        </div>

        {/* ── SECTION HEADER ── */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold">
              Today&apos;s Habits
            </h2>
            <p className="text-gray-400 text-sm">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 sm:px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25 hover:scale-105 text-sm cursor-pointer"
          >
            + Add Habit
          </button>
        </div>

        {/* ── HABIT LIST ── */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-white" />
          </div>
        ) : habits.length === 0 ? (
          /* Empty state */
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
            <p className="text-5xl mb-4">🎯</p>
            <p className="text-xl font-semibold mb-2">No habits yet</p>
            <p className="text-gray-400 mb-6">
              Add your first habit to get started!
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 font-semibold transition-all duration-300 text-sm cursor-pointer"
            >
              + Add Your First Habit
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {habits.map((habit) => {
              const habitLogs = logs.filter((l) => l.habit_id === habit.id);
              const done = habitLogs.some((l) => l.completed_date === today);
              const streak = calculateStreak(habitLogs);

              return (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  isCompleted={done}
                  streak={streak}
                  onToggle={() => toggleHabit(habit.id)}
                  onDelete={() => deleteHabit(habit.id)}
                />
              );
            })}
          </div>
        )}

        {/* ── Progress bar ── */}
        {habits.length > 0 && (
          <div className="mt-8 backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Today&apos;s Progress</span>
              <span className="text-sm font-semibold">
                {completedToday}/{habits.length}
              </span>
            </div>
            <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${
                    habits.length > 0
                      ? (completedToday / habits.length) * 100
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>
        )}
      </main>

      {/* ── Add Habit Modal ── */}
      {showAddModal && (
        <AddHabitModal
          onAdd={addHabit}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
}