<template>
    <div class="absolute top-0 left-0 right-0">
        <div class="min-w-full px-6 py-4 flex justify-between items-center">
            <div class="flex flex-row justify-center items-center gap-2 text-white">
                <img :src=logo class="w-14"></img>
                <div class="flex flex-col">
                    <span class="text-2xl">FKanban</span>
                    <span class="text-sm">Доска задач для </span>
                </div>
            </div>
            <div class="flex flex-row items-center">
                <ChangeThemeButton class="mr-20"/>
                <button v-if="user" class="mr-20 hover:text-hover-text" @click="projectsClick">Проекты</button>
                <section class="flex gap-4 mr-6">
                <div v-if="user" class="flex flex-col items-center">
                    <span class="text-white">{{ user.email }}</span>
                    <div class="flex gap-4">
                        <button @click="handleProfile" class="text-sm hover:text-gray-300">
                            Профиль
                        </button>
                        <button @click="handleLogout" class="text-sm text-red-400 hover:text-red-500">
                            Выйти
                        </button>
                    </div>
                </div>
                <span v-else class="hover-text" @click="authClick">Войти</span>
            </section>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import logo from "@/app/assets/wflogo.svg";
import { useRouter } from "vue-router";
import { user } from "../../../shared/lib/auth";
import { supabase } from "../../../shared/api/supabaseClient";
import { ChangeThemeButton } from "../../../features/change-theme";

const router = useRouter();

const authClick = () => {
    router.push({ name: 'auth' });
}

const projectsClick = () => {
    router.push({ name: 'projects' });
};

const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push({ name: 'main' });
}

const handleProfile = () => {
    router.push({ name: 'profile' });
}
</script>

<style scoped lang="css">

</style>