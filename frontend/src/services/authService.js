import axios from "axios";
import { API_URL } from "../config";

export const registerRequest = (data) =>
  axios.post(`${API_URL}/auth/register`, data);

export const loginRequest = (data) =>
  axios.post(`${API_URL}/auth/login`, data);

