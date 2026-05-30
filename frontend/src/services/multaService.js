import API from "./api";
import { cachedGet, clearCache } from "./cache";

const BASE = "/multas";

const makeCacheKey = (limit, offset) => `multas:list:${limit || 'def'}:${offset || 0}`;

const clearMultaRelatedCache = () => {
  clearCache(makeCacheKey(), "clientes:list", "prestamos:list", "libros:list");
};

export const getMultas = ({ limit = 100, offset = 0 } = {}) =>
  cachedGet(makeCacheKey(limit, offset), () => API.get(BASE, { params: { limit, offset } }));

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
