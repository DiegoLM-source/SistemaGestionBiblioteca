import axios from "axios";

const BASE = "http://localhost:4000/api/clientes";

export const getClientes = () => axios.get(BASE);
export const createCliente = (data) => axios.post(BASE, data);
export const updateCliente = (id, data) => axios.put(`${BASE}/${id}`, data);
export const deleteCliente = (id) => axios.delete(`${BASE}/${id}`);