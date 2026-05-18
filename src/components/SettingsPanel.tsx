import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X, Moon, Sun, Bell, BellOff, Lock, LogOut, Trash2,
  Check, AlertTriangle, Shield, Volume2, VolumeX, ChevronRight,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { api } from "../services/api";
import { cn } from "../lib/utils";

// ── Props ──────────────────────────────────────────────────────────────────
type Props = {
  open: boolean;
  onClose: () => void;
  userData: any;
  dark: boolean;
  onToggleDark: () => void;
  onSignOut: () => void;
  onUserUpdate: (u: any) => void;
};

// ── Toggle switch ──────────────────────────────────────────────────────────
// Uses inline style for the thumb position so it actually animates.
function Toggle({
  on,
  onChange,
  id,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
  id?: string;
}) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={on}
      onClick={(e) => {
        e.stopPropagation(); // prevent parent row click
        onChange(!on);
      }}
      className={cn(
        "relative inline-flex w-11 h-6 rounded-full transition-colors duration-200",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 shrink-0",
        on ? "bg-stone-900" : "bg-stone-300"
      )}
    >
      <span
        className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-200"
        style={{ left: on ? "calc(100% - 1.375rem)" : "0.125rem" }}
      />
    </button>
  );
}

// ── Section wrapper ────────────────────────────────────────────────────────
function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 px-1">{title}</p>
      <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden divide-y divide-stone-100">
        {children}
      </div>
    </div>
  );
}

// ── Setting row ────────────────────────────────────────────────────────────
// When `toggle` is provided the whole row acts as a label for the toggle.
// When `onPress` is provided the row is a clickable button.
// Otherwise it's a static display row.
function SettingRow({
  icon: Icon,
  label,
  sub,
  toggle,
  onPress,
  danger = false,
  rightNode,
}: {
  icon: (p: { className?: string }) => ReturnType<typeof X> | null;
  label: string;
  sub?: string;
  toggle?: { on: boolean; onChange: (v: boolean) => void };
  onPress?: () => void;
  danger?: boolean;
  rightNode?: ReturnType<typeof X>;
}) {
  const isClickable = !!toggle || !!onPress;

  const inner = (
    <>
      <div className={cn(
        "w-8 h-8 rounded-xl flex items-center justify-center shrink-0",
        danger ? "bg-red-50 text-red-500" : "bg-stone-100 text-stone-600"
      )}>
        <Icon className="w-4 h-4" />
      </div>

      <div className="flex-1 min-w-0">
        <p className={cn("text-sm font-semibold leading-tight",
          danger ? "text-red-600" : "text-stone-900")}>{label}</p>
        {sub && <p className="text-xs text-stone-400 mt-0.5 leading-tight">{sub}</p>}
      </div>

      {toggle && <Toggle on={toggle.on} onChange={toggle.onChange} />}
      {rightNode}
      {onPress && !danger && !rightNode && (
        <ChevronRight className="w-4 h-4 text-stone-300 shrink-0" />
      )}
    </>
  );

  const cls = cn(
    "w-full flex items-center gap-3 px-4 py-3.5 text-left",
    isClickable
      ? danger
        ? "cursor-pointer hover:bg-red-50 active:bg-red-100 transition-colors"
        : "cursor-pointer hover:bg-stone-50 active:bg-stone-100 transition-colors"
      : "cursor-default"
  );

  if (toggle) {
    // Wrap in a label so clicking anywhere on the row toggles the switch
    return (
      <label className={cls} style={{ display: "flex" }}>
        {inner}
      </label>
    );
  }

  if (onPress) {
    return (
      <button type="button" onClick={onPress} className={cls}>
        {inner}
      </button>
    );
  }

  return <div className={cls}>{inner}</div>;
}

