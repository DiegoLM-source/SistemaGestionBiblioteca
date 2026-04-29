import axios from "axios";
import { API_URL } from "../config";

const BASE = `${API_URL}/reservas`;

export const getReservas = () => axios.get(BASE);
export const getReservaById = (id) => axios.get(`${BASE}/${id}`);
export const createReserva = (data) => axios.post(BASE, data);
export const reclamarReserva = (id, data) => axios.patch(`${BASE}/${id}/reclamar`, data);
export const cancelarReserva = (id) => axios.patch(`${BASE}/${id}/cancelar`);
