import { GoogleGenAI } from "@google/genai";
import { supabase, type SupabaseUser } from "../lib/supabase";

// ── Gemini AI ──────────────────────────────────────────────────────────────
let aiClient: GoogleGenAI | null = null;

function getAI() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY is not defined.");
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
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

  /** Upsert profile data (name, email, avatar) after OAuth sign-in. */
  async upsertProfile(profile: Partial<SupabaseUser> & { id: string }): Promise<SupabaseUser> {
    const { data, error } = await supabase
      .from("profiles")
      .upsert({ ...profile, last_login: new Date().toISOString() }, { onConflict: "id" })
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
export const chatWithNabu = async (
  history: { role: "user" | "model"; parts: { text: string }[] }[]
) => {
  const ai = getAI();

  const systemInstruction =
    "You are Nabu, a friendly robot owl language tutor. Your goal is to help users learn English. " +
    "Be encouraging, patient, and use simple language. Correct their mistakes gently. " +
    "You can also explain things in their native language (like Malayalam, Arabic, or Urdu) if they ask, " +
    "but try to keep them immersion-focused in English as much as possible. " +
    "Make learning fun with emojis and positive reinforcement.";

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: history,
    config: { systemInstruction, temperature: 0.7, topP: 0.95 },
  });

  return response.text;
};
