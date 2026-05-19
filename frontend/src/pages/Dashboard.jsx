import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiSearch, FiBook, FiUser, FiClock, FiLogOut, FiGrid } from "react-icons/fi";
import { FaDollarSign, FaRegBookmark } from "react-icons/fa6";
import { getLibros } from "../services/libroService";
import { getClientes } from "../services/clienteService";
import { getPrestamos } from "../services/prestamoServices";
import { getMultas } from "../services/multaService";
import { isAdmin, logoutUser } from "../utils/auth";import "../styles/dashboard.css";

function Dashboard() {
  const navigate = useNavigate();
  const admin = isAdmin();
  const [stats, setStats] = useState({
    libros: 0, clientes: 0,
    prestamosActivos: 0, multasPendientes: 0
  });
  const [prestamosRecientes, setPrestamosRecientes] = useState([]);
  const [multasRecientes, setMultasRecientes] = useState([]);
  const [librosDisponibles, setLibrosDisponibles] = useState([]);

  useEffect(() => {
    const cargarStats = async () => {
      try {
        const [prestamos, multas, libros, clientes] = await Promise.all([
          getPrestamos(),
          getMultas(),
          getLibros(),
          admin ? getClientes() : Promise.resolve({ data: [] }),        ]);
        setStats({
          libros: libros.data.length,
          clientes: clientes.data.length,
          prestamosActivos: prestamos.data.filter(p => p.estado === "Activo").length,
          multasPendientes: multas.data.filter(m => !m.estado).length
        });
        setPrestamosRecientes(prestamos.data.slice(0, 5));
        setMultasRecientes(multas.data.slice(0, 5));
        setLibrosDisponibles(libros.data.filter((l) => Number(l.stock) > 0).slice(0, 8));
      } catch (err) {
        console.error("Error cargando estadísticas:", err);
      }
    };
    cargarStats();
  }, []);

  const estadoBadge = (estado) => {
    const estilos = {
      Activo:   { background: "#e6f4ea", color: "#2e7d32" },
      Vencido:  { background: "#fff3e0", color: "#e65100" },
      Devuelto: { background: "#e8f0fb", color: "#070A26" },
    };
    return (
      <span className="dash-badge" style={estilos[estado] || {}}>
        {estado}
      </span>
    );
  };

  const handleLogout = () => {
    logoutUser(navigate);
  };

  return (
    <div className="dash-wrap">
      <aside className="dash-sidebar">
        <div className="dash-sidebar-icon active"><FiGrid size={20} /></div>
        {admin && <Link to="/Books"><div className="dash-sidebar-icon"><FiBook size={20} /></div></Link>}
        {admin && <Link to="/Clientes"><div className="dash-sidebar-icon"><FiUser size={20} /></div></Link>}
        <Link to="/Prestamos"><div className="dash-sidebar-icon"><FaRegBookmark size={20} /></div></Link>
        <Link to="/multas"><div className="dash-sidebar-icon"><FaDollarSign size={20} /></div></Link>
        {admin && <Link to="/reservas"><div className="dash-sidebar-icon"><FiClock size={20} /></div></Link>}        <div className="sidebar-spacer" />
        <div className="dash-sidebar-icon" onClick={handleLogout} title="Cerrar sesión" style={{cursor: "pointer"}}><FiLogOut size={20} /></div>
      </aside>

      <div className="dash-main">

        <div className="dash-topbar">
          <div className="dash-search">
            <FiSearch size={16} color="#888" />
            <input type="text" placeholder="Buscar..." />
          </div>
        </div>

        <div className="dash-stats">
          {admin && (
            <div className="dash-stat-card">
              <span className="dash-stat-label">Libros</span>
              <span className="dash-stat-value">{stats.libros}</span>
              <div className="dash-stat-bar" style={{ background: "#070A26" }} />
            </div>
          )}
          {admin && (
            <div className="dash-stat-card">
              <span className="dash-stat-label">Clientes</span>
              <span className="dash-stat-value">{stats.clientes}</span>
              <div className="dash-stat-bar" style={{ background: "#2e7d32" }} />
            </div>
          )}          <div className="dash-stat-card">
            <span className="dash-stat-label">Préstamos activos</span>
            <span className="dash-stat-value">{stats.prestamosActivos}</span>
            <div className="dash-stat-bar" style={{ background: "#4F8EF7" }} />
          </div>
          <div className="dash-stat-card">
            <span className="dash-stat-label">Multas pendientes</span>
            <span className="dash-stat-value">{stats.multasPendientes}</span>
            <div className="dash-stat-bar" style={{ background: "#e65100" }} />
          </div>
        </div>

        <div className="dash-cards">

          {!admin && (
            <div className="dash-card">
              <div className="dash-card-header">
                <span>Libros disponibles</span>
                <Link to="/Prestamos" className="dash-card-link">Solicitar</Link>
              </div>
              <div className="dash-card-body">
                {librosDisponibles.length === 0 ? (
                  <div className="dash-empty">
                    <span>No hay libros disponibles en este momento</span>
                  </div>
                ) : (
                  <table className="dash-table">
                    <thead>
                      <tr>
                        <th>Título</th>
                        <th>Autor</th>
                        <th>Stock</th>
                      </tr>
                    </thead>
                    <tbody>
                      {librosDisponibles.map((l) => (
                        <tr key={l.id_libro}>
                          <td>{l.titulo}</td>
                          <td>{l.autor || "Sin autor"}</td>
                          <td>{l.stock}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* Préstamos recientes */}
          <div className="dash-card">
            <div className="dash-card-header">
              <span>Préstamos recientes</span>
              <Link to="/Prestamos" className="dash-card-link">Ver todos</Link>
            </div>
            <div className="dash-card-body">
              {prestamosRecientes.length === 0 ? (
                <div className="dash-empty">
                  <span>No hay préstamos registrados</span>
                </div>
              ) : (
                <table className="dash-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Cliente</th>
                      <th>Libro(s)</th>
                      <th>Fecha límite</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prestamosRecientes.map(p => (
                      <tr key={p.id_prestamo}>
                        <td>{p.id_prestamo}</td>
                        <td>{p.cliente_nombre}</td>
                        <td className="dash-td-libros">{p.libros}</td>
                        <td>{p.fecha_limite?.slice(0, 10)}</td>
                        <td>{estadoBadge(p.estado)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Multas recientes */}
          <div className="dash-card">
            <div className="dash-card-header">
              <span>Multas recientes</span>
              <Link to="/Multas" className="dash-card-link">Ver todas</Link>
            </div>
            <div className="dash-card-body">
              {multasRecientes.length === 0 ? (
                <div className="dash-empty">
                  <span>No hay multas registradas</span>
                </div>
              ) : (
                <table className="dash-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Cliente</th>
                      <th>Total</th>
                      <th>Fecha</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {multasRecientes.map(m => (
                      <tr key={m.id_multa}>
                        <td>{m.id_multa}</td>
                        <td>{m.cliente_nombre}</td>
                        <td style={{ fontWeight: 500 }}>${m.total?.toLocaleString()}</td>
                        <td>{m.fecha_multa?.slice(0, 10)}</td>
                        <td>
                          <span className="dash-badge"
                            style={m.estado
                              ? { background: "#e6f4ea", color: "#2e7d32" }
                              : { background: "#fff3e0", color: "#e65100" }}>
                            {m.estado ? "Pagada" : "Pendiente"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Dashboard;
