import API from "./api";
import { cachedGet, clearCache } from "./cache";

const BASE = "/multas";
const MULTAS_CACHE_KEY = "multas:list";

const clearMultaRelatedCache = () => {
  clearCache(MULTAS_CACHE_KEY, "clientes:list", "prestamos:list", "libros:list");
};

export const getMultas = () => cachedGet(MULTAS_CACHE_KEY, () => API.get(BASE));

export const createMulta = async (data) => {
  const res = await API.post(BASE, data);
  clearMultaRelatedCache();
  return res;
};

export const pagarMulta = async (id) => {
  const res = await API.patch(`${BASE}/${id}/pagar`);
  clearMultaRelatedCache();
  return res;
};

export const deleteMulta = async (id) => {
  const res = await API.delete(`${BASE}/${id}`);
  clearMultaRelatedCache();
  return res;
};
