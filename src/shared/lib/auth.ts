import { supabase } from "@/shared/api/supabaseClient";
import { ref } from "vue";

export const user = ref(null);
export const isAuthInitialized = ref(false);

export const initAuth = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    user.value = session?.user || null;
    
    supabase.auth.onAuthStateChange((_, session) => {
      user.value = session?.user || null;
    });
  } catch (error) {
    console.error("Auth initialization error:", error);
  } finally {
    isAuthInitialized.value = true;
  }
}