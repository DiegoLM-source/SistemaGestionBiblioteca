import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiSearch, FiPlus, FiTrash2, FiGrid, FiBook, FiUser, FiClock, FiLogOut, FiCheckCircle, FiAlertCircle } from "react-icons/fi";
import { FaRegBookmark, FaDollarSign } from "react-icons/fa6";
import { getMultas, createMulta, pagarMulta, deleteMulta } from "../services/multaService";
import { getClientes } from "../services/clienteService";
import { getPrestamos } from "../services/prestamoServices";
import { getLibros } from "../services/libroService";
import "../styles/dashboard.css";
import "../styles/multas.css";


const formVacio = { 
  fk_cliente: "", tipo: "retraso", monto: "", 
  descripcion: "", fk_prestamo: "", fk_libro: "" 
};

function Multas() {
  const [multas, setMultas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [prestamos, setPrestamos] = useState([]);
  const [libros, setLibros] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState("todos");
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(formVacio);
  const [error, setError] = useState("");

  useEffect(() => {
    cargarMultas();
    getClientes().then(r => setClientes(r.data));
    getPrestamos().then(r => setPrestamos(r.data));
    getLibros().then(r => setLibros(r.data));
  }, []);

  const cargarMultas = async () => {
    try {
      const res = await getMultas();
      setMultas(res.data);
    } catch (err) {
      console.error("Error cargando multas:", err);
    }
  };

  const multasFiltradas = multas.filter(m => {
    const coincideBusqueda = m.cliente_nombre?.toLowerCase().includes(busqueda.toLowerCase());
    const coincideFiltro =
      filtro === "todos" ||
      (filtro === "pendiente" && !m.estado) ||
      (filtro === "pagada" && m.estado);
    return coincideBusqueda && coincideFiltro;
  });

  const guardar = async () => {
    if (!form.fk_cliente || !form.tipo || !form.monto) {
      setError("Cliente, tipo y monto son obligatorios");
      return;
    }
    if (parseInt(form.monto) <= 0) {
      setError("El monto debe ser mayor a 0");
      return;
    }
    try {
      await createMulta({
        ...form,
        fk_prestamo: form.fk_prestamo || null,
        fk_libro: form.fk_libro || null
      });
      setModal(false);
      setForm(formVacio);
      cargarMultas();
    } catch (err) {
      setError(err.response?.data?.message || "Error al guardar");
    }
  };

  const handlePagar = async (id) => {
    if (!window.confirm("¿Marcar esta multa como pagada?")) return;
    try {
      await pagarMulta(id);
      cargarMultas();
    } catch (err) {
      alert(err.response?.data?.message || "Error al actualizar");
    }
  };

  const eliminar = async (id) => {
    if (!window.confirm("¿Eliminar esta multa?")) return;
    try {
      await deleteMulta(id);
      cargarMultas();
    } catch (err) {
      alert(err.response?.data?.message || "Error al eliminar");
    }
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
              <Link to="/Prestamos">
                <div className="dash-sidebar-icon">
                  <FaRegBookmark size={20}/>
                </div>     
              </Link>     
                <div className="dash-sidebar-icon active">
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
        <div className="mt-topbar">
          <div className="dash-title">
            <h2 className="mt-title">Multas</h2>
          </div>
          <div className="dash-search">
            <FiSearch size={15} color="#aaa" />
            <input type="text" placeholder="Buscar cliente..."
              value={busqueda} onChange={e => setBusqueda(e.target.value)} />
          </div>
        </div>

        <div className="mt-toolbar">
          <div className="mt-filtros">
            <span className="mt-filtros-label">Filtrar por:</span>
            <button
              className={`mt-filtro-btn filtro-pendiente ${filtro === "pendiente" ? "selected" : ""}`}
              onClick={() => setFiltro(filtro === "pendiente" ? "todos" : "pendiente")}
            >
              <FiAlertCircle size={14} /> Pendiente
            </button>
            <button
              className={`mt-filtro-btn filtro-pagada ${filtro === "pagada" ? "selected" : ""}`}
              onClick={() => setFiltro(filtro === "pagada" ? "todos" : "pagada")}
            >
              <FiCheckCircle size={14} /> Pagada
            </button>
          </div>
          <button className="mt-add-btn" onClick={() => { setForm(formVacio); setError(""); setModal(true); }}>
            <FiPlus size={16} />
          </button>
        </div>

        <div className="mt-grid-wrap">
          <div className="mt-grid">
            {multasFiltradas.map(m => (
              <div key={m.id_multa} className={`mt-card ${m.estado ? "pagada" : "pendiente"}`}>
                <div className="mt-card-header">
                  <span className="mt-card-num">Multa #{m.id_multa}</span>
                  <span className={`mt-badge ${m.estado ? "badge-pagada" : "badge-pendiente"}`}>
                    {m.estado ? "Pagada" : "Pendiente"}
                  </span>
                </div>
                <div className="mt-card-body">
                  <div className="mt-field"><span className="mt-label">Cliente</span><span>{m.cliente_nombre}</span></div>
                  <div className="mt-field"><span className="mt-label">Teléfono</span><span>{m.cliente_telefono}</span></div>
                  <div className="mt-field"><span className="mt-label">Fecha</span><span>{m.fecha_multa?.slice(0,10)}</span></div>
                  <div className="mt-field"><span className="mt-label">Total</span><span className="mt-total">${m.total.toLocaleString()}</span></div>


                  {m.detalles?.filter(d => d.id_detalle).length > 0 && (
                    <div className="mt-detalles">
                      <span className="mt-label">Detalles</span>
                      {m.detalles?.filter(d => d.id_detalle).map(d => (
                        <div key={d.id_detalle} className="mt-detalle-item">
                          <span className={`mt-tipo ${d.tipo}`}>{d.tipo}</span>
                          <div className="mt-detalle-info">
                            <span className="mt-detalle-desc">{d.descripcion}</span>
                            {d.libro && (
                              <span className="mt-detalle-libro">{d.libro}</span>
                            )}
                          </div>
                          <span className="mt-detalle-monto">${d.monto?.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="mt-card-footer">
                  <button
                    className={`mt-pagar-btn ${m.estado ? "pagada" : "activa"}`}
                    onClick={() => handlePagar(m.id_multa)}
                    disabled={m.estado}
                  >
                    {m.estado ? "✓ Pagada" : "Marcar como pagada"}
                  </button>
                  <button className="mt-del-btn" onClick={() => eliminar(m.id_multa)}>
                    <FiTrash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {modal && (
        <div className="lb-overlay">
          <div className="lb-modal">
            <h3>Nueva multa</h3>

            <label className="pr-form-label">Cliente</label>
            <select className="lb-input" value={form.fk_cliente}
              onChange={e => setForm({ ...form, fk_cliente: e.target.value })}>
              <option value="">Seleccionar cliente...</option>
              {clientes.map(c => (
                <option key={c.id_cliente} value={c.id_cliente}>{c.nombre}</option>
              ))}
            </select>

            <label className="pr-form-label">Tipo</label>
            <select className="lb-input" value={form.tipo}
              onChange={e => setForm({ ...form, tipo: e.target.value })}>
              <option value="retraso">Retraso</option>
              <option value="daño">Daño</option>
            </select>

            <label className="pr-form-label">Préstamo asociado (opcional)</label>
            <select className="lb-input" value={form.fk_prestamo}
              onChange={e => setForm({ ...form, fk_prestamo: e.target.value, fk_libro: "" })}>
              <option value="">Sin préstamo asociado</option>
              {prestamos
                .filter(p => String(p.fk_cliente) === String(form.fk_cliente))
                .map(p => (
                  <option key={p.id_prestamo} value={p.id_prestamo}>
                    Préstamo #{p.id_prestamo} — {p.fecha_limite?.slice(0,10)}
                  </option>
                ))}
            </select>

            {!form.fk_prestamo && (
              <>
                <label className="pr-form-label">Libro asociado (opcional)</label>
                <select className="lb-input" value={form.fk_libro}
                  onChange={e => setForm({ ...form, fk_libro: e.target.value })}>
                  <option value="">Sin libro asociado</option>
                  {libros.map(l => (
                    <option key={l.id_libro} value={l.id_libro}>{l.titulo}</option>
                  ))}
                </select>
              </>
            )}

            <label className="pr-form-label">Monto</label>
            <input className="lb-input" type="number" placeholder="Monto" min={1}
              value={form.monto} onChange={e => setForm({ ...form, monto: e.target.value })} />

            <label className="pr-form-label">Descripción (opcional)</label>
            <input className="lb-input" type="text" placeholder="Descripción"
              value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} />

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

export default Multas;