export const routes = {
  // page routes
  ABOUT_PAGE: "/auth/about",
  HOME_PAGE: "/auth/home",
  LOGIN_PAGE: "/login",
  ADD_TASK_PAGE: "/auth/add-task",

  // API routes
  LOGIN_API: "/api/login",
  LOGOUT_API: "/api/logout",
  ADD_TASK_API: "/api/auth/add-task",
} as const;