// ── Main component ─────────────────────────────────────────────────────────
export default function SettingsPanel({
  open, onClose, userData, dark, onToggleDark, onSignOut, onUserUpdate,
}: Props) {

  // ── Preferences (localStorage) ─────────────────────────────────────
  const [notifications, setNotifications] = useState(
    () => localStorage.getItem("lingo-notifications") !== "false"
  );
  const [sounds, setSounds] = useState(
    () => localStorage.getItem("lingo-sounds") !== "false"
  );
  const [nativeLang, setNativeLang] = useState(
    () => localStorage.getItem("lingo-native-lang") ?? "ml"
  );

  const toggleNotifications = (v: boolean) => {
    setNotifications(v);
    localStorage.setItem("lingo-notifications", String(v));
  };
  const toggleSounds = (v: boolean) => {
    setSounds(v);
    localStorage.setItem("lingo-sounds", String(v));
  };
  const pickLang = (code: string) => {
    setNativeLang(code);
    localStorage.setItem("lingo-native-lang", code);
  };

  // ── Profile name edit ───────────────────────────────────────────────
  const [editingName, setEditingName] = useState(false);
  const [nameVal, setNameVal]         = useState(userData?.name ?? "");
  const [nameSaving, setNameSaving]   = useState(false);
  const [nameSaved, setNameSaved]     = useState(false);

  // Keep nameVal in sync if userData changes externally
  useEffect(() => {
    if (!editingName) setNameVal(userData?.name ?? "");
  }, [userData?.name, editingName]);

  const saveName = async () => {
    const trimmed = nameVal.trim();
    if (!trimmed || trimmed === userData?.name) { setEditingName(false); return; }
    setNameSaving(true);
    try {
      const updated = await api.upsertProfile({ ...userData, name: trimmed });
      onUserUpdate(updated);
      setNameSaved(true);
      setTimeout(() => setNameSaved(false), 2000);
      setEditingName(false);
    } catch (err) {
      console.error("Failed to save name:", err);
    } finally {
      setNameSaving(false);
    }
  };

  // ── Password reset ──────────────────────────────────────────────────
  const [pwState, setPwState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const sendPasswordReset = async () => {
    if (!userData?.email || pwState !== "idle") return;
    setPwState("sending");
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(userData.email, {
        redirectTo: `${window.location.origin}`,
      });
      if (error) throw error;
      setPwState("sent");
    } catch {
      setPwState("error");
      setTimeout(() => setPwState("idle"), 3000);
    }
  };

  // ── Delete account ──────────────────────────────────────────────────
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting]           = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      // Delete profile data first, then sign out
      // (Full account deletion requires a Supabase Edge Function with service role key)
      await supabase.from("progress").delete().eq("user_id", userData.id);
      await supabase.from("vocabulary").delete().eq("user_id", userData.id);
      await supabase.from("profiles").delete().eq("id", userData.id);
      await supabase.auth.signOut();
      onSignOut();
    } catch {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  // ── Reset panel state when closed ──────────────────────────────────
  useEffect(() => {
    if (!open) {
      setEditingName(false);
      setConfirmDelete(false);
      setPwState("idle");
    }
  }, [open]);

  const LANGS = [
    { code: "ml", label: "Malayalam" },
    { code: "ar", label: "Arabic"    },
    { code: "ur", label: "Urdu"      },
    { code: "hi", label: "Hindi"     },
    { code: "ta", label: "Tamil"     },
  ];

  // ── Render ──────────────────────────────────────────────────────────
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
          />

          {/* Drawer */}
          <motion.aside
            key="drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
            className="fixed right-0 top-0 h-full w-full max-w-sm bg-stone-50 border-l border-stone-200 z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-stone-200 bg-white shrink-0">
              <h2 className="text-lg font-display font-bold tracking-tight">Settings</h2>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-stone-500 hover:bg-stone-100 transition-colors"
                aria-label="Close settings"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6">

              {/* ── Profile ── */}
              <Section title="Profile">
                {/* Avatar + editable name */}
                <div className="flex items-center gap-4 px-4 py-4">
                  {userData?.avatar ? (
                    <img
                      src={userData.avatar}
                      alt={userData.name}
                      className="w-12 h-12 rounded-full object-cover shrink-0"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-stone-200 flex items-center justify-center shrink-0 text-base font-bold text-stone-600">
                      {userData?.name?.[0]?.toUpperCase() ?? "L"}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    {editingName ? (
                      <div className="flex items-center gap-2">
                        <input
                          autoFocus
                          value={nameVal}
                          onChange={(e) => setNameVal(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") saveName();
                            if (e.key === "Escape") { setEditingName(false); setNameVal(userData?.name ?? ""); }
                          }}
                          className="flex-1 text-sm font-semibold bg-white border border-stone-300 rounded-lg px-2 py-1 outline-none focus:border-stone-900 min-w-0"
                        />
                        <button
                          type="button"
                          onClick={saveName}
                          disabled={nameSaving}
                          className="w-7 h-7 rounded-lg bg-stone-900 text-white flex items-center justify-center hover:bg-stone-700 transition-colors shrink-0 disabled:opacity-50"
                        >
                          {nameSaving
                            ? <span className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                            : <Check className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => { setEditingName(false); setNameVal(userData?.name ?? ""); }}
                          className="w-7 h-7 rounded-lg bg-stone-100 text-stone-500 flex items-center justify-center hover:bg-stone-200 transition-colors shrink-0"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setEditingName(true)}
                        className="group flex items-center gap-1.5 text-left w-full"
                      >
                        <p className="text-sm font-semibold text-stone-900 truncate">{userData?.name}</p>
                        {nameSaved
                          ? <Check className="w-3 h-3 text-green-500 shrink-0" />
                          : <span className="text-[10px] text-stone-400 group-hover:text-stone-600 transition-colors shrink-0">edit</span>}
                      </button>
                    )}
                    <p className="text-xs text-stone-400 truncate mt-0.5">{userData?.email || "Guest"}</p>
                    {userData?.username && (
                      <p className="text-xs text-stone-400 truncate">@{userData.username}</p>
                    )}
                  </div>
                </div>

                {/* Stats row */}
                <div className="px-4 py-3 flex items-center gap-6 bg-stone-50 border-t border-stone-100">
                  {[
                    { val: userData?.xp ?? 0,     label: "XP"     },
                    { val: userData?.level ?? 1,   label: "Level"  },
                    { val: `${userData?.streak ?? 0}🔥`, label: "Streak" },
                  ].map(({ val, label }) => (
                    <div key={label} className="text-center">
                      <p className="text-lg font-display font-bold text-stone-900">{val}</p>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">{label}</p>
                    </div>
                  ))}
                </div>
              </Section>

              {/* ── Appearance ── */}
              <Section title="Appearance">
                <SettingRow
                  icon={dark ? Sun : Moon}
                  label="Dark Mode"
                  sub={dark ? "On — switch to light" : "Off — switch to dark"}
                  toggle={{ on: dark, onChange: onToggleDark }}
                />
              </Section>

              {/* ── Preferences ── */}
              <Section title="Preferences">
                <SettingRow
                  icon={notifications ? Bell : BellOff}
                  label="Daily Reminders"
                  sub="Get nudged to keep your streak"
                  toggle={{ on: notifications, onChange: toggleNotifications }}
                />
                <SettingRow
                  icon={sounds ? Volume2 : VolumeX}
                  label="Sound Effects"
                  sub="Audio feedback on exercises"
                  toggle={{ on: sounds, onChange: toggleSounds }}
                />
              </Section>

              {/* ── Native language ── */}
              <Section title="Native Language">
                <div className="px-4 py-4 space-y-3">
                  <p className="text-xs text-stone-500">Used for translations and hints in lessons.</p>
                  <div className="flex flex-wrap gap-2">
                    {LANGS.map((l) => (
                      <button
                        key={l.code}
                        type="button"
                        onClick={() => pickLang(l.code)}
                        className={cn(
                          "px-3 py-1.5 rounded-xl text-xs font-bold border-2 transition-all",
                          nativeLang === l.code
                            ? "bg-stone-900 text-white border-stone-900"
                            : "bg-white text-stone-600 border-stone-200 hover:border-stone-500 hover:text-stone-900"
                        )}
                      >
                        {l.label}
                      </button>
                    ))}
                  </div>
                </div>
              </Section>

              {/* ── Account ── */}
              <Section title="Account">
                {userData?.email ? (
                  <SettingRow
                    icon={Lock}
                    label="Change Password"
                    sub={
                      pwState === "sent"    ? "✓ Reset email sent — check your inbox" :
                      pwState === "sending" ? "Sending…" :
                      pwState === "error"   ? "Failed to send — try again" :
                      "Send a password reset link to your email"
                    }
                    onPress={pwState === "idle" ? sendPasswordReset : undefined}
                    rightNode={
                      pwState === "sent" ? <Check className="w-4 h-4 text-green-500 shrink-0" /> :
                      pwState === "sending" ? (
                        <span className="w-4 h-4 border-2 border-stone-300 border-t-stone-700 rounded-full animate-spin shrink-0" />
                      ) : undefined
                    }
                  />
                ) : <></>}
                <SettingRow
                  icon={Shield}
                  label="Privacy"
                  sub="Your data is stored securely in Supabase"
                />
              </Section>

              {/* ── Danger zone ── */}
              <Section title="Danger Zone">
                <SettingRow
                  icon={LogOut}
                  label="Sign Out"
                  sub="You'll need to sign in again"
                  onPress={onSignOut}
                  danger
                />

                {!confirmDelete ? (
                  <SettingRow
                    icon={Trash2}
                    label="Delete Account"
                    sub="Remove your profile and all progress data"
                    onPress={() => setConfirmDelete(true)}
                    danger
                  />
                ) : (
                  <div className="px-4 py-4 space-y-3 bg-red-50">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                      <p className="text-xs text-red-700 font-medium leading-relaxed">
                        This will delete your profile, progress, and vocabulary data. This cannot be undone.
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleDelete}
                        disabled={deleting}
                        className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                      >
                        {deleting && <span className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />}
                        {deleting ? "Deleting…" : "Yes, delete everything"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(false)}
                        className="flex-1 py-2.5 rounded-xl bg-white border border-stone-200 text-stone-700 text-xs font-bold hover:bg-stone-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </Section>

              <p className="text-center text-xs text-stone-400 pb-2">
                Lingo · v1.0 · Supabase + Gemini
              </p>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
