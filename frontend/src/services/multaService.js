import axios from "axios";

const BASE = `${API_URL}/multas`;

export const getMultas = () => axios.get(BASE);
export const createMulta = (data) => axios.post(BASE, data);
export const pagarMulta = (id) => axios.patch(`${BASE}/${id}/pagar`);
export const deleteMulta = (id) => axios.delete(`${BASE}/${id}`);