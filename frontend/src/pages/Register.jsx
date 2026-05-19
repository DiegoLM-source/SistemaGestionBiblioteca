import { useState } from "react";
import { registerRequest } from "../services/authService";
import { useNavigate, Link } from "react-router-dom";
import heroImage from "../assets/hero.png";
import "../styles/login.css";

function Register() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    username: "",
    password: "",
    nombre: "",
    correo: "",
    telefono: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password || !form.nombre || !form.correo) {
      alert("Usuario, contraseña, nombre y correo son obligatorios");
      return;
    }
    if (form.password.length < 6) {
      alert("La contraseña debe tener mínimo 6 caracteres");
      return;
    }
    try {
      const res = await registerRequest(form);
      localStorage.setItem("token", res.data.token);
      alert("Usuario registrado");
      navigate("/dashboard", { replace: true });
    } catch (error) {
      alert(error.response?.data?.message || "Error en registro");
    }
  };

  return (
    <div className="login-page register-page">
      <div className="login-glow register-glow" />

      <section className="login-scene register-scene">
        <div className="login-copy register-copy">
          <span className="login-kicker">Nuevo acceso editorial</span>
          <h1>Crea una cuenta y abre la puerta del archivo central.</h1>
          <p>Registrate para poder ser parte de nuestra biblioteca y tener la facilidad de reservar tus libros desde la comodidad de tu hogar</p>
          <div className="register-highlights">
            <div className="register-note">
              <strong>Roles claros</strong>
              <span>Acceso listo para operar desde el primer ingreso.</span>
            </div>
            <div className="register-note">
              <strong>Control rapido</strong>
              <span>Usuarios nuevos en segundos, sin salir del flujo de trabajo.</span>
            </div>
          </div>
        </div>

        <div className="register-visual">
          <div className="register-display">
            <div className="register-display-ring"></div>
            <div className="register-book-stack">
              <span className="stack-book stack-book-top"></span>
              <span className="stack-book stack-book-mid"></span>
              <span className="stack-book stack-book-bottom"></span>
            </div>
            <div className="register-hero-card">
              <img src={heroImage} alt="Libro de registro" />
            </div>
            <div className="register-chip chip-one">Lectores</div>
            <div className="register-chip chip-two">Catalogo</div>
            <div className="register-chip chip-three">Prestamos</div>
          </div>
        </div>
      </section>

      <aside className="login-panel">
        <div className="login-card register-card">
          <span className="card-badge">Alta de usuario</span>
          <h2>Registrarse</h2>
          <p className="card-copy">
            Crea una credencial para empezar a gestionar la biblioteca desde dentro.
          </p>

          <form onSubmit={handleSubmit} className="login-form">

            <label className="login-field">
              <span>Usuario</span>
              <input className="login-input" type="text" name="username"
                placeholder="Nombre de usuario" value={form.username} onChange={handleChange} />
            </label>

            <label className="login-field">
              <span>Contraseña</span>
              <div className="password-shell">
                <input className="login-input" name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Mínimo 6 caracteres"
                  value={form.password} onChange={handleChange} />
                <button type="button" className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? "Ocultar" : "Mostrar"}
                </button>
              </div>
            </label>

            <label className="login-field">
              <span>Nombre completo</span>
              <input className="login-input" type="text" name="nombre"
                placeholder="Tu nombre completo" value={form.nombre} onChange={handleChange} />
            </label>

            <label className="login-field">
              <span>Correo</span>
              <input className="login-input" type="email" name="correo"
                placeholder="tu@correo.com" value={form.correo} onChange={handleChange} />
            </label>

            <label className="login-field">
              <span>Teléfono (opcional)</span>
              <input className="login-input" type="text" name="telefono"
                placeholder="Tu número de teléfono" value={form.telefono} onChange={handleChange} />
            </label>

            <button type="submit" className="login-btn">Crear cuenta</button>
          </form>

          <div className="card-footer">
            <span>Ya tienes una cuenta</span>
            <Link to="/">Inicia sesion</Link>
          </div>
        </div>
      </aside>
    </div>
  );
}

export default Register;