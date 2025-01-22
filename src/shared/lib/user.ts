import { reactive } from "vue";
import { supabase } from "@/shared/api/supabaseClient";

// Глобальное состояние пользователя
export const userState = reactive ({
    user: null,
});

// Функция для обновления состояния пользователя
export const updateUserState = async () => {
    const { data } = await supabase.auth.getSession();
    userState.user = data.session?.user || null;
}