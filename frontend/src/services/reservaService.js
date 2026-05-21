import API from "./api";
import { cachedGet, clearCache } from "./cache";

const BASE = "/reservas";
const RESERVAS_CACHE_KEY = "reservas:list";

const clearReservaRelatedCache = () => {
  clearCache(RESERVAS_CACHE_KEY, "libros:list", "prestamos:list", "prestamos:solicitudes:admin");
};

export const getReservas = () => cachedGet(RESERVAS_CACHE_KEY, () => API.get(BASE));
export const getReservaById = (id) => API.get(`${BASE}/${id}`);

export const createReserva = async (data) => {
  const res = await API.post(BASE, data);
  clearReservaRelatedCache();
  return res;
};

export const reclamarReserva = async (id, data) => {
  const res = await API.patch(`${BASE}/${id}/reclamar`, data);
  clearReservaRelatedCache();
  return res;
};

export const cancelarReserva = async (id) => {
  const res = await API.patch(`${BASE}/${id}/cancelar`);
  clearReservaRelatedCache();
  return res;
};
