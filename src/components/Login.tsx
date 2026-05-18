import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  GraduationCap, BookOpen, MessageSquare, Zap,
  AlertCircle, Eye, EyeOff, CheckCircle2, Mail, Lock, User, AtSign,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { api } from "../services/api";
import { cn } from "../lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────
type AuthUser = {
  id: string; name: string; username: string; email: string;
  avatar: string; xp: number; level: number; streak: number;
};
type LoginProps = { onAuth: (user: AuthUser) => void };
type Tab = "signin" | "signup";

// ── Left panel features ────────────────────────────────────────────────────
const FEATURES = [
  { icon: BookOpen,      label: "12 Grammar Modules",  sub: "Present, Past & Future tenses" },
  { icon: MessageSquare, label: "AI Speaking Partner", sub: "Nabu owl — always available"   },
  { icon: Zap,           label: "Spaced Repetition",   sub: "Smart vocabulary vault"         },
];

// ── Google logo ────────────────────────────────────────────────────────────
function GoogleLogo() {
  return (
    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

// ── Input field ────────────────────────────────────────────────────────────
type IconFC = (props: { className?: string }) => ReturnType<typeof GoogleLogo>;

function Field({
  label, type = "text", value, onChange, placeholder,
  icon: Icon, rightSlot, error, autoComplete,
}: {
  label: string; type?: string; value: string;
  onChange: (v: string) => void; placeholder?: string;
  icon: IconFC; rightSlot?: ReturnType<typeof GoogleLogo>;
  error?: string; autoComplete?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold uppercase tracking-widest text-stone-500">{label}</label>
      <div className={cn(
        "flex items-center gap-3 px-4 py-3.5 rounded-2xl border-2 bg-white transition-colors",
        error
          ? "border-red-300 focus-within:border-red-500"
          : "border-stone-200 focus-within:border-stone-900"
      )}>
        <Icon className="w-4 h-4 text-stone-400 shrink-0" />
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="flex-1 bg-transparent text-sm text-stone-900 placeholder:text-stone-400 outline-none"
        />
        {rightSlot}
      </div>
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <AlertCircle className="w-3 h-3 shrink-0" /> {error}
        </p>
      )}
    </div>
  );
}

