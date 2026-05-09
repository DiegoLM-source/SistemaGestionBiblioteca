import axios from "axios";
const BASE = `${API_URL}/categorias`;
export const getCategorias = () => axios.get(BASE);
export const createCategoria = (data) => axios.post(BASE, data);