const decodeTokenPayload = (token) => {
  try {
    if (!token) return null;
    const [, payload] = token.split(".");
    if (!payload) return null;
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
};

export const getAuthUser = () => {
  const token = localStorage.getItem("token");
  return decodeTokenPayload(token);
};

export const getUserRole = () => {
  const user = getAuthUser();
  return Number(user?.rol);
};

export const isAdmin = () => getUserRole() === 1;
export const logoutUser = (navigate) => {
  localStorage.removeItem("token");
  navigate("/", { replace: true });
};
