import { createRouter, createWebHistory } from 'vue-router';
import Main from '../../pages/main/ui/Main.vue';
import Auth from '../../pages/auth/ui/Auth.vue';
import { user, isAuthInitialized } from '../../shared/lib/auth';
import CreateProject from '../../pages/createProject/ui/CreateProject.vue';
import Projects from '../../pages/projects/ui/Projects.vue';
import Workspace from '../../pages/workspace/ui/Workspace.vue';
import CreateTask from '../../pages/createTask/ui/CreateTask.vue';
import AuthRedirect from '../../pages/authRedirect/ui/AuthRedirect.vue';
import Profile from '../../pages/profile/ui/Profile.vue';
import CreateOrg from '../../pages/createOrg/ui/CreateOrg.vue';
import Dashboard from '../../pages/dashboard/ui/Dashboard.vue';
import ConfirmEmail from '../../pages/confirmemail/ui/ConfirmEmail.vue';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
// @ts-ignore
// Создание роутера
export const router = createRouter({
  // Создание истории
  history: createWebHistory(),
  // Создание маршрутов
  routes: [
    // Добавление маршрутов
    // Главная страница
    {
      path: '/',
      name: 'main',
      component: Main,
    },
    // Шаблон для несуществующих маршрутов
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
    // Страница авторизации
    {
      path: '/auth',
      name: 'auth',
      component: Auth,
    },
    // Страница редиректа
    {
      path: '/auth/auth-redirect',
      name: 'auth-redirect',
      component: AuthRedirect,
    },
    // Страница панели управления
    {
      path: '/dashboard',
      name: 'dashboard',
      component: Dashboard,
      meta: { requiresAuth: true },
    }, 
    // Страница профиля
    {
      path: '/profile',
      name: 'profile',
      component: Profile,
      meta: { requiresAuth: true },
    },
    // Страница создания организации
    {
      path: '/create-organization',
      name: 'create-organization',
      component: CreateOrg,
      meta: { requiresAuth: true },
    },
    // Страница проектов
    {
      path: '/dashboard/:orgId/projects',
      name: 'projects',
      component: Projects,
      meta: { requiresAuth: true },
    },
    // Страница создания проекта
    {
      path: '/dashboard/:orgId/projects/create-new-project',
      name: 'create-new-project',
      component: CreateProject,
      meta: { requiresAuth: true },
    },
    // Страница рабочего пространства
    {
      path: '/dashboard/:orgId/projects/workspace',
      name: 'workspace',
      component: Workspace,
      meta: { requiresAuth: true },
    },
    // Страница создания задачи
    {
      path: '/dashboard/:orgId/projects/workspace/create-task',
      name: 'create-task',
      component: CreateTask,
      meta: { requiresAuth: true },
    },
    // Страница подтверждения электронной почты
    {
      path: '/confirm-email',
      name: 'confirm-email',
      component: ConfirmEmail,
    },
  ],
});

// Проверка авторизации
router.beforeEach(async (to, _, next) => {
  if (!isAuthInitialized.value) {
    // Проверка инициализации
    await new Promise(resolve => {
      const checkAuth = () => {
        // Если авторизация инициализирована - true
        if (isAuthInitialized.value) resolve(true);
        // Если авторизация инициализирована - false
        else setTimeout(checkAuth, 50);
      };
      // Запуск проверки
      checkAuth();
    });
  }

  // Если необходима авторизация
  if (to.meta.requiresAuth) {
    // Если пользователь авторизован - продолжить
    user.value ? next() : next('/auth');
  } else {
    // Если пользователь авторизован
    if (to.path === '/auth' && user.value) {
      // Перенаправление на панель управления
      next('/dashboard');
    } else if (to.path === '/' && user.value) {
      next('/dashboard');
    } else {
      next();
    }
  }
});

export default router;
