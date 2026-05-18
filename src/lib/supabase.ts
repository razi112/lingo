import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL  = "https://ysevronsxymysnpwvwlr.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzZXZyb25zeHlteXNucHd2d2xyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwMTU1NDQsImV4cCI6MjA5NDU5MTU0NH0.YJDBKavNXwpqMHrSURrLB8lDqqMeFNcoR3-2t8ENC7I";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export type SupabaseUser = {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar: string;
  xp: number;
  level: number;
  streak: number;
};
