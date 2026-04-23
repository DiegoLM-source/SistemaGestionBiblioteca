import axios from "axios";
const BASE = "http://localhost:4000/api/estantes";
export const getEstantes = () => axios.get(BASE);
export const createEstante = (data) => axios.post(BASE, data);