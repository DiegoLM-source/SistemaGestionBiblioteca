import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import ProtectedRoute from "./ProtectedRoute";
import Register from "../pages/Register";
import Books from "../pages/Libros"; 
import Clientes from "../pages/Clientes";
import Prestamos from "../pages/Prestamos";
import Multas from "../pages/Multas";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

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

      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;