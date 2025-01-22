import { createRouter, createWebHistory } from 'vue-router'
import Main from '../../pages/main/ui/Main.vue';
import Auth from '../../pages/auth/ui/Auth.vue';
import StartProject from '../../pages/startproject/ui/StartProject.vue';
import { user } from "@/shared/lib/auth";

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
            path: '/start-project',
            component: StartProject,
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
