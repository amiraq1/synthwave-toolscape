// Preload functions for lazy-loaded routes
const preloadFunctions = {
  toolDetails: () => import("@/pages/ToolDetails"),
  settings: () => import("@/pages/Settings"),
  admin: () => import("@/pages/Admin"),
  install: () => import("@/pages/Install"),
  index: () => import("@/pages/Index"),
};

type RouteKey = keyof typeof preloadFunctions;

// Cache to track what's already been preloaded
const preloadedRoutes = new Set<RouteKey>();

export const preloadRoute = (route: RouteKey) => {
  if (preloadedRoutes.has(route)) return;

  preloadedRoutes.add(route);
  preloadFunctions[route]();
};

export const usePreloadRoute = () => {
  const handlePreload = (route: RouteKey) => () => {
    preloadRoute(route);
  };

  return { preloadRoute: handlePreload };
};
