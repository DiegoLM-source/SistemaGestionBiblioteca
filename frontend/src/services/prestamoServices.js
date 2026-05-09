import axios from "axios";

const BASE = `${API_URL}/prestamos`;

export const getPrestamos = () => axios.get(BASE);
export const getPrestamoById = (id) => axios.get(`${BASE}/${id}`);
export const createPrestamo = (data) => axios.post(BASE, data);
export const cambiarEstado = (id, estado)=> axios.patch(`${BASE}/${id}/estado`, { estado });
export const deletePrestamo = (id) => axios.delete(`${BASE}/${id}`);