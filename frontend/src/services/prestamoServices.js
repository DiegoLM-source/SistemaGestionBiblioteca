import API from "./api";
import { cachedGet, clearCache } from "./cache";

const BASE = "/prestamos";
const PRESTAMOS_CACHE_KEY = "prestamos:list";
const SOLICITUDES_ME_CACHE_KEY = "prestamos:solicitudes:me";
const SOLICITUDES_ADMIN_CACHE_KEY = "prestamos:solicitudes:admin";

const clearPrestamoRelatedCache = () => {
  clearCache(
    PRESTAMOS_CACHE_KEY,
    SOLICITUDES_ME_CACHE_KEY,
    SOLICITUDES_ADMIN_CACHE_KEY,
    "libros:list",
    "reservas:list"
  );
};

export const getPrestamos = () => cachedGet(PRESTAMOS_CACHE_KEY, () => API.get(BASE));
export const getPrestamoById = (id) => API.get(`${BASE}/${id}`);

export const createPrestamo = async (data) => {
  const res = await API.post(BASE, data);
  clearPrestamoRelatedCache();
  return res;
};

export const cambiarEstado = async (id, estado) => {
  const res = await API.patch(`${BASE}/${id}/estado`, { estado });
  clearPrestamoRelatedCache();
  return res;
};

export const deletePrestamo = async (id) => {
  const res = await API.delete(`${BASE}/${id}`);
  clearPrestamoRelatedCache();
  return res;
};

export const getMisSolicitudes = () =>
  cachedGet(SOLICITUDES_ME_CACHE_KEY, () => API.get(`${BASE}/solicitudes/me`));

export const crearSolicitudPrestamo = async (data) => {
  const res = await API.post(`${BASE}/solicitudes`, data);
  clearPrestamoRelatedCache();
  return res;
};

export const getSolicitudesAdmin = () =>
  cachedGet(SOLICITUDES_ADMIN_CACHE_KEY, () => API.get(`${BASE}/solicitudes`));

export const aprobarSolicitudPrestamo = async (id, data) => {
  const res = await API.patch(`${BASE}/solicitudes/${id}/aprobar`, data);
  clearPrestamoRelatedCache();
  return res;
};
