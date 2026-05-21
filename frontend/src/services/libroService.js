import API from "./api";
import { cachedGet, clearCache } from "./cache";

const BASE = "/libros";
const LIBROS_CACHE_KEY = "libros:list";

export const getLibros = () => cachedGet(LIBROS_CACHE_KEY, () => API.get(BASE));
export const getLibroById = (id) => API.get(`${BASE}/${id}`);

export const createLibro = async (data) => {
  const res = await API.post(BASE, data);
  clearCache(LIBROS_CACHE_KEY);
  return res;
};

export const updateLibro = async (id, data) => {
  const res = await API.put(`${BASE}/${id}`, data);
  clearCache(LIBROS_CACHE_KEY);
  return res;
};

export const deleteLibro = async (id) => {
  const res = await API.delete(`${BASE}/${id}`);
  clearCache(LIBROS_CACHE_KEY);
  return res;
};
