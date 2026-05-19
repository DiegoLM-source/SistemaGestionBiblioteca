import { Navigate } from "react-router-dom";
import { getUserRole } from "../utils/auth";

function ProtectedRoute({ children, allowedRoles = [] }) {  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles.length > 0) {
    const role = getUserRole();
    if (!allowedRoles.includes(role)) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
}

export default ProtectedRoute;