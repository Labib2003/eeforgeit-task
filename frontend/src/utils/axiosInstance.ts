import axios from "axios";
import { toast } from "sonner";

const axiosInstance = axios.create({
  baseURL: "http://localhost:5000/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to automatically attach token if available
axiosInstance.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor to handle errors globally
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      // This typically means it's a CORS/network error
      toast.info("Server is currently down. Please try again later.");
    }
    // If the error response indicates "Session not found", handle accordingly
    else if (error.response?.data.message === "Session not found") {
      // Optionally: You could add logic here (e.g., redirect to login page)
      return Promise.reject(error);
    } else {
      // For all other errors, show a toast error message
      return Promise.reject(error);
    }
  },
);

export default axiosInstance;
