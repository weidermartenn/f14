<template>
    <div class="sticky min-w-full px-6 py-4 flex justify-between items-center">
        <div class="flex flex-row justify-center items-center gap-2 text-white">
            <img :src=logo class="w-14"></img>
            <div class="flex flex-col">
                <span class="text-2xl">FKanban</span>
                <span class="text-sm">Доска задач для индивидуальных разработчиков</span>
            </div>
        </div>
        <div class="flex flex-row">
            <button v-if="user" class="mr-20 hover:text-hover-text" @click="projectsClick">Проекты</button>
            <section class="flex gap-4 mr-6">
            <div v-if="user" class="flex flex-col items-center">
                <span class="text-white">{{ user.email }}</span>
                <div>
                    <button @click="handleProfile" class="text-sm hover:text-hover-text mr-6">
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
</template>

<script setup lang="ts">
import logo from "@/app/assets/wflogo.svg";
import { useRouter } from "vue-router";
import { user } from "@/shared/lib/auth";
import { supabase } from "@/shared/api/supabaseClient";

const router = useRouter();

const authClick = () => {
    router.push('/auth');
}

const projectsClick = () => {
    router.push('/projects');
}

const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
}

const handleProfile = () => {
    if (user.value) {
        router.push(`/profile`);
    } else {
        authClick();
    }
}
</script>

<style scoped lang="css">

</style>