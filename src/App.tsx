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
  Settings,
  GraduationCap,
  Languages,
  Sun,
  Moon,
  LogOut,
} from "lucide-react";
import { cn } from "./lib/utils";
import { supabase } from "./lib/supabase";
import { api } from "./services/api";

import Dashboard    from "./components/Dashboard";
import Lessons      from "./components/Lessons";
import AIChat       from "./components/AIChat";
import ReadingRoom  from "./components/ReadingRoom";
import Flashcards   from "./components/Flashcards";
import MindTranslator from "./components/MindTranslator";
import Login        from "./components/Login";
import SettingsPanel from "./components/SettingsPanel";

type View = "home" | "lessons" | "reading" | "chat" | "vault" | "stats" | "translator";

// ── Dark mode hook ────────────────────────────────────────────────────────
function useDarkMode() {
  const [dark, setDark] = useState<boolean>(() => {
    const stored = localStorage.getItem("lingo-dark-mode");
    if (stored !== null) return stored === "true";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (dark) root.classList.add("dark");
    else root.classList.remove("dark");
    localStorage.setItem("lingo-dark-mode", String(dark));
  }, [dark]);

  return [dark, setDark] as const;
}

// ── Loading screen with timeout hint ─────────────────────────────────────
function LoadingScreen() {
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setSlow(true), 4000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center gap-4 bg-stone-50">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        className="w-8 h-8 border-2 border-stone-200 border-t-stone-800 rounded-full"
      />
      <AnimatePresence>
        {slow && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-2"
          >
            <p className="text-sm text-stone-500">Taking a moment to connect…</p>
            <button
              onClick={() => window.location.reload()}
              className="text-xs font-bold text-stone-900 underline underline-offset-2 hover:text-stone-600"
            >
              Reload page
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  const [currentView, setCurrentView] = useState<View>("home");
  const [userData, setUserData]       = useState<any>(null);
  const [loading, setLoading]         = useState(true);
  const [dark, setDark]               = useDarkMode();
  const [settingsOpen, setSettingsOpen] = useState(false);

  // ── Auth state — driven entirely by Supabase session ─────────────────
  useEffect(() => {
    let settled = false;

    // Safety net: if Supabase never responds within 6 s, stop spinning
    const timeout = setTimeout(() => {
      if (!settled) {
        settled = true;
        setLoading(false);
      }
    }, 6000);

    // 1. Check for an existing session on mount (handles OAuth redirect callback too)
    supabase.auth.getSession()
      .then(async ({ data: { session } }) => {
        if (session?.user) {
          await loadProfile(session.user);
        }
      })
      .catch((err) => {
        console.error("Supabase getSession error:", err);
      })
      .finally(() => {
        if (!settled) {
          settled = true;
          clearTimeout(timeout);
          setLoading(false);
        }
      });

    // 2. Subscribe to future auth changes (sign-in, sign-out, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          await loadProfile(session.user);
        } else {
          setUserData(null);
        }
        // Also clear loading on any auth event (covers OAuth redirect)
        if (!settled) {
          settled = true;
          clearTimeout(timeout);
          setLoading(false);
        }
      }
    );

    return () => {
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  async function loadProfile(authUser: any) {
    try {
      const profile = await api.upsertProfile({
        id:     authUser.id,
        name:   authUser.user_metadata?.full_name  ?? authUser.email ?? "Learner",
        email:  authUser.email ?? "",
        avatar: authUser.user_metadata?.avatar_url ?? "",
      });
      setUserData(profile);
    } catch (err) {
      console.warn("Could not load profile from Supabase, using auth metadata:", err);
      // Fallback: use auth metadata directly so the app still works
      // even if the profiles table hasn't been created yet
      setUserData({
        id:     authUser.id,
        name:   authUser.user_metadata?.full_name ?? authUser.email ?? "Learner",
        email:  authUser.email ?? "",
        avatar: authUser.user_metadata?.avatar_url ?? "",
        xp: 0, level: 1, streak: 1,
      });
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUserData(null);
    setCurrentView("home");
  };

  // ── Loading spinner ───────────────────────────────────────────────────
  if (loading) {
    return <LoadingScreen />;
  }

  // ── Login gate ────────────────────────────────────────────────────────
  if (!userData) {
    return <Login onAuth={(user) => setUserData(user)} />;
  }

  // ── Main app ──────────────────────────────────────────────────────────
  const navItems = [
    { id: "home",       icon: Home,          label: "Home"      },
    { id: "lessons",    icon: BookOpen,      label: "Modules"   },
    { id: "reading",    icon: GraduationCap, label: "Reading"   },
    { id: "chat",       icon: MessageSquare, label: "Speaking"  },
    { id: "translator", icon: Languages,     label: "Translate" },
    { id: "vault",      icon: Zap,           label: "Vault"     },
    { id: "stats",      icon: TrendingUp,    label: "Stats"     },
  ] as const;

  return (
    <div className="flex h-screen bg-stone-50 text-stone-900 font-sans selection:bg-stone-200 selection:text-stone-900">
      {/* ── Sidebar ── */}
      <nav className="w-20 md:w-64 border-r border-stone-200 bg-white flex flex-col items-center md:items-stretch py-8 px-4 gap-8">
        <div className="flex items-center gap-3 px-3">
          <div className="w-10 h-10 bg-stone-900 rounded-xl flex items-center justify-center shrink-0">
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

        <div className="mt-auto flex flex-col gap-3">
          {/* XP progress bar */}
          <div className="hidden md:flex flex-col gap-1 px-3 mb-1">
            <div className="flex items-center justify-between text-xs font-semibold text-stone-400 uppercase tracking-widest">
              <span>Goal Progress</span>
              <span>{Math.round((userData.xp ?? 0) % 100)} / 100</span>
            </div>
            <div className="h-1.5 w-full bg-stone-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(userData.xp ?? 0) % 100}%` }}
                className="h-full bg-stone-900 rounded-full"
              />
            </div>
          </div>

          {/* User chip */}
          <div className="hidden md:flex items-center gap-3 px-3 py-2 rounded-xl bg-stone-50 border border-stone-100">
            {userData.avatar ? (
              <img
                src={userData.avatar}
                alt={userData.name}
                className="w-8 h-8 rounded-full object-cover shrink-0"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center shrink-0 text-xs font-bold text-stone-600">
                {userData.name?.[0]?.toUpperCase() ?? "L"}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-semibold text-stone-900 truncate">{userData.name}</p>
              <p className="text-xs text-stone-400 truncate">{userData.email || "Guest"}</p>
            </div>
          </div>

          {/* Dark mode toggle */}
          <button
            onClick={() => setDark((d) => !d)}
            className="flex items-center gap-3 p-3 rounded-xl text-stone-500 hover:bg-stone-100 hover:text-stone-900 transition-all"
            title={dark ? "Switch to light mode" : "Switch to dark mode"}
            aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
          >
            <AnimatePresence mode="wait" initial={false}>
              {dark ? (
                <motion.span key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }} className="flex items-center gap-3">
                  <Sun className="w-6 h-6 shrink-0" />
                  <span className="hidden md:block font-medium">Light Mode</span>
                </motion.span>
              ) : (
                <motion.span key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }} className="flex items-center gap-3">
                  <Moon className="w-6 h-6 shrink-0" />
                  <span className="hidden md:block font-medium">Dark Mode</span>
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          <button
            onClick={() => setSettingsOpen(true)}
            className="flex items-center gap-3 p-3 rounded-xl text-stone-500 hover:bg-stone-100 hover:text-stone-900 transition-all"
          >
            <Settings className="w-6 h-6" />
            <span className="hidden md:block font-medium">Settings</span>
          </button>

          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 p-3 rounded-xl text-stone-500 hover:bg-red-50 hover:text-red-600 transition-all"
            title="Sign out"
          >
            <LogOut className="w-6 h-6" />
            <span className="hidden md:block font-medium">Sign Out</span>
          </button>
        </div>
      </nav>

      {/* ── Main content ── */}
      <main className="flex-1 overflow-hidden relative">        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="h-full overflow-y-auto"
          >
            {currentView === "home"       && <Dashboard userData={userData} setView={setCurrentView} />}
            {currentView === "lessons"    && <Lessons userData={userData} />}
            {currentView === "reading"    && <ReadingRoom userData={userData} />}
            {currentView === "chat"       && <AIChat userData={userData} />}
            {currentView === "translator" && <MindTranslator />}
            {currentView === "vault"      && <Flashcards userData={userData} />}
            {currentView === "stats"      && (
              <div className="p-8 md:p-12 max-w-5xl mx-auto">
                <h1 className="text-4xl font-display font-medium tracking-tight mb-8">Personal Progress</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="p-8 rounded-3xl bg-white border border-stone-200">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-stone-400 mb-4">Memory Strength</h3>
                    <div className="h-48 flex items-end gap-2 px-2">
                      {[40, 70, 45, 90, 65, 80, 95].map((val, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-2">
                          <motion.div initial={{ height: 0 }} animate={{ height: `${val}%` }} className="w-full bg-stone-900 rounded-t-lg" />
                          <span className="text-[10px] font-mono text-stone-400 uppercase">{["M","T","W","T","F","S","S"][i]}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="p-8 rounded-3xl bg-stone-900 text-white shadow-2xl shadow-stone-200">
                    <Trophy className="w-8 h-8 text-amber-400 mb-4" />
                    <h3 className="text-2xl font-display leading-tight mb-2">Mastery Unlocked</h3>
                    <p className="text-stone-400 text-sm leading-relaxed mb-6">
                      You've reached an 85% accuracy rate in the "Daily Conversation" module. Keep it up!
                    </p>
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
      {/* ── Settings drawer ── */}
      <SettingsPanel
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        userData={userData}
        dark={dark}
        onToggleDark={() => setDark((d) => !d)}
        onSignOut={handleSignOut}
        onUserUpdate={(u) => setUserData(u)}
      />
    </div>
  );
}

