import axios from "axios";
import { toast } from "sonner";

const axiosInstance = axios.create({
  baseURL: "https://eeforgeit-task.onrender.com/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Request interceptor → attach token if available
axiosInstance.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor → store new access token + handle errors globally
axiosInstance.interceptors.response.use(
  (response) => {
    // ✅ Automatically update token if backend sends a new one
    const newAccessToken = response?.data?.newAccessToken;
    if (newAccessToken && typeof window !== "undefined") {
      localStorage.setItem("access_token", newAccessToken);
    }
    return response;
  },
  (error) => {
    if (!error.response) {
      toast.info("Server is currently down. Please try again later.");
    } else if (error.response?.data?.message === "Session not found") {
      // Handle session expiration here if needed
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
