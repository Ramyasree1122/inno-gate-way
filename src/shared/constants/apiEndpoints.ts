export const API_ENDPOINTS = {
  AUTH: {
    REQUEST_OTP: "/api/auth/otp/request",
    VERIFY_OTP: "/api/auth/otp/verify",
    PROVIDERS: "/api/providers",
    VALIDATE: (provider: string) => `/api/providers/${provider}/validate`,
  },
  CHECK_USAGE: "/api/analytics/users/{id}/usage",
  GET_CHAT_SESSIONS: "/api/chat/sessions",
  GET_USER_INFO: "/api/gateway-keys/me",
  GET_CHAT_BY_ID: "/api/chat/sessions/{id}",
};
