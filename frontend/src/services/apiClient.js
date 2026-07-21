import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL || "/api";

const apiClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

apiClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const errorDetails = {
      message: error.response?.data?.message || error.message || "An unexpected error occurred",
      status: error.response?.status,
      data: error.response?.data,
    };
    return Promise.reject(errorDetails);
  }
);

export default apiClient;
