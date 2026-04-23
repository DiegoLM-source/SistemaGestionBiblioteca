import axios from "axios";

export const registerRequest = (data) =>
  axios.post("http://localhost:4000/api/auth/register", data);

export const loginRequest = (data) =>
  axios.post("http://localhost:4000/api/auth/login", data);