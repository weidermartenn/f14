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

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'main',
      component: Main,
    },
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
      path: '/auth/auth-redirect',
      name: 'auth-redirect',
      component: AuthRedirect,
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: Dashboard,
      meta: { requiresAuth: true },
    },
    {
      path: '/profile',
      name: 'profile',
      component: Profile,
      meta: { requiresAuth: true },
    },
    {
      path: '/create-organization',
      name: 'create-organization',
      component: CreateOrg,
      meta: { requiresAuth: true },
    },
    {
      path: '/dashboard/:orgId/projects',
      name: 'projects',
      component: Projects,
      meta: { requiresAuth: true },
    },
    {
      path: '/dashboard/:orgId/projects/create-new-project',
      name: 'create-new-project',
      component: CreateProject,
      meta: { requiresAuth: true },
    },
    {
      path: '/dashboard/:orgId/projects/workspace',
      name: 'workspace',
      component: Workspace,
      meta: { requiresAuth: true },
    },
    {
      path: '/dashboard/:orgId/projects/workspace/create-task',
      name: 'create-task',
      component: CreateTask,
      meta: { requiresAuth: true },
    },
    {
      path: '/confirm-email',
      name: 'confirm-email',
      component: ConfirmEmail, // Add the new route
    },
  ],
});

router.beforeEach(async (to, _, next) => {
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
    user.value ? next() : next('/auth');
  } else {
    if (to.path === '/auth' && user.value) {
      next('/dashboard');
    } else if (to.path === '/' && user.value) {
      next('/dashboard');
    } else {
      next();
    }
  }
});

export default router;
