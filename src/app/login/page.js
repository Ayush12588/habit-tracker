"use client";

// ===== LANDING PAGE =====
// If the user is already logged in → redirect to /dashboard.
// Otherwise show a simple hero section with links to login / signup.

import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Auto-redirect authenticated users
  useEffect(() => {
    if (!loading && user) router.push("/dashboard");
  }, [user, loading, router]);

  // Show spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-white" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        {/* Logo / Title */}
        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
          HabitFlow
        </h1>

        <p className="text-lg md:text-xl text-gray-300 mb-12 leading-relaxed">
          Build better habits, one day at a time.
          <br />
          Simple tracking. Beautiful design. Zero distractions.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/signup"
            className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-purple-500/25 hover:scale-105"
          >
            Get Started Free
          </Link>
          <Link
            href="/login"
            className="px-8 py-3.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300 font-semibold text-lg hover:scale-105"
          >
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
}