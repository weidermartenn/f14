import { supabase } from "@/shared/api/supabaseClient";
import { ref } from "vue";

// Состояние пользователя
export const user = ref(null);

// Инициализация состояния аутентификации
export const initAuth = () => {
    // Проверка текущей сессииэ
    supabase.auth.getSession().then(({ data: { session } }) => {
        user.value = session?.user || null;
    });

    // Отслеживание изменения состояния
    supabase.auth.onAuthStateChange((event, session) => {
        if (event === "SIGNED_IN") {
            user.value = session.user;
        } else if (event === "SIGNED_OUT") {
            user.value = null;
        }
    });
}