import API from "./api";

const BASE = "/multas";

export const getMultas = () => API.get(BASE);
export const createMulta = (data) => API.post(BASE, data);
export const pagarMulta = (id) => API.patch(`${BASE}/${id}/pagar`);
export const deleteMulta = (id) => API.delete(`${BASE}/${id}`);
