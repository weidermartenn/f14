import { createRouter, createWebHistory } from 'vue-router'
import Main from '../../pages/main/ui/Main.vue';
import Auth from '../../pages/auth/ui/Auth.vue';
import { user, isAuthInitialized } from '../../shared/lib/auth';
import CreateProject from '../../pages/createProject/ui/CreateProject.vue';
import Projects from '../../pages/projects/ui/Projects.vue';
import Workspace from '../../pages/workspace/ui/Workspace.vue';
import CreateTask from '../../pages/createTask/ui/CreateTask.vue';

export const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            name: 'main',
            component: Main,
        },
         // обработка 404
        {
            path: '/:pathMatch(.*)*',
            redirect: '/',
        },
        {
            path: '/auth',
            name: 'auth',
            component: Auth,
        },
        {
            path: '/create-new-project',
            name: 'create-new-project',
            component: CreateProject,
            meta: { requiresAuth: true },
        },
        {
            path: '/projects',
            name: 'projects',
            component: Projects,
            meta: { requiresAuth: true },
        },
        {
            path: '/projects/workspace',
            name: 'workspace',
            component: Workspace,
            meta : { requiresAuth: true },
        },
        {
            path: '/projects/workspace/create-task',
            name: 'create-task',
            component: CreateTask,
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
