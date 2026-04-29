export const logoutUser = (navigate) => {
  localStorage.removeItem("token");
  navigate("/", { replace: true });
};
