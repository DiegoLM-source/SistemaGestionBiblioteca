import API from "./api";

const BASE = "/reservas";

export const getReservas = () => API.get(BASE);
export const getReservaById = (id) => API.get(`${BASE}/${id}`);
export const createReserva = (data) => API.post(BASE, data);
export const reclamarReserva = (id, data) => API.patch(`${BASE}/${id}/reclamar`, data);
export const cancelarReserva = (id) => API.patch(`${BASE}/${id}/cancelar`);