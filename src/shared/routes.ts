export const routes = {
  // page routes
  ABOUT_PAGE: "/auth/about",
  ADD_TASK_PAGE: "/auth/add-task",
  HOME_PAGE: "/auth/home",
  LOGIN_PAGE: "/login",

  // API routes
  ADD_TASK_API: "/api/auth/add-task",
  COMPLETE_TASK_API: "/api/auth/complete-task",
  LOGIN_API: "/api/login",
  LOGOUT_API: "/api/logout",
} as const;
