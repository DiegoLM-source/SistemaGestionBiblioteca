import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiSearch,
  FiPlus,
  FiTrash2,
  FiGrid,
  FiBook,
  FiUser,
  FiClock,
  FiLogOut,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
} from "react-icons/fi";
import { FaRegBookmark, FaDollarSign } from "react-icons/fa6";
import {
  getPrestamos,
  createPrestamo,
  cambiarEstado,
  deletePrestamo,
  getMisSolicitudes,
  crearSolicitudPrestamo,
} from "../services/prestamoServices";
import { getClientes } from "../services/clienteService";
import { getLibros } from "../services/libroService";
import { getCurrentDateString } from "../utils/date";
import { isAdmin, logoutUser } from "../utils/auth";
import "../styles/dashboard.css";
import "../styles/prestamos.css";

const formVacioAdmin = { fecha: "", fecha_limite: "", fk_cliente: "", libros: [] };
const formVacioUsuario = { id_libro: "", cantidad: 1 };

function BuscadorCliente({ clientes, value, onChange }) {
  const [query, setQuery] = useState("");
  const [abierto, setAbierto] = useState(false);
  const seleccionado = clientes.find(c => c.id_cliente === parseInt(value));
  const filtrados = clientes.filter(c =>
    c.nombre.toLowerCase().includes(query.toLowerCase()) ||
    c.correo?.toLowerCase().includes(query.toLowerCase()) ||
    c.telefono?.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="buscador-wrap">
      <input
        className="lb-input"
        type="text"
        placeholder="Buscar cliente por nombre, correo o teléfono..."
        value={seleccionado ? seleccionado.nombre : query}
        onChange={e => { setQuery(e.target.value); onChange(""); setAbierto(true); }}
        onFocus={() => setAbierto(true)}
      />
      {abierto && query && filtrados.length > 0 && (
        <div className="buscador-dropdown">
          {filtrados.slice(0, 8).map(c => (
            <div key={c.id_cliente} className="buscador-item"
              onClick={() => { onChange(c.id_cliente); setQuery(""); setAbierto(false); }}>
              <span className="buscador-nombre">{c.nombre}</span>
              <span className="buscador-sub">{c.correo} · {c.telefono}</span>
            </div>
          ))}
        </div>
      )}
      {seleccionado && (
        <div className="buscador-seleccionado">
          <span>✓ {seleccionado.nombre}</span>
          <button type="button" onClick={() => { onChange(""); setQuery(""); }}>✕</button>
        </div>
      )}
    </div>
  );
}

