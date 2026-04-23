import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiSearch, FiPlus, FiTrash2, FiGrid, FiBook, FiUser, FiClock, FiLogOut, FiCheckCircle, FiXCircle, FiAlertCircle } from "react-icons/fi";
import { FaRegBookmark, FaDollarSign } from "react-icons/fa6";
import { getPrestamos, createPrestamo, cambiarEstado, deletePrestamo } from "../services/prestamoServices";
import { getClientes } from "../services/clienteService";
import { getLibros } from "../services/libroService";
import "../styles/dashboard.css";
import "../styles/prestamos.css";

const formVacio = { fecha: "", fecha_limite: "", fk_cliente: "", libros: [] };

function Prestamos() {
  const [prestamos, setPrestamos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [libros, setLibros] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState("todos");
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(formVacio);
  const [error, setError] = useState("");
  const [pagina, setPagina] = useState(1);
  const porPagina = 6;

  useEffect(() => {
    cargarPrestamos();
    getClientes().then(r => setClientes(r.data));
    getLibros().then(r => setLibros(r.data));
  }, []);

  const cargarPrestamos = async () => {
    try {
      const res = await getPrestamos();
      setPrestamos(res.data);
    } catch (err) {
      console.error("Error cargando préstamos:", err);
    }
  };

  const prestamosFiltrados = prestamos.filter(p => {
    const coincideBusqueda =
      p.cliente_nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.libros?.toLowerCase().includes(busqueda.toLowerCase());
    const coincideFiltro =
      filtro === "todos" ||
      p.estado?.toLowerCase() === filtro.toLowerCase();
    return coincideBusqueda && coincideFiltro;
  });

  const totalPaginas = Math.ceil(prestamosFiltrados.length / porPagina);
  const prestamosPagina = prestamosFiltrados.slice((pagina - 1) * porPagina, pagina * porPagina);

  const toggleLibro = (id_libro) => {
    setForm(f => {
        const existe = f.libros.find(l => l.id_libro === id_libro);
        if (existe) {
            return { ...f, libros: f.libros.filter(l => l.id_libro !== id_libro) };
        } else {
            return { ...f, libros: [...f.libros, { id_libro, cantidad: 1 }] };
        }
    });
  };

  const setCantidad = (id_libro, cantidad) => {
    setForm(f => ({
        ...f,
        libros: f.libros.map(l =>
        l.id_libro === id_libro ? { ...l, cantidad: parseInt(cantidad) || 1 } : l
        )
    }));
  };

  const guardar = async () => {
    if (!form.fecha || !form.fecha_limite || !form.fk_cliente || form.libros.length === 0) {
      setError("Todos los campos son obligatorios y debes seleccionar al menos un libro");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const payload = JSON.parse(atob(token.split(".")[1]));
      await createPrestamo({ ...form, fk_user: payload.id });
      setModal(false);
      setForm(formVacio);
      cargarPrestamos();
    } catch (err) {
      setError(err.response?.data?.message || "Error al guardar");
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
      await deletePrestamo(id);
      cargarPrestamos();
    } catch (err) {
      alert(err.response?.data?.message || "Error al eliminar");
    }
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
        <Link to="/dashboard">
          <div className="dash-sidebar-icon">
              <FiGrid size={20} />
          </div>
        </Link>
        <Link to="/books">
          <div className="dash-sidebar-icon">
            <FiBook size={20} />
          </div>
        </Link>
        <Link to="/Clientes">
          <div className="dash-sidebar-icon">
            <FiUser size={20} />
          </div>
        </Link>
          <div className="dash-sidebar-icon active">
            <FaRegBookmark size={20}/>
          </div>
        <div className="dash-sidebar-icon">
          <FaDollarSign size={20} />
        </div>
        <div className="dash-sidebar-icon">
          <FiClock size={20} />
        </div>
        <div className="sidebar-spacer" />
        <div className="dash-sidebar-icon">
          <FiLogOut size={20} />
        </div>
      </aside>

      <div className="dash-main">

        <div className="pr-topbar">
          <h2 className="pr-title">Préstamos</h2>
          <div className="dash-search">
            <FiSearch size={15} color="#aaa" />
            <input type="text" placeholder="Buscar..."
              value={busqueda} onChange={e => { setBusqueda(e.target.value); setPagina(1); }} />
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
          <button className="pr-add-btn" onClick={() => { setForm(formVacio); setError(""); setModal(true); }}>
            <FiPlus size={16} />
          </button>
        </div>

        <div className="pr-grid-wrap">
          <div className="pr-grid">
            {prestamosPagina.map(p => (
              <div key={p.id_prestamo} className="pr-card">
                <div className="pr-card-header">
                  <span className="pr-card-num">Préstamo #{p.id_prestamo}</span>
                  {estadoBadge(p.estado)}
                </div>
                <div className="pr-card-body">
                  <div className="pr-field"><span className="pr-label">Fecha</span><span>{p.fecha?.slice(0,10)}</span></div>
                  <div className="pr-field"><span className="pr-label">Fecha límite</span><span>{p.fecha_limite?.slice(0,10)}</span></div>
                  <div className="pr-field"><span className="pr-label">Cliente</span><span>{p.cliente_nombre}</span></div>
                  <div className="pr-field"><span className="pr-label">Teléfono</span><span>{p.cliente_telefono}</span></div>
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
                  <button className="pr-del-btn" onClick={() => eliminar(p.id_prestamo)}>
                    <FiTrash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {totalPaginas > 1 && (
          <div className="pr-pagination">
            <button onClick={() => setPagina(p => Math.max(1, p - 1))} disabled={pagina === 1}>‹</button>
            {Array.from({ length: totalPaginas }, (_, i) => (
              <button key={i+1} className={pagina === i+1 ? "active" : ""} onClick={() => setPagina(i+1)}>{i+1}</button>
            ))}
            <button onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))} disabled={pagina === totalPaginas}>›</button>
          </div>
        )}
      </div>

      {modal && (
        <div className="lb-overlay">
          <div className="lb-modal">
            <h3>Nuevo préstamo</h3>
            <label className="pr-form-label">Fecha préstamo</label>
            <input className="lb-input" type="date"
              value={form.fecha} onChange={e => setForm({ ...form, fecha: e.target.value })} />
            <label className="pr-form-label">Fecha límite</label>
            <input className="lb-input" type="date"
              value={form.fecha_limite} onChange={e => setForm({ ...form, fecha_limite: e.target.value })} />
            <label className="pr-form-label">Cliente</label>
            <select className="lb-input"
              value={form.fk_cliente} onChange={e => setForm({ ...form, fk_cliente: e.target.value })}>
              <option value="">Seleccionar cliente...</option>
              {clientes.map(c => (
                <option key={c.id_cliente} value={c.id_cliente}>{c.nombre}</option>
              ))}
            </select>
            <label className="pr-form-label">Libros</label>
            <div className="pr-libros-check">
            {libros.map(l => {
                const seleccionado = form.libros.find(x => x.id_libro === l.id_libro);
                return (
                <div key={l.id_libro} className="pr-check-item">
                    <input
                    type="checkbox"
                    checked={!!seleccionado}
                    onChange={() => toggleLibro(l.id_libro)}
                    />
                    <span className="pr-check-titulo">{l.titulo}</span>
                    <span className="pr-check-stock">Stock: {l.stock}</span>
                    {seleccionado && (
                    <input
                        type="number"
                        className="pr-cantidad-input"
                        min={1}
                        max={l.stock}
                        value={seleccionado.cantidad}
                        onChange={e => setCantidad(l.id_libro, e.target.value)}
                    />
                    )}
                </div>
                );
            })}
            </div>
            {error && <p className="lb-error">{error}</p>}
            <div className="lb-modal-btns">
              <button className="lb-cancel" onClick={() => setModal(false)}>Cancelar</button>
              <button className="lb-save" onClick={guardar}>Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Prestamos;