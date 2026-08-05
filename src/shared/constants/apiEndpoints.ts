export const API_ENDPOINTS = {
  AUTH: {
    REQUEST_OTP: "/api/auth/otp/request",
    VERIFY_OTP: "/api/auth/otp/verify",
    PROVIDERS: "/api/providers",
    VALIDATE: (provider: string) => `/api/providers/${provider}/validate`,
    LOGOUT: "/api/auth/logout",
    ADMIN_LOGIN: "/api/auth/login",
  },
  CHECK_USAGE: "/api/analytics/users/{id}/usage",
  GET_CHAT_SESSIONS: "/api/chat/sessions",
  CREATE_CHAT_SESSION: "/api/chat/sessions",
  GET_USER_INFO: "/api/gateway-keys/me",
  GET_CHAT_BY_ID: "/api/chat/sessions/{id}",
  CHAT_COMPLETIONS: "/api/v1/chat/completions",
  DASHBOARD_SUMMARY: "/api/analytics/summary",
  DASHBOARD_DAILY: "/api/analytics/daily",
  DASHBOARD_TOP_USERS: "/api/analytics/top-users",
};
