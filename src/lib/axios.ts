import axios, { AxiosError } from "axios";
import { ENV } from "@/constants/env";

export const axiosInstance = axios.create({
  baseURL: ENV.API_URL + "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    // Client-side only - get token from localStorage/cookie if needed
    // Note: HttpOnly cookies are handled automatically by browser
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access (e.g., redirect to login)
      if (
        typeof window !== "undefined" &&
        !window.location.pathname.includes("/auth")
      ) {
        // Optional: Trigger logout or redirect
      }
    }
    return Promise.reject(error);
  },
);
