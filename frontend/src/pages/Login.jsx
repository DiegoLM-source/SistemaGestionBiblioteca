import { useState } from "react";
import { loginRequest } from "../services/authService";
import { useNavigate, Link } from "react-router-dom";
import heroImage from "../assets/hero.png";
import "../styles/login.css";

const shelfBooks = [
  ["tall", "gold", "slim", "cream", "navy", "tall"],
  ["slim", "wine", "tall", "gold", "cream", "navy"],
  ["cream", "tall", "slim", "wine", "gold", "tall"],
];

function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ username: "", password: "" });
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleMouseMove = (e) => {
    const { innerWidth, innerHeight } = window;
    const x = (e.clientX / innerWidth - 0.5) * 2;
    const y = (e.clientY / innerHeight - 0.5) * 2;
    setMousePosition({ x, y });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await loginRequest(form);
      localStorage.setItem("token", res.data.token);
      navigate("/dashboard", { replace: true });
    } catch (error) {
      alert(error.response?.data?.message || "Error en login");
    }
  };

  const bookTransform = `translate(${mousePosition.x * 18}px, ${mousePosition.y * 14}px) rotateX(${
    mousePosition.y * -8
  }deg) rotateY(${mousePosition.x * 12}deg)`;

  const cardTransform = `translate(${mousePosition.x * -8}px, ${mousePosition.y * -6}px)`;

  return (
    <div className="login-page" onMouseMove={handleMouseMove}>
      <div
        className="login-glow"
        style={{
          transform: `translate(${mousePosition.x * 40}px, ${mousePosition.y * 28}px)`,
        }}
      />

      <section className="login-scene">
        <div className="login-copy">
          <span className="login-kicker">Sistema de Gestion de Biblioteca</span>
          <h1>Organiza prestamos, lectores y catalogos desde un solo lugar.</h1>
          <p>
            Una entrada visual inspirada en estanterias, cubiertas y salas de lectura para
            que el acceso al sistema se sienta tan cuidado como tu biblioteca.
          </p>

          <div className="login-metrics">
            <div>
              <strong>24/7</strong>
              <span>Control disponible</span>
            </div>
            <div>
              <strong>+1200</strong>
              <span>Historias listas</span>
            </div>
            <div>
              <strong>100%</strong>
              <span>Orden editorial</span>
            </div>
          </div>
        </div>

        <div className="login-visual">
          <div className="reading-room">
            <div className="room-arch"></div>
            <div className="room-lamp"></div>

            {shelfBooks.map((shelf, shelfIndex) => (
              <div className={`shelf-row shelf-row-${shelfIndex + 1}`} key={shelfIndex}>
                {shelf.map((variant, bookIndex) => (
                  <span
                    key={`${shelfIndex}-${bookIndex}`}
                    className={`shelf-book ${variant}`}
                  ></span>
                ))}
              </div>
            ))}

            <div className="floating-book" style={{ transform: bookTransform }}>
              <img src={heroImage} alt="Libro flotante" />
            </div>

            <div className="scene-card scene-card-top" style={{ transform: cardTransform }}>
              <span>Catalogo inteligente</span>
            </div>
            <div className="scene-card scene-card-bottom">
              <span>Prestamos en movimiento</span>
            </div>
          </div>
        </div>
      </section>

      <aside className="login-panel">
        <div className="login-card">
          <span className="card-badge">Acceso del equipo</span>
          <h2>Iniciar sesion</h2>
          <p className="card-copy">
            Ingresa para administrar libros, clientes, reservas, multas y prestamos.
          </p>
          

          <form onSubmit={handleSubmit} className="login-form">
            <label className="login-field">
              <span>Usuario</span>
              <input
                className="login-input"
                type="text"
                placeholder="Tu usuario"
                name="username"
                value={form.username}
                onChange={handleChange}
              />
            </label>

            <label className="login-field">
              <span>Contrasena</span>
              <div className="password-shell">
                <input
                  className="login-input"
                  type={showPassword ? "text" : "password"}
                  placeholder="Tu contrasena"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Ocultar" : "Mostrar"}
                </button>
              </div>
            </label>

            <button type="submit" className="login-btn">
              Entrar al sistema
            </button>
          </form>

          <div className="card-footer">
            <span>Nuevo en la plataforma</span>
            <Link to="/register">Crear una cuenta</Link>
          </div>
        </div>
      </aside>
    </div>
  );
}

export default Login;
