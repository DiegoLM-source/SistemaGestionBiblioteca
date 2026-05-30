import API from "./api";
import { cachedGet, clearCache } from "./cache";

const BASE = "/clientes";

const makeCacheKey = (limit, offset) => `clientes:list:${limit || 'def'}:${offset || 0}`;

export const getClientes = ({ limit = 100, offset = 0 } = {}) =>
  cachedGet(makeCacheKey(limit, offset), () => API.get(BASE, { params: { limit, offset } }));

export const createCliente = async (data) => {
  const res = await API.post(BASE, data);
  clearCache(CLIENTES_CACHE_KEY);
  return res;
};

export const updateCliente = async (id, data) => {
  const res = await API.put(`${BASE}/${id}`, data);
  clearCache(CLIENTES_CACHE_KEY);
  return res;
};

export const deleteCliente = async (id) => {
  const res = await API.delete(`${BASE}/${id}`);
  clearCache(CLIENTES_CACHE_KEY);
  return res;
};