function BuscadorLibros({ libros, seleccionados, onToggle, onCantidad }) {
  const [query, setQuery] = useState("");
  const filtrados = libros.filter(l =>
    l.titulo.toLowerCase().includes(query.toLowerCase()) ||
    l.autor?.toLowerCase().includes(query.toLowerCase()) ||
    l.isbn?.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="buscador-libros-wrap">
      <input
        className="lb-input"
        type="text"
        placeholder="Buscar libro por título, autor o ISBN..."
        value={query}
        onChange={e => setQuery(e.target.value)}
      />
      <div className="pr-libros-check">
        {(query ? filtrados : libros).slice(0, 20).map(l => {
          const seleccionado = seleccionados.find(x => x.id_libro === l.id_libro);
          return (
            <div key={l.id_libro} className="pr-check-item">
              <input type="checkbox" checked={!!seleccionado}
                onChange={() => onToggle(l.id_libro)} />
              <span className="pr-check-titulo">{l.titulo}</span>
              <span className="pr-check-stock">Stock: {l.stock}</span>
              {seleccionado && (
                <input type="number" className="pr-cantidad-input"
                  min={1} max={l.stock} value={seleccionado.cantidad}
                  onChange={e => onCantidad(l.id_libro, e.target.value)} />
              )}
            </div>
          );
        })}
        {query && filtrados.length === 0 && (
          <span style={{ fontSize: 12, color: "#aaa", padding: "4px 8px" }}>Sin resultados</span>
        )}
      </div>
      {seleccionados.length > 0 && (
        <div className="buscador-seleccionados-chips">
          {seleccionados.map(s => {
            const libro = libros.find(l => l.id_libro === s.id_libro);
            return (
              <span key={s.id_libro} className="buscador-chip">
                {libro?.titulo} (x{s.cantidad})
                <button type="button" onClick={() => onToggle(s.id_libro)}>✕</button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}

function BuscadorLibroSimple({ libros, value, onChange }) {
  const [query, setQuery] = useState("");
  const [abierto, setAbierto] = useState(false);
  const seleccionado = libros.find(l => l.id_libro === parseInt(value));
  const filtrados = libros.filter(l =>
    l.titulo.toLowerCase().includes(query.toLowerCase()) ||
    l.autor?.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="buscador-wrap">
      <input
        className="lb-input"
        type="text"
        placeholder="Buscar libro por título o autor..."
        value={seleccionado ? seleccionado.titulo : query}
        onChange={e => { setQuery(e.target.value); onChange(""); setAbierto(true); }}
        onFocus={() => setAbierto(true)}
      />
      {abierto && query && filtrados.length > 0 && (
        <div className="buscador-dropdown">
          {filtrados.slice(0, 8).map(l => (
            <div key={l.id_libro} className="buscador-item"
              onClick={() => { onChange(l.id_libro); setQuery(""); setAbierto(false); }}>
              <span className="buscador-nombre">{l.titulo}</span>
              <span className="buscador-sub">{l.autor} · Stock: {l.stock}</span>
            </div>
          ))}
        </div>
      )}
      {seleccionado && (
        <div className="buscador-seleccionado">
          <span>✓ {seleccionado.titulo}</span>
          <button type="button" onClick={() => { onChange(""); setQuery(""); }}>✕</button>
        </div>
      )}
    </div>
  );
}

function Prestamos() {
  const navigate = useNavigate();
  const admin = isAdmin();
  const hoy = getCurrentDateString();

  const [prestamos, setPrestamos] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [libros, setLibros] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState("todos");
  const [modal, setModal] = useState(false);
  const [formAdmin, setFormAdmin] = useState(formVacioAdmin);
  const [formUsuario, setFormUsuario] = useState(formVacioUsuario);
  const [error, setError] = useState("");
  const [pagina, setPagina] = useState(1);
  const porPagina = 6;

  useEffect(() => {
    cargarPrestamos();
    if (admin) {
      getClientes().then((r) => setClientes(r.data));
      getLibros().then((r) => setLibros(r.data));
    } else {
      getLibros().then((r) => setLibros(r.data));
      cargarSolicitudes();
    }
  }, [admin]);

  const cargarPrestamos = async () => {
    try {
      const res = await getPrestamos();
      setPrestamos(res.data);
    } catch (err) {
      console.error("Error cargando préstamos:", err);
    }
  };

  const cargarSolicitudes = async () => {
    try {
      const res = await getMisSolicitudes();
      setSolicitudes(res.data);
    } catch (err) {
      console.error("Error cargando solicitudes:", err);
    }
  };

  const prestamosFiltrados = prestamos.filter((p) => {
    const coincideBusqueda =
      p.cliente_nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.libros?.toLowerCase().includes(busqueda.toLowerCase());
    const coincideFiltro = filtro === "todos" || p.estado?.toLowerCase() === filtro.toLowerCase();
    return coincideBusqueda && coincideFiltro;
  });

  const totalPaginas = Math.ceil(prestamosFiltrados.length / porPagina);
  const prestamosPagina = prestamosFiltrados.slice((pagina - 1) * porPagina, pagina * porPagina);

  const toggleLibro = (id_libro) => {
    setFormAdmin((f) => {
      const existe = f.libros.find((l) => l.id_libro === id_libro);
      if (existe) {
        return { ...f, libros: f.libros.filter((l) => l.id_libro !== id_libro) };
      }
      return { ...f, libros: [...f.libros, { id_libro, cantidad: 1 }] };
    });
  };

  const setCantidad = (id_libro, cantidad) => {
    setFormAdmin((f) => ({
      ...f,
      libros: f.libros.map((l) =>
        l.id_libro === id_libro ? { ...l, cantidad: parseInt(cantidad, 10) || 1 } : l
      ),
    }));
  };

  const guardarAdmin = async () => {
    if (
      !formAdmin.fecha ||
      !formAdmin.fecha_limite ||
      !formAdmin.fk_cliente ||
      formAdmin.libros.length === 0
    ) {
      setError("Todos los campos son obligatorios y debes seleccionar al menos un libro");
      return;
    }

    if (formAdmin.fecha_limite < hoy) {
      setError("La fecha de devolución no puede ser anterior a hoy");
      return;
    }

    if (formAdmin.fecha_limite < formAdmin.fecha) {
      setError("La fecha de devolución no puede ser anterior a la fecha del préstamo");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const payload = JSON.parse(atob(token.split(".")[1]));
      await createPrestamo({ ...formAdmin, fk_user: payload.id });
      setModal(false);
      setFormAdmin(formVacioAdmin);
      cargarPrestamos();
    } catch (err) {
      setError(err.response?.data?.message || "Error al guardar");
    }
  };

  const guardarSolicitudUsuario = async () => {
    if (!formUsuario.id_libro || !formUsuario.cantidad) {
      setError("Debes seleccionar libro y cantidad");
      return;
    }

    try {
      await crearSolicitudPrestamo(formUsuario);
      setModal(false);
      setFormUsuario(formVacioUsuario);
      cargarSolicitudes();
    } catch (err) {
      setError(err.response?.data?.message || "Error al enviar solicitud");
    }
  };

  const handleEstado = async (id, estadoActual) => {
    if (estadoActual === "Devuelto") return;
    try {
      await cambiarEstado(id, "Devuelto");
      cargarPrestamos();
    } catch (err) {
      alert(err.response?.data?.message || "Error al cambiar estado");
    }
  };

  const eliminar = async (id, estadoActual) => {
    if (!window.confirm("¿Eliminar este préstamo?")) return;
    if (estadoActual === "Activo") return;
    try {
      await deletePrestamo(id, estadoActual);
      cargarPrestamos();
    } catch (err) {
      alert(err.response?.data?.message || "Error al eliminar");
    }
  };

  const handleLogout = () => {
    logoutUser(navigate);
  };

  const estadoBadge = (estado) => {
    const clases = { Activo: "badge-activo", Devuelto: "badge-devuelto", Vencido: "badge-vencido" };
    return <span className={`pr-badge ${clases[estado] || ""}`}>{estado}</span>;
  };

  const cambiarFiltro = (nuevo) => {
    setFiltro(nuevo);
    setPagina(1);
  };

  return (
    <div className="dash-wrap">
      <aside className="dash-sidebar">
        <Link to="/dashboard"><div className="dash-sidebar-icon"><FiGrid size={20} /></div></Link>
        {admin && <Link to="/books"><div className="dash-sidebar-icon"><FiBook size={20} /></div></Link>}
        {admin && <Link to="/Clientes"><div className="dash-sidebar-icon"><FiUser size={20} /></div></Link>}
        <div className="dash-sidebar-icon active"><FaRegBookmark size={20} /></div>
        <Link to="/multas"><div className="dash-sidebar-icon"><FaDollarSign size={20} /></div></Link>
        {admin && <Link to="/reservas"><div className="dash-sidebar-icon"><FiClock size={20} /></div></Link>}
        <div className="sidebar-spacer" />
        <div className="dash-sidebar-icon" onClick={handleLogout} title="Cerrar sesión" style={{ cursor: "pointer" }}>
          <FiLogOut size={20} />
        </div>
      </aside>

      <div className="dash-main">
        <div className="pr-topbar">
          <h2 className="pr-title">{admin ? "Préstamos" : "Mis préstamos"}</h2>
          <div className="dash-search">
            <FiSearch size={15} color="#aaa" />
            <input
              type="text"
              placeholder="Buscar..."
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value);
                setPagina(1);
              }}
            />
          </div>
        </div>

        <div className="pr-toolbar">
          <div className="pr-filtros">
            <span className="pr-filtros-label">Filtrar por:</span>
            <button
              className={`pr-filtro-btn filtro-activo ${filtro === "Activo" ? "selected" : ""}`}
              onClick={() => cambiarFiltro(filtro === "Activo" ? "todos" : "Activo")}
            >
              <FiCheckCircle size={14} /> Activo
            </button>
            <button
              className={`pr-filtro-btn filtro-devuelto ${filtro === "Devuelto" ? "selected" : ""}`}
              onClick={() => cambiarFiltro(filtro === "Devuelto" ? "todos" : "Devuelto")}
            >
              <FiAlertCircle size={14} /> Devuelto
            </button>
            <button
              className={`pr-filtro-btn filtro-vencido ${filtro === "Vencido" ? "selected" : ""}`}
              onClick={() => cambiarFiltro(filtro === "Vencido" ? "todos" : "Vencido")}
            >
              <FiXCircle size={14} /> Vencido
            </button>
          </div>
          <button
            className="pr-add-btn"
            onClick={() => {
              setError("");
              setModal(true);
            }}
          >
            <FiPlus size={16} />
          </button>
        </div>

        {!admin && (
          <div className="dash-card" style={{ marginBottom: 16 }}>
            <div className="dash-card-header"><span>Mis solicitudes</span></div>
            <div className="dash-card-body">
              {solicitudes.length === 0 ? (
                <div className="dash-empty"><span>No tienes solicitudes</span></div>
              ) : (
                <table className="dash-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Libro</th>
                      <th>Estado</th>
                      <th>Recoger el</th>
                    </tr>
                  </thead>
                  <tbody>
                    {solicitudes.map((s) => (
                      <tr key={s.id_solicitud}>
                        <td>{s.id_solicitud}</td>
                        <td>{s.libro_titulo}</td>
                        <td>{s.estado}</td>
                        <td>{s.fecha_recogida ? s.fecha_recogida.slice(0, 10) : "Pendiente por definir"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        <div className="pr-grid-wrap">
          {prestamosFiltrados.length === 0 ? (
            <div className="pr-empty">
              <FaRegBookmark size={32} className="pr-empty-icon" />
              <span>
                No hay préstamos{filtro !== "todos" ? ` con estado "${filtro}"` : " registrados"}
              </span>
            </div>
          ) : (
            <div className="pr-grid">
              {prestamosPagina.map((p) => (
                <div key={p.id_prestamo} className={`pr-card ${p.estado?.toLowerCase()}`}>
                  <div className="pr-card-header">
                    <span className="pr-card-num">Préstamo #{p.id_prestamo}</span>
                    {estadoBadge(p.estado)}
                  </div>
                  <div className="pr-card-body">
                    <div className="pr-field"><span className="pr-label">Fecha</span><span>{p.fecha?.slice(0, 10)}</span></div>
                    <div className="pr-field"><span className="pr-label">Fecha límite</span><span>{p.fecha_limite?.slice(0, 10)}</span></div>
                    {admin && <div className="pr-field"><span className="pr-label">Cliente</span><span>{p.cliente_nombre}</span></div>}
                    {admin && <div className="pr-field"><span className="pr-label">Teléfono</span><span>{p.cliente_telefono}</span></div>}
                    <div className="pr-field"><span className="pr-label">Libro(s)</span><span className="pr-libros">{p.libros}</span></div>
                  </div>
                  <div className="pr-card-footer">
                    <button
                      className={`pr-estado-btn ${p.estado === "Devuelto" ? "devuelto" : "activo"}`}
                      onClick={() => handleEstado(p.id_prestamo, p.estado)}
                      disabled={p.estado === "Devuelto"}
                    >
                      {p.estado === "Devuelto" ? "✓ Devuelto" : "Marcar como devuelto"}
                    </button>
                    {admin && (
                      <button className="pr-del-btn" onClick={() => eliminar(p.id_prestamo, p.estado)}>
                        <FiTrash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {totalPaginas > 1 && (
          <div className="pr-pagination">
            <button onClick={() => setPagina((p) => Math.max(1, p - 1))} disabled={pagina === 1}>‹</button>
            {Array.from({ length: totalPaginas }, (_, i) => (
              <button key={i + 1} className={pagina === i + 1 ? "active" : ""} onClick={() => setPagina(i + 1)}>{i + 1}</button>
            ))}
            <button onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))} disabled={pagina === totalPaginas}>›</button>
          </div>
        )}
      </div>

      {modal && (
        <div className="lb-overlay">
          <div className="lb-modal">
            <h3>{admin ? "Nuevo préstamo" : "Solicitar préstamo"}</h3>

            {admin ? (
              <>
                <label className="pr-form-label">Fecha préstamo</label>
                <input className="lb-input" type="date" min={hoy}
                  value={formAdmin.fecha}
                  onChange={e => setFormAdmin({ ...formAdmin, fecha: e.target.value })} />

                <label className="pr-form-label">Fecha límite</label>
                <input className="lb-input" type="date" min={formAdmin.fecha || hoy}
                  value={formAdmin.fecha_limite}
                  onChange={e => setFormAdmin({ ...formAdmin, fecha_limite: e.target.value })} />

                {/* Buscador de clientes */}
                <label className="pr-form-label">Cliente</label>
                <BuscadorCliente
                  clientes={clientes}
                  value={formAdmin.fk_cliente}
                  onChange={id => setFormAdmin({ ...formAdmin, fk_cliente: id })}
                />

                {/* Buscador de libros */}
                <label className="pr-form-label">Libros</label>
                <BuscadorLibros
                  libros={libros}
                  seleccionados={formAdmin.libros}
                  onToggle={toggleLibro}
                  onCantidad={setCantidad}
                />
              </>
            ) : (
              <>
                <label className="pr-form-label">Libro</label>
                <BuscadorLibroSimple
                  libros={libros}
                  value={formUsuario.id_libro}
                  onChange={id => setFormUsuario({ ...formUsuario, id_libro: id })}
                />
                <label className="pr-form-label">Cantidad</label>
                <input className="lb-input" type="number" min={1}
                  value={formUsuario.cantidad}
                  onChange={e => setFormUsuario({ ...formUsuario, cantidad: e.target.value })} />
                <p className="lb-help">Tu solicitud será revisada por un administrador.</p>
              </>
            )}

            {error && <p className="lb-error">{error}</p>}
            <div className="lb-modal-btns">
              <button className="lb-cancel" onClick={() => setModal(false)}>Cancelar</button>
              <button className="lb-save" onClick={admin ? guardarAdmin : guardarSolicitudUsuario}>Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Prestamos;
