import { createRouter, createWebHistory } from 'vue-router'
import Main from '../../pages/main/ui/Main.vue';
import Auth from '../../pages/auth/ui/Auth.vue';
import { user } from "@/shared/lib/auth";
import CreateProject from '../../pages/createProject/ui/CreateProject.vue';
import Projects from '../../pages/projects/ui/Projects.vue';

export const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            component: Main,
        },
        {
            path: '/auth',
            component: Auth,
        },
        {
            path: '/create-new-project',
            component: CreateProject,
            meta: { requiresAuth: true },
        },
        {
            path: '/projects',
            component: Projects,
            meta: { requiresAuth: true },
        }
    ]
})

// Хук проверки авторизации
router.beforeEach((to, _, next) => {
    if (to.meta.requiresAuth && !user.value) {
        next("/auth");
    } else {
        next();
    }
})

export default router
