import { Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "HabitFlow – Track Your Habits",
  description: "A simple and beautiful habit tracking app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} text-white antialiased min-h-screen relative`}
      >
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-purple-600/20 blur-[120px]" />
          <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] rounded-full bg-pink-600/20 blur-[120px]" />
          <div className="absolute top-[40%] right-[15%] w-[30%] h-[30%] rounded-full bg-blue-600/10 blur-[100px]" />
        </div>

        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}