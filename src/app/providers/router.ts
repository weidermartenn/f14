import { createRouter, createWebHistory } from 'vue-router'
import Main from '../../pages/main/ui/Main.vue';
import Auth from '../../pages/auth/ui/Auth.vue';
import { user, isAuthInitialized } from "@/shared/lib/auth";
import CreateProject from '../../pages/createProject/ui/CreateProject.vue';
import Projects from '../../pages/projects/ui/Projects.vue';
import Profile from '../../pages/profile/ui/Profile.vue';

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
        },
        {
            path: '/profile',
            component: Profile,
            meta: { requiresAuth: true },
        }
    ]
})

// Асинхронный хук проверки авторизации
router.beforeEach(async (to, _, next) => {
    // Ждем завершения инициализации аутентификации
    if (!isAuthInitialized.value) {
        await new Promise(resolve => {
            const checkAuth = () => {
                if (isAuthInitialized.value) resolve(true);
                else setTimeout(checkAuth, 50);
            };
            checkAuth();
        });
    }

    if (to.meta.requiresAuth) {
        // Для защищенных маршрутов
        user.value ? next() : next('/auth');
    } else {
        // Для публичных маршрутов
        if (to.path === '/auth' && user.value) {
            next('/projects'); // Перенаправляем если пользователь авторизован
        } else {
            next();
        }
    }
})

export default router
