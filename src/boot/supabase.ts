import { createClient } from "@supabase/supabase-js";
import { boot } from "quasar/wrappers";

const supabaseUrl = process.env.SUPABASE_URL as string;
const supabaseKey = process.env.SUPABASE_ANON_KEY as string;
if (!supabaseUrl || !supabaseKey || supabaseUrl === "your-supabase-url") {
  console.error("Missing Supabase configuration. Please check your .env file.");
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storageKey: "invoice-builder",
    storage: window.localStorage,
  },
});

export default boot(({ app }) => {
  app.config.globalProperties.$supabase = supabase;

  // Debug auth events in development
  if (process.env.NODE_ENV === "development") {
    supabase.auth.onAuthStateChange((event, session) => {
      console.log("Supabase Auth Event:", event);
      console.log("Session:", session?.user?.email || "No session");
    });
  }
});
