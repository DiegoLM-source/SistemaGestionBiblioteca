import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiSearch, FiEdit2, FiTrash2, FiPlus, FiBook, FiUser, FiClock, FiPlay, FiLogOut, FiGrid } from "react-icons/fi";
import { FaRegBookmark, FaDollarSign } from "react-icons/fa6";
import { getClientes, createCliente, updateCliente, deleteCliente } from "../services/clienteService";
import "../styles/dashboard.css";
import "../styles/clientes.css";

const formVacio = { nombre: "", correo: "", telefono: "" };

function Clientes() {
  const [clientes, setClientes]   = useState([]);
  const [busqueda, setBusqueda]   = useState("");
  const [modal, setModal]         = useState(false);
  const [editando, setEditando]   = useState(null);
  const [form, setForm]           = useState(formVacio);
  const [error, setError]         = useState("");

  useEffect(() => { cargarClientes(); }, []);

  const cargarClientes = async () => {
    try {
      const res = await getClientes();
      setClientes(res.data);
    } catch (err) {
      console.error("Error cargando clientes:", err);
    }
  };

  const clientesFiltrados = clientes.filter(c =>
    c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.correo?.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.telefono?.toLowerCase().includes(busqueda.toLowerCase())
  );

  const abrirModal = (cliente = null) => {
    setEditando(cliente);
    setForm(cliente || formVacio);
    setError("");
    setModal(true);
  };

  const guardar = async () => {
    if (!form.nombre) {
      setError("El nombre es obligatorio");
      return;
    }
    try {
      if (editando) {
        await updateCliente(editando.id_cliente, form);
      } else {
        await createCliente(form);
      }
      setModal(false);
      cargarClientes();
    } catch (err) {
      setError(err.response?.data?.message || "Error al guardar");
    }
  };

  const eliminar = async (id) => {
    if (!window.confirm("¿Eliminar este cliente?")) return;
    try {
      await deleteCliente(id);
      cargarClientes();
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
        <div className="dash-sidebar-icon active">
            <FiUser size={20} />
        </div>
        <Link to="/Prestamos">
          <div className="dash-sidebar-icon">
            <FaRegBookmark size={20}/>
          </div>
        </Link>
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
        <div className="lb-header">
          <span className="lb-title">Clientes</span>
          <div className="dash-search">
            <FiSearch size={15} color="#aaa" />
            <input type="text" placeholder="Buscar..."
              value={busqueda} onChange={e => setBusqueda(e.target.value)} />
          </div>
        </div>

        <div className="lb-toolbar">
          <button className="lb-add-btn" onClick={() => abrirModal()}>
            <FiPlus size={16} />
          </button>
        </div>

        <div className="lb-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Teléfono</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clientesFiltrados.map((c, i) => (
                <tr key={c.id_cliente}>
                  <td><strong>{c.nombre}</strong></td>
                  <td>{c.correo}</td>
                  <td>{c.telefono}</td>
                  <td>
                    <div className="lb-actions">
                      <button className="lb-btn edit" onClick={() => abrirModal(c)}><FiEdit2 size={13} /></button>
                      <button className="lb-btn del" onClick={() => eliminar(c.id_cliente)}><FiTrash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="lb-footer">
          <span className="lb-count">{clientesFiltrados.length} clientes</span>
        </div>
      </div>

      {modal && (
        <div className="lb-overlay">
          <div className="lb-modal">
            <h3>{editando ? "Editar cliente" : "Nuevo cliente"}</h3>
            {[
              { field: "nombre",   label: "Nombre",    type: "text"  },
              { field: "correo",   label: "Correo",    type: "email" },
              { field: "telefono", label: "Teléfono",  type: "text"  },
            ].map(({ field, label, type }) => (
              <input key={field} className="lb-input" type={type} placeholder={label}
                value={form[field]} onChange={e => setForm({ ...form, [field]: e.target.value })} />
            ))}
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

export default Clientes;