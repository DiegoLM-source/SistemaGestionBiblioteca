import axios from "axios";
const BASE = "http://localhost:4000/api/categorias";
export const getCategorias = () => axios.get(BASE);
export const createCategoria = (data) => axios.post(BASE, data);