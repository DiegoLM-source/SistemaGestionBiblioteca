import API from "./api";
import { cachedGet, clearCache } from "./cache";

const BASE = "/categorias";
const CATEGORIAS_CACHE_KEY = "categorias:list";

export const getCategorias = () => cachedGet(CATEGORIAS_CACHE_KEY, () => API.get(BASE));

export const createCategoria = async (data) => {
  const res = await API.post(BASE, data);
  clearCache(CATEGORIAS_CACHE_KEY);
  return res;
};
