import axios from "axios";
const BASE = `${API_URL}/estantes`;
export const getEstantes = () => axios.get(BASE);
export const createEstante = (data) => axios.post(BASE, data);