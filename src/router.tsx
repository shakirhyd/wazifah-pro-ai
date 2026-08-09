import { createRouter as createTanStackRouter } from '@tanstack/react-router';
import { QueryClient } from '@tanstack/react-query';
import { routeTree } from './routeTree.gen';

function getRouterBasePath(): string | undefined {
  if (typeof window === 'undefined') return undefined;

  const envBase = import.meta.env.BASE_URL;
  if (envBase && envBase !== '/' && envBase !== './' && envBase !== '.') {
    return envBase.replace(/\/$/, '');
  }

  const pathname = window.location.pathname;
  if (pathname && pathname !== '/') {
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length > 0 && !segments[0].includes('.')) {
      if (window.location.hostname.endsWith('github.io') || segments[0] === 'wazifah-pro-ai') {
        return `/${segments[0]}`;
      }
    }
  }

  return undefined;
}

export function createRouter() {
  const queryClient = new QueryClient();

  const router = createTanStackRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    basepath: getRouterBasePath(),
  });

  return router;
}

export const getRouter = createRouter;

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof createRouter>;
  }
}
