import API from "./api";
import { cachedGet, clearCache } from "./cache";

const BASE = "/estantes";
const ESTANTES_CACHE_KEY = "estantes:list";

export const getEstantes = () => cachedGet(ESTANTES_CACHE_KEY, () => API.get(BASE));

export const createEstante = async (data) => {
  const res = await API.post(BASE, data);
  clearCache(ESTANTES_CACHE_KEY);
  return res;
};
