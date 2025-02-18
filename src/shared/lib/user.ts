import { reactive } from "vue";
import { supabase } from "../../shared/api/supabaseClient";
import { user } from "./auth";

// Глобальное состояние пользователя
export const userState = reactive ({
    user: user,
});

// Функция для обновления состояния пользователя
export const updateUserState = async () => {
    const { data } = await supabase.auth.getSession();
    userState.user = data.session?.user || null;
}