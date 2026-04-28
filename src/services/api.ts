import { GoogleGenAI } from "@google/genai";

let aiClient: GoogleGenAI | null = null;

function getAI() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined. Please set it in your environment.");
    }
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

export const api = {
  async getUser(id: string) {
    const res = await fetch(`/api/user/${id}`);
    return res.json();
  },
  async saveProgress(userId: string, lessonId: string, score: number, xpGained: number) {
    const res = await fetch(`/api/user/${userId}/progress`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonId, score, xpGained }),
    });
    return res.json();
  },
  async getVocabulary(userId: string) {
    const res = await fetch(`/api/user/${userId}/vocabulary`);
    return res.json();
  },
  async reviewVocabulary(userId: string, word: string, success: boolean) {
    const res = await fetch(`/api/user/${userId}/vocabulary/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ word, success }),
    });
    return res.json();
  }
};

export const chatWithNabu = async (history: { role: 'user' | 'model', parts: { text: string }[] }[]) => {
  const ai = getAI();
  
  const systemInstruction = "You are Nabu, a friendly robot owl language tutor. Your goal is to help users learn English. Be encouraging, patient, and use simple language. Correct their mistakes gently. You can also explain things in their native language (like Malayalam, Arabic, or Urdu) if they ask, but try to keep them immersion-focused in English as much as possible. Make learning fun with emojis and positive reinforcement.";

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: history,
    config: {
      systemInstruction: systemInstruction,
      temperature: 0.7,
      topP: 0.95,
    }
  });
  
  return response.text;
};

