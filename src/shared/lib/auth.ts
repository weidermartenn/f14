import { supabase } from "../../shared/api/supabaseClient";
import { ref } from "vue";

export const user = ref();
export const isAuthInitialized = ref(false);

export const initAuth = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    user.value = session?.user || null;
    
    supabase.auth.onAuthStateChange((event, session) => {
      user.value = session?.user || null;
      if (event === 'SIGNED_IN') {
        window.location.href = 'https://fkanban.netlify.app';
      }
    });
  } catch (error) {
    console.error("Auth initialization error:", error);
  } finally {
    isAuthInitialized.value = true;
  }
}