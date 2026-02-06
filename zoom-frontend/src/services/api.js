import axios from "axios";
import { getToken, getRefresh, saveTokens, clearTokens } from "../lib/storage";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

API.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refresh = getRefresh();
        const resp = await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/refresh`,
          { token: refresh }
        );
        saveTokens({ access: resp.data.access });
        return API(original);
      } catch (e) {
        clearTokens();
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  }
);

export default API;
