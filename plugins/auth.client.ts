import { COOKIE_NAME } from '~/utils/const';

const PUBLIC_ROUTES = ['/login'];

export default defineNuxtPlugin(() => {
  const { $router } = useNuxtApp();

  // Add global navigation guard
  $router.beforeEach((to) => {
    // Skip auth check for public routes and API routes
    if (PUBLIC_ROUTES.includes(to.path) || to.path.startsWith('/api/')) {
      return true;
    }

    return useCookie(COOKIE_NAME).value ? true : '/login';
  });
});
