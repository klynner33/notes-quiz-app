import axios from "axios";

// Create one shared axios instance for the whole app.
// baseURL comes from frontend/.env (VITE_API_URL).
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Before every request, attach the JWT if we have one saved.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");

  if (token) {
    // Axios headers can be undefined; ensure the object exists.
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
