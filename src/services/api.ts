import Groq from "groq-sdk";
import { supabase, type SupabaseUser } from "../lib/supabase";

// ── Groq AI ────────────────────────────────────────────────────────────────
let groqClient: Groq | null = null;

function getGroq(): Groq {
  if (!groqClient) {
    const apiKey = import.meta.env.VITE_GROQ_API_KEY as string | undefined;
    if (!apiKey) throw new Error("VITE_GROQ_API_KEY is not defined. Add it to your .env file.");
    groqClient = new Groq({ apiKey, dangerouslyAllowBrowser: true });
  }
  return groqClient;
}

// ── User / profile ─────────────────────────────────────────────────────────
export const api = {
  /** Fetch a user's profile row from Supabase. */
  async getUser(id: string): Promise<SupabaseUser> {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data as SupabaseUser;
  },

  /** Look up a profile by username — returns email so we can sign in with it. */
  async getEmailByUsername(username: string): Promise<string | null> {
    const { data } = await supabase
      .from("profiles")
      .select("email")
      .eq("username", username.trim().toLowerCase())
      .maybeSingle();
    return (data as any)?.email ?? null;
  },

  /** Upsert profile data (name, email, avatar) after OAuth sign-in or sign-up. */
  async upsertProfile(profile: Partial<SupabaseUser> & { id: string }): Promise<SupabaseUser> {
    const { data, error } = await supabase
      .from("profiles")
      .upsert({ ...profile, last_login: new Date().toISOString() }, { onConflict: "id" })
      .select()
      .single();

    if (error) throw error;
    return data as SupabaseUser;
  },

  /**
   * Fetch an existing profile, or create a minimal one if it doesn't exist yet.
   * Unlike upsertProfile, this NEVER overwrites the username — safe to call on every sign-in.
   */
  async getOrCreateProfile(base: { id: string; name: string; email: string; avatar: string }): Promise<SupabaseUser> {
    // Try to fetch existing profile first
    const { data: existing } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", base.id)
      .maybeSingle();

    if (existing) {
      // Just update last_login, name, email, avatar — preserve username and XP
      const { data, error } = await supabase
        .from("profiles")
        .update({
          name:       base.name,
          email:      base.email,
          avatar:     base.avatar,
          last_login: new Date().toISOString(),
        })
        .eq("id", base.id)
        .select()
        .single();
      if (error) throw error;
      return data as SupabaseUser;
    }

    // No profile yet — create one (username will be set later or left null)
    const { data, error } = await supabase
      .from("profiles")
      .insert({
        id:         base.id,
        name:       base.name,
        email:      base.email,
        avatar:     base.avatar,
        xp:         0,
        level:      1,
        streak:     1,
        last_login: new Date().toISOString(),
      })
      .select()
      .single();
    if (error) throw error;
    return data as SupabaseUser;
  },

  /** Save lesson progress and add XP to the user's profile. */
  async saveProgress(
    userId: string,
    lessonId: string,
    score: number,
    xpGained: number
  ): Promise<void> {
    // Upsert the progress row
    const { error: progressError } = await supabase.from("progress").upsert(
      { user_id: userId, lesson_id: lessonId, score, completed_at: new Date().toISOString() },
      { onConflict: "user_id,lesson_id" }
    );
    if (progressError) throw progressError;

    // Increment XP using a Postgres RPC (falls back to a read-then-write if RPC not set up)
    const { error: xpError } = await supabase.rpc("increment_xp", {
      uid: userId,
      amount: xpGained,
    });

    if (xpError) {
      // Fallback: read current XP then update
      const { data: profile } = await supabase
        .from("profiles")
        .select("xp")
        .eq("id", userId)
        .single();
      const currentXp = (profile as any)?.xp ?? 0;
      await supabase
        .from("profiles")
        .update({ xp: currentXp + xpGained })
        .eq("id", userId);
    }
  },

  /** Fetch all vocabulary words for a user. */
  async getVocabulary(userId: string) {
    const { data, error } = await supabase
      .from("vocabulary")
      .select("*")
      .eq("user_id", userId);
    if (error) throw error;
    return data ?? [];
  },

  /** Add or update a vocabulary word using SM-2 spaced repetition. */
  async reviewVocabulary(userId: string, word: string, success: boolean): Promise<void> {
    // Fetch existing entry (if any)
    const { data: existing } = await supabase
      .from("vocabulary")
      .select("*")
      .eq("user_id", userId)
      .eq("word", word)
      .maybeSingle();

    let interval    = (existing as any)?.interval    ?? 1;
    let easeFactor  = (existing as any)?.ease_factor ?? 2.5;
    let strength    = (existing as any)?.strength    ?? 0.1;

    if (success) {
      interval   = Math.ceil(interval * easeFactor);
      strength   = Math.min(1.0, strength + 0.1);
    } else {
      interval   = 1;
      easeFactor = Math.max(1.3, easeFactor - 0.2);
      strength   = Math.max(0.1, strength - 0.2);
    }

    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + interval);

    const { error } = await supabase.from("vocabulary").upsert(
      {
        user_id:     userId,
        word,
        strength,
        next_review: nextReview.toISOString(),
        interval,
        ease_factor: easeFactor,
      },
      { onConflict: "user_id,word" }
    );
    if (error) throw error;
  },
};

// ── Nabu AI chat ───────────────────────────────────────────────────────────
const SYSTEM_PROMPT =
  "You are Nabu, a friendly robot owl language tutor. Your goal is to help users learn English. " +
  "Be encouraging, patient, and use simple language. Correct their mistakes gently. " +
  "You can also explain things in their native language (like Malayalam, Arabic, or Urdu) if they ask, " +
  "but try to keep them immersion-focused in English as much as possible. " +
  "Make learning fun with emojis and positive reinforcement.";

export const chatWithNabu = async (
  history: { role: "user" | "model"; parts: { text: string }[] }[]
): Promise<string> => {
  const groq = getGroq();

  // Convert from Gemini format ({ role: "model", parts: [{text}] })
  // to OpenAI-compatible format ({ role: "assistant", content: string })
  const messages: Groq.Chat.ChatCompletionMessageParam[] = [
    { role: "system", content: SYSTEM_PROMPT },
    ...history.map((m) => ({
      role: (m.role === "model" ? "assistant" : "user") as "assistant" | "user",
      content: m.parts.map((p) => p.text).join(""),
    })),
  ];

  const completion = await groq.chat.completions.create({
    model:       "llama-3.3-70b-versatile",
    messages,
    temperature: 0.7,
    max_tokens:  1024,
  });

  return completion.choices[0]?.message?.content ?? "";
};
