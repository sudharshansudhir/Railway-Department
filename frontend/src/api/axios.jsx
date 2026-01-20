import axios from "axios";
const PORT=process.env.PORT;

const api = axios.create({
  baseURL: `${PORT}`, // backend
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
