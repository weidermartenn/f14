<template>
    <div class="px-6 py-2">
        <h2 class="text-3xl mt-4">Все проекты</h2>
        <span class="text-gray-300">Ниже отображаются все созданные вами проекты.</span>
        <div class="w-full mt-10 flex flex-wrap gap-4">
           <ProjectCard v-for="project in projects" :key="project.id" :project="project" /> 
        </div>
    </div>
</template>

<script setup lang="ts">
import ProjectCard from './ProjectCard.vue';
import { ref, onMounted } from "vue";
import { supabase } from "@/shared/api/supabaseClient";
import type { Project } from "@/entities/project/types";
import { user } from "@/shared/lib/auth";

const projects = ref<Project[]>([]);
const loading = ref(true);
const error = ref<string| null>(null);

const fetchProjects = async () => {
    try {
        loading.value = true;
        error.value = null;

        console.log(user.email)

        const { data, error } = await supabase
        .from('projects')
        .select("*")
        .eq("userEmail", user.email)

        if (error) throw error;

        projects.value = (data as Project[]).map((project) => ({
            ...project,
            createdAt: new Date(project.createdAt),
        }));
    } catch (err) {
        error.value = err as string;
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    fetchProjects();
})

</script>

<style scoped>

</style>