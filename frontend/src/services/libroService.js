import axios from "axios";

const BASE = "http://localhost:4000/api/libros";

export const getLibros = () => axios.get(BASE);
export const getLibroById = (id) => axios.get(`${BASE}/${id}`);
export const createLibro = (data) => axios.post(BASE, data);
export const updateLibro = (id, data) => axios.put(`${BASE}/${id}`, data);
export const deleteLibro = (id) => axios.delete(`${BASE}/${id}`);