// ── Password strength bar ──────────────────────────────────────────────────
function StrengthBar({ password }: { password: string }) {
  if (!password) return null;
  const level = password.length < 4 ? 1 : password.length < 7 ? 2 : password.length < 10 ? 3 : 4;
  const labels = ["", "Too short", "Weak", "Good", "Strong"];
  const colors = ["", "bg-red-400", "bg-amber-400", "bg-yellow-400", "bg-green-500"];
  return (
    <div className="space-y-1">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((n) => (
          <div key={n} className={cn("h-1 flex-1 rounded-full transition-colors duration-300",
            n <= level ? colors[level] : "bg-stone-200")} />
        ))}
      </div>
      <p className="text-xs text-stone-400">{labels[level]}</p>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
export default function Login({ onAuth }: LoginProps) {
  const [tab, setTab]         = useState<Tab>("signin");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // ── Sign-in state ──────────────────────────────────────────────────
  const [siUsername, setSiUsername] = useState("");
  const [siPass,     setSiPass]     = useState("");
  const [siShowP,    setSiShowP]    = useState(false);
  const [siErrors,   setSiErrors]   = useState<Record<string, string>>({});

  // ── Sign-up state ──────────────────────────────────────────────────
  const [suName,     setSuName]     = useState("");
  const [suUsername, setSuUsername] = useState("");
  const [suEmail,    setSuEmail]    = useState("");
  const [suPass,     setSuPass]     = useState("");
  const [suConf,     setSuConf]     = useState("");
  const [suShowP,    setSuShowP]    = useState(false);
  const [suShowC,    setSuShowC]    = useState(false);
  const [suErrors,   setSuErrors]   = useState<Record<string, string>>({});

  const reset = () => {
    setError(null); setSuccess(null);
    setSiErrors({}); setSuErrors({});
  };
  const switchTab = (t: Tab) => { reset(); setTab(t); };

  // ── Validation ─────────────────────────────────────────────────────
  const validateSignIn = () => {
    const e: Record<string, string> = {};
    if (!siUsername.trim())  e.username = "Username is required";
    if (!siPass)             e.pass     = "Password is required";
    setSiErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateSignUp = () => {
    const e: Record<string, string> = {};
    if (!suName.trim())                          e.name     = "Full name is required";
    if (!suUsername.trim())                      e.username = "Username is required";
    else if (!/^[a-z0-9_]{3,20}$/.test(suUsername.toLowerCase()))
                                                 e.username = "3–20 chars: letters, numbers, _";
    if (!suEmail.trim())                         e.email    = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(suEmail))      e.email    = "Enter a valid email";
    if (suPass.length < 6)                       e.pass     = "At least 6 characters";
    if (suConf !== suPass)                       e.conf     = "Passwords don't match";
    setSuErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Sign in with username ──────────────────────────────────────────
  const handleSignIn = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    if (!validateSignIn()) return;
    setLoading(true); setError(null);
    try {
      // Look up the email registered for this username
      const email = await api.getEmailByUsername(siUsername.trim());
      if (!email) {
        setSiErrors({ username: "No account found with this username" });
        setLoading(false);
        return;
      }

      const { data, error: authErr } = await supabase.auth.signInWithPassword({
        email, password: siPass,
      });
      if (authErr) throw authErr;

      const profile = await api.upsertProfile({
        id:     data.user!.id,
        name:   data.user!.user_metadata?.full_name ?? siUsername,
        email:  data.user!.email ?? "",
        avatar: data.user!.user_metadata?.avatar_url ?? "",
      });
      onAuth(profile as AuthUser);
    } catch (err: any) {
      // Supabase returns "Invalid login credentials" for wrong password
      const msg: string = err?.message ?? "";
      setError(
        msg.toLowerCase().includes("invalid")
          ? "Incorrect password. Please try again."
          : msg || "Sign-in failed."
      );
    } finally {
      setLoading(false);
    }
  };

  // ── Sign up ────────────────────────────────────────────────────────
  const handleSignUp = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    if (!validateSignUp()) return;
    setLoading(true); setError(null); setSuccess(null);

    const cleanUsername = suUsername.trim().toLowerCase();

    try {
      // Check username availability before creating the auth user
      const existing = await api.getEmailByUsername(cleanUsername);
      if (existing) {
        setSuErrors({ username: "Username already taken" });
        setLoading(false);
        return;
      }

      const { data, error: authErr } = await supabase.auth.signUp({
        email:    suEmail.trim(),
        password: suPass,
        options:  { data: { full_name: suName.trim() } },
      });
      if (authErr) throw authErr;

      if (data.session) {
        // Auto-confirmed — upsert profile with username and log in
        const profile = await api.upsertProfile({
          id:       data.user!.id,
          name:     suName.trim(),
          username: cleanUsername,
          email:    suEmail.trim(),
          avatar:   "",
        });
        onAuth(profile as AuthUser);
      } else {
        // Email confirmation required
        // Still save the username so it's reserved
        if (data.user) {
          await api.upsertProfile({
            id:       data.user.id,
            name:     suName.trim(),
            username: cleanUsername,
            email:    suEmail.trim(),
            avatar:   "",
          }).catch(() => {});
        }
        setSuccess("Account created! Check your inbox to confirm your email, then sign in.");
        switchTab("signin");
        setSiUsername(cleanUsername);
      }
    } catch (err: any) {
      const msg: string = err?.message ?? "";
      setError(
        msg.toLowerCase().includes("already registered")
          ? "An account with this email already exists."
          : msg || "Sign-up failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ── Google OAuth ───────────────────────────────────────────────────
  const handleGoogleAuth = async () => {
    setLoading(true); setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin,
          queryParams: { access_type: "offline", prompt: "consent" },
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err?.message ?? "Google sign-in failed.");
      setLoading(false);
    }
  };

  // ── Guest ──────────────────────────────────────────────────────────
  // Fully local — no Supabase anonymous auth needed (avoids the
  // "Anonymous sign-ins are disabled" error).
  const handleGuest = () => {
    const guestId = `guest_${Math.random().toString(36).slice(2, 10)}`;
    onAuth({
      id:       guestId,
      name:     "Guest Learner",
      username: guestId,
      email:    "",
      avatar:   "",
      xp:       0,
      level:    1,
      streak:   0,
    });
  };

  // ── Render ─────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex bg-stone-50">

      {/* Left branding panel */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="hidden lg:flex flex-col justify-between w-[460px] shrink-0 bg-stone-900 text-white p-14 relative overflow-hidden"
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-stone-800 blur-[80px]" />
          <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-stone-800 blur-[80px]" />
        </div>

        <div className="relative z-10 space-y-3">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center">
            <GraduationCap className="w-7 h-7 text-stone-900" />
          </div>
          <span className="font-display font-bold text-2xl tracking-tight italic uppercase">LINGO.</span>
        </div>

        <div className="relative z-10 space-y-10">
          <div className="space-y-4">
            <h1 className="text-5xl font-display font-medium leading-[1.05]">
              English fluency,<br />
              <span className="italic text-stone-400">one step at a time.</span>
            </h1>
            <p className="text-stone-400 text-lg leading-relaxed max-w-sm">
              Designed for Malayalam speakers. Learn grammar, vocabulary, and real-world conversation with AI support.
            </p>
          </div>
          <div className="space-y-4">
            {FEATURES.map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-stone-800 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-stone-300" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{label}</p>
                  <p className="text-stone-500 text-xs">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-stone-600 text-xs">© 2026 Lingo · Built for learners</p>
      </motion.div>

      {/* Right auth panel */}
      <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-3 lg:hidden mb-8">
            <div className="w-10 h-10 bg-stone-900 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight italic uppercase">LINGO.</span>
          </div>

          {/* Tab switcher */}
          <div className="flex p-1 bg-stone-100 rounded-2xl mb-8 relative">
            <motion.div
              className="absolute inset-y-1 w-[calc(50%-4px)] bg-white rounded-xl shadow-sm"
              animate={{ x: tab === "signin" ? 4 : "calc(100% + 4px)" }}
              transition={{ type: "spring", stiffness: 400, damping: 35 }}
            />
            {(["signin", "signup"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => switchTab(t)}
                className={cn(
                  "relative z-10 flex-1 py-2.5 text-sm font-bold rounded-xl transition-colors duration-200",
                  tab === t ? "text-stone-900" : "text-stone-400 hover:text-stone-600"
                )}
              >
                {t === "signin" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>

          {/* Banners */}
          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -8, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-start gap-3 p-4 rounded-2xl bg-green-50 border border-green-200 text-green-700 text-sm mb-6"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                {success}
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-start gap-3 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm mb-6"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Forms */}
          <AnimatePresence mode="wait">

            {/* ══ SIGN IN ══ */}
            {tab === "signin" && (
              <motion.div
                key="signin"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.22 }}
              >
                <div className="mb-6">
                  <h2 className="text-3xl font-display font-medium tracking-tight">Welcome back.</h2>
                  <p className="text-stone-500 text-sm mt-1">Sign in with your username and password.</p>
                </div>

                <form onSubmit={handleSignIn} className="space-y-4" noValidate>
                  <Field
                    label="Username"
                    value={siUsername}
                    onChange={setSiUsername}
                    placeholder="your_username"
                    icon={AtSign}
                    autoComplete="username"
                    error={siErrors.username}
                  />
                  <Field
                    label="Password"
                    type={siShowP ? "text" : "password"}
                    value={siPass}
                    onChange={setSiPass}
                    placeholder="••••••••"
                    icon={Lock}
                    autoComplete="current-password"
                    error={siErrors.pass}
                    rightSlot={
                      <button
                        type="button"
                        onClick={() => setSiShowP((v) => !v)}
                        className="text-stone-400 hover:text-stone-700 transition-colors"
                        tabIndex={-1}
                        aria-label={siShowP ? "Hide password" : "Show password"}
                      >
                        {siShowP ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    }
                  />

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-stone-900 text-white rounded-2xl font-bold text-sm hover:bg-stone-800 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Signing in…" : "Sign In"}
                  </button>
                </form>

                <div className="flex items-center gap-4 my-5">
                  <div className="flex-1 h-px bg-stone-200" />
                  <span className="text-xs text-stone-400 font-medium">or continue with</span>
                  <div className="flex-1 h-px bg-stone-200" />
                </div>

                <div className="space-y-3">
                  <button
                    onClick={handleGoogleAuth}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 py-3.5 px-6 rounded-2xl border-2 border-stone-200 bg-white text-stone-800 font-semibold text-sm hover:border-stone-900 hover:shadow-md transition-all disabled:opacity-50"
                  >
                    <GoogleLogo />
                    Continue with Google
                  </button>
                  <button
                    onClick={handleGuest}
                    disabled={loading}
                    className="w-full py-3.5 rounded-2xl border-2 border-dashed border-stone-200 text-stone-500 font-semibold text-sm hover:border-stone-400 hover:text-stone-700 transition-all disabled:opacity-50"
                  >
                    Continue as Guest
                  </button>
                </div>

                <p className="text-center text-sm text-stone-400 mt-6">
                  Don't have an account?{" "}
                  <button onClick={() => switchTab("signup")} className="font-bold text-stone-900 hover:underline">
                    Sign up free
                  </button>
                </p>
              </motion.div>
            )}

            {/* ══ SIGN UP ══ */}
            {tab === "signup" && (
              <motion.div
                key="signup"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.22 }}
              >
                <div className="mb-6">
                  <h2 className="text-3xl font-display font-medium tracking-tight">Create account.</h2>
                  <p className="text-stone-500 text-sm mt-1">Start your English journey today — it's free.</p>
                </div>

                <form onSubmit={handleSignUp} className="space-y-4" noValidate>
                  <Field
                    label="Full Name"
                    value={suName}
                    onChange={setSuName}
                    placeholder="Your full name"
                    icon={User}
                    autoComplete="name"
                    error={suErrors.name}
                  />
                  <Field
                    label="Username"
                    value={suUsername}
                    onChange={(v) => setSuUsername(v.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                    placeholder="e.g. razi_learns"
                    icon={AtSign}
                    autoComplete="username"
                    error={suErrors.username}
                  />
                  {/* Username hint */}
                  {!suErrors.username && suUsername && (
                    <p className="text-xs text-stone-400 -mt-1 pl-1">
                      3–20 characters · letters, numbers and _ only
                    </p>
                  )}
                  <Field
                    label="Email"
                    type="email"
                    value={suEmail}
                    onChange={setSuEmail}
                    placeholder="you@example.com"
                    icon={Mail}
                    autoComplete="email"
                    error={suErrors.email}
                  />
                  <Field
                    label="Password"
                    type={suShowP ? "text" : "password"}
                    value={suPass}
                    onChange={setSuPass}
                    placeholder="Min. 6 characters"
                    icon={Lock}
                    autoComplete="new-password"
                    error={suErrors.pass}
                    rightSlot={
                      <button
                        type="button"
                        onClick={() => setSuShowP((v) => !v)}
                        className="text-stone-400 hover:text-stone-700 transition-colors"
                        tabIndex={-1}
                        aria-label={suShowP ? "Hide password" : "Show password"}
                      >
                        {suShowP ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    }
                  />
                  <StrengthBar password={suPass} />
                  <Field
                    label="Confirm Password"
                    type={suShowC ? "text" : "password"}
                    value={suConf}
                    onChange={setSuConf}
                    placeholder="Repeat password"
                    icon={Lock}
                    autoComplete="new-password"
                    error={suErrors.conf}
                    rightSlot={
                      <button
                        type="button"
                        onClick={() => setSuShowC((v) => !v)}
                        className="text-stone-400 hover:text-stone-700 transition-colors"
                        tabIndex={-1}
                        aria-label={suShowC ? "Hide password" : "Show password"}
                      >
                        {suShowC ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    }
                  />

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-stone-900 text-white rounded-2xl font-bold text-sm hover:bg-stone-800 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Creating account…" : "Create Account"}
                  </button>
                </form>

                <div className="flex items-center gap-4 my-5">
                  <div className="flex-1 h-px bg-stone-200" />
                  <span className="text-xs text-stone-400 font-medium">or sign up with</span>
                  <div className="flex-1 h-px bg-stone-200" />
                </div>

                <button
                  onClick={handleGoogleAuth}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 py-3.5 px-6 rounded-2xl border-2 border-stone-200 bg-white text-stone-800 font-semibold text-sm hover:border-stone-900 hover:shadow-md transition-all disabled:opacity-50"
                >
                  <GoogleLogo />
                  Sign up with Google
                </button>

                <p className="text-center text-sm text-stone-400 mt-6">
                  Already have an account?{" "}
                  <button onClick={() => switchTab("signin")} className="font-bold text-stone-900 hover:underline">
                    Sign in
                  </button>
                </p>
              </motion.div>
            )}

          </AnimatePresence>

          <p className="text-xs text-stone-400 leading-relaxed text-center mt-8">
            By continuing you agree to our Terms of Service and Privacy Policy.
            Progress is synced securely via Supabase.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
