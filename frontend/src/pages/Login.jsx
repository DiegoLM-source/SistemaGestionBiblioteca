import { useState } from "react";
import { loginRequest } from "../services/authService";
import { useNavigate, Link } from "react-router-dom";
import "../styles/login.css";

function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ username: "", password: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Datos enviados:", form);
    try {
      const res = await loginRequest(form);
      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
    } catch (error) {
      alert(error.response?.data?.message || "Error en login");
    }
  };

  return (
    <div className="login-page">
      <div className="login-left"></div>

      <div className="login-right">
        <div className="login-card">
          <h2>Iniciar sesión</h2>

          <form onSubmit={handleSubmit}>
            <input
              className="login-input"
              type="text"
              placeholder="Usuario"
              name="username"
              value={form.username}
              onChange={handleChange}
            />
            <input
              className="login-input"
              type={showPassword ? "text" : "password"}
              placeholder="Contraseña"
              name="password"
              value={form.password}
              onChange={handleChange}
            />

            <button type="submit" className="login-btn">
              Ingresar
            </button>
          </form>

          <div className="login-divider">
            <div className="login-divider-line"></div>
            <span>o</span>
            <div className="login-divider-line"></div>
          </div>

          {/* type="button" evita que haga submit del form */}
          <button type="button" className="login-google">
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google"
              width={18}
            />
            Continuar con Google
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;