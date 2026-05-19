import API from "./api";

const BASE = "/categorias";

export const getCategorias = () => API.get(BASE);
export const createCategoria = (data) => API.post(BASE, data);