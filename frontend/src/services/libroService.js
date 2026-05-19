import API from "./api";

const BASE = "/libros";

export const getLibros = () => API.get(BASE);
export const getLibroById = (id) => API.get(`${BASE}/${id}`);
export const createLibro = (data) => API.post(BASE, data);
export const updateLibro = (id, data) => API.put(`${BASE}/${id}`, data);
export const deleteLibro = (id) => API.delete(`${BASE}/${id}`);
