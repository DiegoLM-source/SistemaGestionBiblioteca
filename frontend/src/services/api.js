import axios from "axios";
import { API_URL } from "../config";

const API = axios.create({
  baseURL: API_URL,
  headers: {
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
  }
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Agrega timestamp para evitar caché
  config.params = { ...config.params, _t: Date.now() };
  return config;
});

export default API;
