import API from "./api";
import { cachedGet, clearCache } from "./cache";

const BASE = "/clientes";
const CLIENTES_CACHE_KEY = "clientes:list";

export const getClientes = () => cachedGet(CLIENTES_CACHE_KEY, () => API.get(BASE));

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
