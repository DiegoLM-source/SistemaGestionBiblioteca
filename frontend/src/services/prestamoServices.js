import API from "./api";

const BASE = "/prestamos";

export const getPrestamos = () => API.get(BASE);
export const getPrestamoById = (id) => API.get(`${BASE}/${id}`);
export const createPrestamo = (data) => API.post(BASE, data);
export const cambiarEstado = (id, estado)=> API.patch(`${BASE}/${id}/estado`, { estado });
export const deletePrestamo = (id) => API.delete(`${BASE}/${id}`);