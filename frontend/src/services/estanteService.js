import API from "./api";

const BASE = "/estantes";

export const getEstantes = () => API.get(BASE);
export const createEstante = (data) => API.post(BASE, data);
