import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiSearch, FiEdit2, FiTrash2, FiPlus, FiBook, FiUser, FiClock, FiLogOut, FiGrid } from "react-icons/fi";
import { FaRegBookmark, FaDollarSign } from "react-icons/fa6";
import { getLibros, createLibro, updateLibro, deleteLibro } from "../services/libroService";
import { getCategorias, createCategoria } from "../services/categoriaService";
import { getEstantes, createEstante } from "../services/estanteService";
import "../styles/dashboard.css";
import "../styles/libros.css";

const formVacioLibro     = { isbn: "", titulo: "", autor: "", editorial: "", descripcion: "", stock: "", fk_categoria: "", fk_estante: "" };
const formVacioCategoria = { nombre: "" };
const formVacioEstante   = { descripcion: "", ubicacion: "" };

function Libros() {
  const [libros, setLibros]           = useState([]);
  const [categorias, setCategorias]   = useState([]);
  const [estantes, setEstantes]       = useState([]);
  const [busqueda, setBusqueda]       = useState("");
  const [modal, setModal]             = useState(false);
  const [tipoModal, setTipoModal]     = useState("libro"); // "libro" | "categoria" | "estante"
  const [editando, setEditando]       = useState(null);
  const [form, setForm]               = useState(formVacioLibro);
  const [error, setError]             = useState("");

  useEffect(() => {
    cargarLibros();
    getCategorias().then(r => setCategorias(r.data));
    getEstantes().then(r => setEstantes(r.data));
  }, []);

  const cargarLibros = async () => {
    try {
      const res = await getLibros();
      setLibros(res.data);
    } catch (err) {
      console.error("Error cargando libros:", err);
    }
  };

  const librosFiltrados = libros.filter(l =>
    l.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
    l.autor?.toLowerCase().includes(busqueda.toLowerCase()) ||
    l.isbn?.toLowerCase().includes(busqueda.toLowerCase())
  );

  const abrirModal = (tipo, libro = null) => {
    setTipoModal(tipo);
    setEditando(libro);
    setError("");
    if (tipo === "libro")     setForm(libro || formVacioLibro);
    if (tipo === "categoria") setForm(formVacioCategoria);
    if (tipo === "estante")   setForm(formVacioEstante);
    setModal(true);
  };

  const guardar = async () => {
    try {
      if (tipoModal === "libro") {
        const { isbn, titulo, stock, fk_categoria, fk_estante } = form;
        if (!isbn || !titulo || !fk_categoria || !fk_estante) {
          setError("ISBN, título, categoría y estante son obligatorios");
          return;
        }
        if (stock === "" || parseInt(stock) < 0) {
          setError("El stock no puede ser negativo");
          return;
        }
        if (editando) {
          await updateLibro(editando.id_libro, form);
        } else {
          await createLibro(form);
        }
        cargarLibros();
      }

      if (tipoModal === "categoria") {
        if (!form.nombre) { setError("El nombre es obligatorio"); return; }
        await createCategoria(form);
        const res = await getCategorias();
        setCategorias(res.data);
      }

      if (tipoModal === "estante") {
        if (!form.ubicacion) { setError("La ubicación es obligatoria"); return; }
        await createEstante(form);
        const res = await getEstantes();
        setEstantes(res.data);
      }

      setModal(false);
    } catch (err) {
      setError(err.response?.data?.message || "Error al guardar");
    }
  };

  const eliminar = async (id) => {
    if (!window.confirm("¿Eliminar este libro?")) return;
    try {
      await deleteLibro(id);
      cargarLibros();
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
        <div className="dash-sidebar-icon active">
          <FiBook size={20} />
        </div>
        <Link to="/Clientes">
          <div className="dash-sidebar-icon">
            <FiUser size={20} />
          </div>
        </Link>
        <Link to="/Prestamos">
          <div className="dash-sidebar-icon">
            <FaRegBookmark size={20} />
          </div>
        </Link>
        <Link to="/Multas">
          <div className="dash-sidebar-icon">
            <FaDollarSign size={20} />
          </div>
        </Link>
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
          <span className="lb-title">Libros</span>
          <div className="dash-search">
            <FiSearch size={15} color="#aaa" />
            <input type="text" placeholder="Buscar..."
              value={busqueda} onChange={e => setBusqueda(e.target.value)} />
          </div>
        </div>

        <div className="lb-toolbar">
          <button className="lb-add-btn" onClick={() => abrirModal("libro")}>
            <FiPlus size={16} />
          </button>
        </div>

        <div className="lb-table-wrap">
          <table>
            <thead>
              <tr>
                <th>ISBN</th><th>Título</th><th>Autor</th>
                <th>Editorial</th><th>Categoría</th><th>Estante</th><th>Stock</th><th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {librosFiltrados.map((l, i) => (
                <tr key={l.id_libro}>
                  <td>{l.isbn}</td>
                  <td><strong>{l.titulo}</strong></td>
                  <td>{l.autor}</td>
                  <td>{l.editorial}</td>
                  <td>{l.categoria}</td>
                  <td>{l.estante}</td>
                  <td>{l.stock}</td>
                  <td>
                    <div className="lb-actions">
                      <button className="lb-btn edit" onClick={() => abrirModal("libro", l)}><FiEdit2 size={13} /></button>
                      <button className="lb-btn del" onClick={() => eliminar(l.id_libro)}><FiTrash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="lb-footer">
          <span className="lb-count">{librosFiltrados.length} libros</span>
        </div>
      </div>

      {modal && (
        <div className="lb-overlay">
          <div className="lb-modal">

            <div className="lb-modal-tabs">
              <button
                className={`lb-tab ${tipoModal === "libro" ? "active" : ""}`}
                onClick={() => { setTipoModal("libro"); setForm(formVacioLibro); setError(""); }}
              >
                Libro
              </button>
              <button
                className={`lb-tab ${tipoModal === "categoria" ? "active" : ""}`}
                onClick={() => { setTipoModal("categoria"); setForm(formVacioCategoria); setError(""); }}
              >
                Categoría
              </button>
              <button
                className={`lb-tab ${tipoModal === "estante" ? "active" : ""}`}
                onClick={() => { setTipoModal("estante"); setForm(formVacioEstante); setError(""); }}
              >
                Estante
              </button>
            </div>

            {tipoModal === "libro" && (
              <>
                <h3>{editando ? "Editar libro" : "Nuevo libro"}</h3>
                {[
                  { field: "isbn", label: "ISBN", type: "text"   },
                  { field: "titulo", label: "Título", type: "text"   },
                  { field: "autor", label: "Autor", type: "text"   },
                  { field: "editorial", label: "Editorial", type: "text"   },
                  { field: "descripcion", label: "Descripción", type: "text"   },
                ].map(({ field, label, type }) => (
                  <input key={field} className="lb-input" type={type} placeholder={label}
                    value={form[field] || ""} onChange={e => setForm({ ...form, [field]: e.target.value })} />
                ))}
                <input
                  className="lb-input"
                  type="number"
                  placeholder="Stock"
                  min={0}
                  value={form.stock || ""}
                  onChange={e => {
                    const val = parseInt(e.target.value);
                    setForm({ ...form, stock: isNaN(val) ? "" : Math.max(0, val) });
                  }}
                />
                <select className="lb-input" value={form.fk_categoria || ""}
                  onChange={e => setForm({ ...form, fk_categoria: e.target.value })}>
                  <option value="">Seleccionar categoría...</option>
                  {categorias.map(c => (
                    <option key={c.id_categoria} value={c.id_categoria}>{c.nombre}</option>
                  ))}
                </select>
                <select className="lb-input" value={form.fk_estante || ""}
                  onChange={e => setForm({ ...form, fk_estante: e.target.value })}>
                  <option value="">Seleccionar estante...</option>
                  {estantes.map(e => (
                    <option key={e.id_estante} value={e.id_estante}>{e.ubicacion}</option>
                  ))}
                </select>
              </>
            )}

            {tipoModal === "categoria" && (
              <>
                <h3>Nueva categoría</h3>
                <input className="lb-input" type="text" placeholder="Nombre"
                  value={form.nombre || ""} onChange={e => setForm({ ...form, nombre: e.target.value })} />
              </>
            )}

            {tipoModal === "estante" && (
              <>
                <h3>Nuevo estante</h3>
                <input className="lb-input" type="text" placeholder="Descripción"
                  value={form.descripcion || ""} onChange={e => setForm({ ...form, descripcion: e.target.value })} />
                <input className="lb-input" type="text" placeholder="Ubicación"
                  value={form.ubicacion || ""} onChange={e => setForm({ ...form, ubicacion: e.target.value })} />
              </>
            )}

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

export default Libros;