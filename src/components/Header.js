"use client";

import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function Header({ user }) {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <header className="backdrop-blur-xl bg-white/5 border-b border-white/10 sticky top-0 z-40">
      <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          HabitFlow
        </h1>

        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400 hidden sm:block truncate max-w-[200px]">
            {user?.email}
          </span>
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 text-sm cursor-pointer"
          >
            Log Out
          </button>
        </div>
      </div>
    </header>
  );
}