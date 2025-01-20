<template>
    <div class="min-w-max px-6 py-4 flex justify-between items-center">
        <img :src=logo class="w-14"></img>
        <section class="flex gap-4">
            <span class="hover-text">Войти</span>
            <span> | </span>
            <span class="hover-text">Создать аккаунт</span>
        </section>
    </div>
</template>

<script setup lang="ts">
import logo from "@/app/assets/wflogo.svg"
</script>

<style scoped lang="css">

</style>