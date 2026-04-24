import axios from "axios";

const BASE = "http://localhost:4000/api/multas";

export const getMultas = () => axios.get(BASE);
export const createMulta = (data) => axios.post(BASE, data);
export const pagarMulta = (id) => axios.patch(`${BASE}/${id}/pagar`);
export const deleteMulta = (id) => axios.delete(`${BASE}/${id}`);