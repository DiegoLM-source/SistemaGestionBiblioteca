import API from "./api";

const BASE = "/clientes";

export const getClientes = () => API.get(BASE);
export const createCliente = (data) => API.post(BASE, data);
export const updateCliente = (id, data) => API.put(`${BASE}/${id}`, data);
export const deleteCliente = (id) => API.delete(`${BASE}/${id}`);