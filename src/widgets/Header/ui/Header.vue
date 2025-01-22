<template>
    <div class="sticky min-w-full px-6 py-4 flex justify-between items-center">
        <div class="flex flex-row justify-center items-center gap-2 text-white">
            <img :src=logo class="w-14"></img>
            <div class="flex flex-col">
                <span class="text-2xl">FKanban</span>
                <span class="text-sm">Доска задач для индивидуальных разработчиков</span>
            </div>
        </div>
        <section class="flex gap-4 mr-6">
            <div v-if="user" class="flex items-center gap-4">
                <span class="text-white">{{ user.email }}</span>
                <button @click="handleLogout" class="text-sm text-red-400 hover:text-red-500">
                    Выйти
                </button>
            </div>
            <span v-else class="hover-text" @click="authClick">Войти</span>
        </section>
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

const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
}
</script>

<style scoped lang="css">

</style>