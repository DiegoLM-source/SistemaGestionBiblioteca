import axios from "axios";
import { API_URL } from "../config";

const BASE = `${API_URL}/estantes`;

export const getEstantes = () => axios.get(BASE);
export const createEstante = (data) => axios.post(BASE, data);