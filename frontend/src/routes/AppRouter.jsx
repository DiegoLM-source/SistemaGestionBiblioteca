import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import GoogleAuthCallback from "../pages/GoogleAuthCallback";
import Dashboard from "../pages/Dashboard";
import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";
import Register from "../pages/Register";
import Books from "../pages/Libros"; 
import Clientes from "../pages/Clientes";
import Prestamos from "../pages/Prestamos";
import Multas from "../pages/Multas";
import Reservas from "../pages/Reservas";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route path="/auth/google/callback" element={<GoogleAuthCallback />} />
        <Route path="/register" element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />

        <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route path="/books" element={
            <ProtectedRoute>
              <Books />
            </ProtectedRoute>
          }
        />

        <Route path="/clientes" element={
            <ProtectedRoute>
              <Clientes />
            </ProtectedRoute>
          }
        />

        <Route path="/prestamos" element={
            <ProtectedRoute>
              <Prestamos />
            </ProtectedRoute>
          }
        />

        <Route path="/multas" element={
            <ProtectedRoute>
              <Multas />
            </ProtectedRoute>
          }
        />

        <Route path="/reservas" element={
            <ProtectedRoute>
              <Reservas />
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
