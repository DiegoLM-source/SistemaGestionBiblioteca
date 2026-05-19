import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiSearch, FiPlus, FiBook, FiUser, FiClock, FiLogOut, FiGrid, FiCheckCircle, FiXCircle } from "react-icons/fi";
import { FaRegBookmark, FaDollarSign } from "react-icons/fa6";
import { getReservas, createReserva, reclamarReserva, cancelarReserva } from "../services/reservaService";
import { getSolicitudesAdmin, aprobarSolicitudPrestamo } from "../services/prestamoServices";
import { getClientes } from "../services/clienteService";
import { getLibros } from "../services/libroService";
import { logoutUser } from "../utils/auth";
import "../styles/dashboard.css";
import "../styles/reservas.css";

const formVacio = { fecha_reserva: "", fk_cliente: "", fk_libro: "" };
const formReclamoVacio = { id_reserva: null, fecha_limite: "" };

function Reservas() {
  const navigate = useNavigate();
  const [reservas, setReservas] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [libros, setLibros] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState("todos");
  const [modalCrear, setModalCrear] = useState(false);
  const [modalReclamar, setModalReclamar] = useState(false);
  const [modalAprobar, setModalAprobar] = useState(false);
  const [idSolicitud, setIdSolicitud] = useState(null);
  const [fechaRecogida, setFechaRecogida] = useState("");
  const [form, setForm] = useState(formVacio);
  const [formReclamo, setFormReclamo] = useState(formReclamoVacio);
  const [error, setError] = useState("");
  const [pagina, setPagina] = useState(1);
  const porPagina = 6;

  useEffect(() => {
    cargarReservas();
    cargarSolicitudes();
    getClientes().then((r) => setClientes(r.data));
    getLibros().then((r) => setLibros(r.data));
  }, []);

  const cargarReservas = async () => {
    try {
      const res = await getReservas();
      setReservas(res.data);
    } catch (err) {
      console.error("Error cargando reservas:", err);
    }
  };

  const cargarSolicitudes = async () => {
    try {
      const res = await getSolicitudesAdmin();
      setSolicitudes(res.data);
    } catch (err) {
      console.error("Error cargando solicitudes:", err);
    }
  };

  const reservasFiltradas = reservas.filter((reserva) => {
    const texto = busqueda.toLowerCase();
    const coincideBusqueda =
      reserva.cliente_nombre?.toLowerCase().includes(texto) ||
      reserva.libro_titulo?.toLowerCase().includes(texto);
    const coincideFiltro = filtro === "todos" || reserva.estado?.toLowerCase() === filtro.toLowerCase();
    return coincideBusqueda && coincideFiltro;
  });

  const totalPaginas = Math.ceil(reservasFiltradas.length / porPagina);
  const reservasPagina = reservasFiltradas.slice((pagina - 1) * porPagina, pagina * porPagina);

  const abrirCrear = () => {
    setForm(formVacio);
    setError("");
    setModalCrear(true);
  };

  const guardar = async () => {
    if (!form.fecha_reserva || !form.fk_cliente || !form.fk_libro) {
      setError("Todos los campos son obligatorios");
      return;
    }

    try {
      await createReserva(form);
      setModalCrear(false);
      setForm(formVacio);
      cargarReservas();
      const librosRes = await getLibros();
      setLibros(librosRes.data);
    } catch (err) {
      setError(err.response?.data?.message || "Error al crear reserva");
    }
  };

  const abrirReclamar = (id_reserva) => {
    setError("");
    setFormReclamo({ id_reserva, fecha_limite: "" });
    setModalReclamar(true);
  };

  const reclamar = async () => {
    if (!formReclamo.fecha_limite) {
      setError("La fecha limite es obligatoria para crear el prestamo");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const payload = JSON.parse(atob(token.split(".")[1]));
      await reclamarReserva(formReclamo.id_reserva, {
        fecha_limite: formReclamo.fecha_limite,
        fk_user: payload.id,
      });
      setModalReclamar(false);
      setFormReclamo(formReclamoVacio);
      cargarReservas();
    } catch (err) {
      setError(err.response?.data?.message || "Error al reclamar reserva");
    }
  };

  const cancelar = async (id_reserva) => {
    if (!window.confirm("¿Cancelar esta reserva?")) return;

    try {
      await cancelarReserva(id_reserva);
      cargarReservas();
      const librosRes = await getLibros();
      setLibros(librosRes.data);
    } catch (err) {
      alert(err.response?.data?.message || "Error al cancelar reserva");
    }
  };

  const abrirAprobarSolicitud = (id) => {
    setIdSolicitud(id);
    setFechaRecogida("");
    setError("");
    setModalAprobar(true);
  };

  const aprobarSolicitud = async () => {
    if (!fechaRecogida) {
      setError("Debes definir una fecha de recogida");
      return;
    }

    try {
      await aprobarSolicitudPrestamo(idSolicitud, { fecha_recogida: fechaRecogida });
      setModalAprobar(false);
      setIdSolicitud(null);
      setFechaRecogida("");
      cargarSolicitudes();
      cargarReservas();
    } catch (err) {
      setError(err.response?.data?.message || "Error al aprobar solicitud");
    }
  };

  const cambiarFiltro = (nuevo) => {
    setFiltro(nuevo);
    setPagina(1);
  };

  const handleLogout = () => {
    logoutUser(navigate);
  };

  const estadoBadge = (estado) => {
    const clases = {
      Reservado: "badge-reservado",
      Reclamado: "badge-reclamado",
      Cancelado: "badge-cancelado",
    };
    return <span className={`rs-badge ${clases[estado] || ""}`}>{estado}</span>;
  };

  const solicitudesPendientes = solicitudes.filter((s) => s.estado === "Pendiente");

  return (
    <div className="dash-wrap">
      <aside className="dash-sidebar">
        <Link to="/dashboard"><div className="dash-sidebar-icon"><FiGrid size={20} /></div></Link>
        <Link to="/books"><div className="dash-sidebar-icon"><FiBook size={20} /></div></Link>
        <Link to="/clientes"><div className="dash-sidebar-icon"><FiUser size={20} /></div></Link>
        <Link to="/prestamos"><div className="dash-sidebar-icon"><FaRegBookmark size={20} /></div></Link>
        <Link to="/multas"><div className="dash-sidebar-icon"><FaDollarSign size={20} /></div></Link>
        <div className="dash-sidebar-icon active"><FiClock size={20} /></div>
        <div className="sidebar-spacer" />
        <div className="dash-sidebar-icon" onClick={handleLogout} title="Cerrar sesión" style={{ cursor: "pointer" }}><FiLogOut size={20} /></div>
      </aside>

      <div className="dash-main">
        <div className="dash-card" style={{ marginBottom: 16 }}>
          <div className="dash-card-header"><span>Solicitudes de préstamo pendientes</span></div>
          <div className="dash-card-body">
            {solicitudesPendientes.length === 0 ? (
              <div className="dash-empty"><span>No hay solicitudes pendientes</span></div>
            ) : (
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Cliente</th>
                    <th>Libro</th>
                    <th>Cantidad</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {solicitudesPendientes.map((s) => (
                    <tr key={s.id_solicitud}>
                      <td>{s.id_solicitud}</td>
                      <td>{s.cliente_nombre}</td>
                      <td>{s.libro_titulo}</td>
                      <td>{s.cantidad}</td>
                      <td>
                        <button className="lb-save" onClick={() => abrirAprobarSolicitud(s.id_solicitud)}>
                          Aprobar y pasar a reserva
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="rs-topbar">
          <h2 className="rs-title">Reservas</h2>
          <div className="dash-search">
            <FiSearch size={15} color="#aaa" />
            <input
              type="text"
              placeholder="Buscar cliente o libro..."
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value);
                setPagina(1);
              }}
            />
          </div>
        </div>

        <div className="rs-toolbar">
          <div className="rs-filtros">
            <span className="rs-filtros-label">Filtrar por:</span>
            <button className={`rs-filtro-btn filtro-reservado ${filtro === "Reservado" ? "selected" : ""}`} onClick={() => cambiarFiltro(filtro === "Reservado" ? "todos" : "Reservado")}>
              <FiClock size={14} /> Reservado
            </button>
            <button className={`rs-filtro-btn filtro-reclamado ${filtro === "Reclamado" ? "selected" : ""}`} onClick={() => cambiarFiltro(filtro === "Reclamado" ? "todos" : "Reclamado")}>
              <FiCheckCircle size={14} /> Reclamado
            </button>
            <button className={`rs-filtro-btn filtro-cancelado ${filtro === "Cancelado" ? "selected" : ""}`} onClick={() => cambiarFiltro(filtro === "Cancelado" ? "todos" : "Cancelado")}>
              <FiXCircle size={14} /> Cancelado
            </button>
          </div>

          <button className="rs-add-btn" onClick={abrirCrear}><FiPlus size={16} /></button>
        </div>

        <div className="rs-grid-wrap">
          {reservasFiltradas.length === 0 ? (
            <div className="rs-empty">
              <FiClock size={32} className="rs-empty-icon" />
              <span>No hay reservas{filtro !== "todos" ? ` con estado "${filtro}"` : " registradas"}</span>
              {filtro === "todos" && <button className="lb-empty-cta" onClick={abrirCrear}>+ Crear primera reserva</button>}
            </div>
          ) : (
            <div className="rs-grid">
              {reservasPagina.map((reserva) => (
                <div key={reserva.id_reserva} className={`rs-card ${reserva.estado?.toLowerCase()}`}>
                  <div className="rs-card-header">
                    <span className="rs-card-num">Reserva #{reserva.id_reserva}</span>
                    {estadoBadge(reserva.estado)}
                  </div>

                  <div className="rs-card-body">
                    <div className="rs-field"><span className="rs-label">Fecha reserva</span><span>{reserva.fecha_reserva?.slice(0, 10)}</span></div>
                    <div className="rs-field"><span className="rs-label">Recoger el</span><span>{reserva.fecha_reclamo?.slice(0, 10) || "No definida"}</span></div>
                    <div className="rs-field"><span className="rs-label">Cliente</span><span>{reserva.cliente_nombre}</span></div>
                    <div className="rs-field"><span className="rs-label">Telefono</span><span>{reserva.cliente_telefono}</span></div>
                    <div className="rs-field"><span className="rs-label">Libro</span><span className="rs-libro">{reserva.libro_titulo}</span></div>
                    <div className="rs-field"><span className="rs-label">Autor</span><span>{reserva.libro_autor || "Sin autor"}</span></div>
                  </div>

                  <div className="rs-card-footer">
                    <button
                      className={`rs-action-btn ${reserva.estado === "Reservado" ? "claim" : "done"}`}
                      disabled={reserva.estado !== "Reservado"}
                      onClick={() => abrirReclamar(reserva.id_reserva)}
                    >
                      {reserva.estado === "Reservado" ? "Reclamar y pasar a prestamo" : "Ya procesada"}
                    </button>
                    <button className="rs-cancel-btn" disabled={reserva.estado !== "Reservado"} onClick={() => cancelar(reserva.id_reserva)}>
                      Cancelar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {totalPaginas > 1 && (
          <div className="rs-pagination">
            <button onClick={() => setPagina((p) => Math.max(1, p - 1))} disabled={pagina === 1}>‹</button>
            {Array.from({ length: totalPaginas }, (_, i) => (
              <button key={i + 1} className={pagina === i + 1 ? "active" : ""} onClick={() => setPagina(i + 1)}>
                {i + 1}
              </button>
            ))}
            <button onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))} disabled={pagina === totalPaginas}>›</button>
          </div>
        )}
      </div>

      {modalCrear && (
        <div className="lb-overlay">
          <div className="lb-modal">
            <h3>Nueva reserva</h3>
            <label className="pr-form-label">Fecha reserva</label>
            <input className="lb-input" type="date" value={form.fecha_reserva} onChange={(e) => setForm({ ...form, fecha_reserva: e.target.value })} />

            <label className="pr-form-label">Cliente</label>
            <select className="lb-input" value={form.fk_cliente} onChange={(e) => setForm({ ...form, fk_cliente: e.target.value })}>
              <option value="">Seleccionar cliente...</option>
              {clientes.map((cliente) => <option key={cliente.id_cliente} value={cliente.id_cliente}>{cliente.nombre}</option>)}
            </select>

            <label className="pr-form-label">Libro</label>
            <select className="lb-input" value={form.fk_libro} onChange={(e) => setForm({ ...form, fk_libro: e.target.value })}>
              <option value="">Seleccionar libro...</option>
              {libros.map((libro) => (
                <option key={libro.id_libro} value={libro.id_libro} disabled={libro.stock < 1}>
                  {libro.titulo} - stock: {libro.stock}
                </option>
              ))}
            </select>

            {error && <p className="lb-error">{error}</p>}
            <div className="lb-modal-btns">
              <button className="lb-cancel" onClick={() => setModalCrear(false)}>Cancelar</button>
              <button className="lb-save" onClick={guardar}>Guardar</button>
            </div>
          </div>
        </div>
      )}

      {modalReclamar && (
        <div className="lb-overlay">
          <div className="lb-modal">
            <h3>Reclamar reserva</h3>
            <label className="pr-form-label">Fecha limite del prestamo</label>
            <input className="lb-input" type="date" value={formReclamo.fecha_limite} onChange={(e) => setFormReclamo({ ...formReclamo, fecha_limite: e.target.value })} />
            {error && <p className="lb-error">{error}</p>}
            <div className="lb-modal-btns">
              <button className="lb-cancel" onClick={() => setModalReclamar(false)}>Cancelar</button>
              <button className="lb-save" onClick={reclamar}>Convertir en prestamo</button>
            </div>
          </div>
        </div>
      )}

      {modalAprobar && (
        <div className="lb-overlay">
          <div className="lb-modal">
            <h3>Aprobar solicitud</h3>
            <label className="pr-form-label">Fecha de recogida</label>
            <input className="lb-input" type="date" value={fechaRecogida} onChange={(e) => setFechaRecogida(e.target.value)} />
            {error && <p className="lb-error">{error}</p>}
            <div className="lb-modal-btns">
              <button className="lb-cancel" onClick={() => setModalAprobar(false)}>Cancelar</button>
              <button className="lb-save" onClick={aprobarSolicitud}>Aprobar y pasar a reserva</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Reservas;
