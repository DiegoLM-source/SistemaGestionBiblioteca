import axios from "axios";

const BASE = `${API_URL}/clientes`;

export const getClientes = () => axios.get(BASE);
export const createCliente = (data) => axios.post(BASE, data);
export const updateCliente = (id, data) => axios.put(`${BASE}/${id}`, data);
export const deleteCliente = (id) => axios.delete(`${BASE}/${id}`);