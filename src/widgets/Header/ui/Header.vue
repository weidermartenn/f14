<template>
    <div class="absolute top-0 left-0 right-0">
        <div class="min-w-full px-6 py-4 flex justify-between items-center ">
            <div class="flex flex-row justify-center items-center gap-2 text-gray-900 dark:text-white">
                <div 
                    @click="router.push({ name: 'main' })" 
                    class="flex gap-2 cursor-pointer hover:scale-105 duration-150"
                >
                    <img :src="isDark ? logo : darklogo" class="w-14">
                    <div class="flex flex-col">
                        <span class="text-2xl font-medium">FKanban</span>
                        <span class="text-sm text-gray-600 dark:text-gray-400">Управление проектами и задачами</span>
                    </div>
                </div>
                <div class="ml-10 text-gray-500 dark:text-gray-400">
                    <span>v 0.0.1</span>
                </div>
            </div>
            <div class="flex flex-row items-center">
                <ChangeThemeButton class="mr-20" @theme-changed="handleThemeChange"/>
                <MainNotifications class="mr-20"/>
                <section class="flex gap-4 mr-6">
                    <div v-if="user" class="flex flex-col items-center">
                        <span class="text-gray-900 dark:text-white">{{ user.email.split('@')[0] }}</span>
                        <div class="flex gap-4">
                            <button 
                                @click="handleProfile" 
                                class="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                            >
                                Профиль
                            </button>
                            <button 
                                @click="handleLogout" 
                                class="text-sm text-red-400 hover:text-red-500 transition-colors"
                            >
                                Выйти
                            </button>
                        </div>
                    </div>
                    <span 
                        v-else 
                        class="text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 hover:scale-105 cursor-pointer duration-150"
                        @click="authClick"
                    >
                        Войти
                    </span>
                </section>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import logo from "../../../app/assets/wflogo.svg";
import darklogo from "../../../app/assets/flogo_light.svg";
import { useRouter } from "vue-router";
import { user } from "../../../shared/lib/auth";
import { supabase } from "../../../shared/api/supabaseClient";
import { ChangeThemeButton } from "../../../features/change-theme";
import MainNotifications from "../../mainnotification/ui/MainNotifications.vue";

const router = useRouter();
const isDark = ref(false);

const authClick = () => {
    router.push({ name: 'auth' });
}

const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push({ name: 'main' });
}

const handleProfile = () => {
    router.push({ name: 'profile' });
}

const handleThemeChange = (newThemeState: boolean) => {
    isDark.value = newThemeState;
}
</script>