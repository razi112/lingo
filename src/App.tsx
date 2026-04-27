/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  BookOpen, 
  MessageSquare, 
  TrendingUp, 
  Home, 
  Trophy, 
  Zap, 
  Calendar,
  Settings,
  ChevronRight,
  GraduationCap,
  Languages
} from "lucide-react";
import { cn } from "./lib/utils";
import { api } from "./services/api";

// View components (placeholders for now)
import Dashboard from "./components/Dashboard";
import Lessons from "./components/Lessons";
import AIChat from "./components/AIChat";
import ReadingRoom from "./components/ReadingRoom";
import Flashcards from "./components/Flashcards";
import MindTranslator from "./components/MindTranslator";

type View = "home" | "lessons" | "reading" | "chat" | "vault" | "stats" | "translator";

export default function App() {
  const [currentView, setCurrentView] = useState<View>("home");
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const userId = "demo-user-1"; // For demo purposes

  useEffect(() => {
    async function loadData() {
      try {
        const data = await api.getUser(userId);
        setUserData(data);
      } catch (err) {
        console.error("Failed to load user data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [userId]);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-stone-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-8 h-8 border-2 border-stone-200 border-t-stone-800 rounded-full"
        />
      </div>
    );
  }

  const navItems = [
    { id: "home", icon: Home, label: "Home" },
    { id: "lessons", icon: BookOpen, label: "Modules" },
    { id: "reading", icon: GraduationCap, label: "Reading" },
    { id: "chat", icon: MessageSquare, label: "Speaking" },
    { id: "translator", icon: Languages, label: "Translate" },
    { id: "vault", icon: Zap, label: "Vault" },
    { id: "stats", icon: TrendingUp, label: "Stats" },
  ] as const;

  return (
    <div className="flex h-screen bg-stone-50 text-stone-900 font-sans selection:bg-stone-200 selection:text-stone-900">
      {/* Sidebar Navigation */}
      <nav className="w-20 md:w-64 border-r border-stone-200 bg-white flex flex-col items-center md:items-stretch py-8 px-4 gap-8">
        <div className="flex items-center gap-3 px-3">
          <div className="w-10 h-10 bg-stone-900 rounded-xl flex items-center justify-center">
            <GraduationCap className="text-white w-6 h-6" />
          </div>
          <span className="font-display font-bold text-xl hidden md:block tracking-tight italic uppercase">LINGO.</span>
        </div>

        <div className="flex-1 flex flex-col gap-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={cn(
                "group flex items-center gap-3 p-3 rounded-xl transition-all duration-200",
                currentView === item.id 
                  ? "bg-stone-900 text-white shadow-lg shadow-stone-200" 
                  : "text-stone-500 hover:bg-stone-100 hover:text-stone-900"
              )}
            >
              <item.icon className="w-6 h-6 shrink-0" />
              <span className="hidden md:block font-medium">{item.label}</span>
              {currentView === item.id && (
                <motion.div
                  layoutId="active-pill"
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-white hidden md:block"
                />
              )}
            </button>
          ))}
        </div>

        <div className="mt-auto flex flex-col gap-4">
          <div className="hidden md:flex flex-col gap-1 px-3 mb-4">
            <div className="flex items-center justify-between text-xs font-semibold text-stone-400 uppercase tracking-widest">
              <span>Goal Progress</span>
              <span>{Math.round((userData.xp % 100))} / 100</span>
            </div>
            <div className="h-1.5 w-full bg-stone-100 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(userData.xp % 100)}%` }}
                className="h-full bg-stone-900 rounded-full"
              />
            </div>
          </div>
          <button className="flex items-center gap-3 p-3 rounded-xl text-stone-500 hover:bg-stone-100 hover:text-stone-900 transition-all">
            <Settings className="w-6 h-6" />
            <span className="hidden md:block font-medium">Settings</span>
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="h-full overflow-y-auto"
          >
            {currentView === "home" && <Dashboard userData={userData} setView={setCurrentView} />}
            {currentView === "lessons" && <Lessons userData={userData} />}
            {currentView === "reading" && <ReadingRoom userData={userData} />}
            {currentView === "chat" && <AIChat userData={userData} />}
            {currentView === "translator" && <MindTranslator />}
            {currentView === "vault" && <Flashcards userData={userData} />}
            {currentView === "stats" && (
              <div className="p-8 md:p-12 max-w-5xl mx-auto">
                <h1 className="text-4xl font-display font-medium tracking-tight mb-8">Personal Progress</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="p-8 rounded-3xl bg-white border border-stone-200">
                      <h3 className="text-sm font-bold uppercase tracking-widest text-stone-400 mb-4">Memory Strength</h3>
                      <div className="h-48 flex items-end gap-2 px-2">
                        {[40, 70, 45, 90, 65, 80, 95].map((val, i) => (
                           <div key={i} className="flex-1 flex flex-col items-center gap-2">
                              <motion.div 
                                initial={{ height: 0 }}
                                animate={{ height: `${val}%` }}
                                className="w-full bg-stone-900 rounded-t-lg"
                              />
                              <span className="text-[10px] font-mono text-stone-400 uppercase">{['M','T','W','T','F','S','S'][i]}</span>
                           </div>
                        ))}
                      </div>
                   </div>
                   <div className="p-8 rounded-3xl bg-stone-900 text-white shadow-2xl shadow-stone-200">
                      <Trophy className="w-8 h-8 text-amber-400 mb-4" />
                      <h3 className="text-2xl font-display leading-tight mb-2">Mastery Unlocked</h3>
                      <p className="text-stone-400 text-sm leading-relaxed mb-6">You've reached an 85% accuracy rate in the "Daily Conversation" module. Keep it up!</p>
                      <button className="w-full p-4 rounded-xl bg-white text-stone-900 font-bold hover:bg-stone-100 transition-colors">
                        View Achievements
                      </button>
                   </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

