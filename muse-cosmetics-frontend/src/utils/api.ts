import axios from "axios";
import { v4 as uuidv4 } from "uuid";

const BASE_URL = "http://localhost:3000/api";
const STATIC_URL = "http://localhost:3000/uploads";

// Create axios instance
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// Generate or get session ID for guest users
const getSessionId = (): string => {
  let sessionId = localStorage.getItem("x-session-id");
  if (!sessionId) {
    sessionId = uuidv4();
    localStorage.setItem("x-session-id", sessionId);
  }
  return sessionId;
};

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add authorization token if available
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add session ID for guest users
    if (!token) {
      config.headers["x-session-id"] = getSessionId();
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth data on unauthorized
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user_data");

      // Only redirect to login if not already on login/register pages
      const currentPath = window.location.pathname;
      if (
        !currentPath.includes("/login") &&
        !currentPath.includes("/register")
      ) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
