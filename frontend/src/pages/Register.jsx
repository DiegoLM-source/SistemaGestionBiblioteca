import { useState } from "react";
import { registerRequest } from "../services/authService";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import "../styles/login.css";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    password: "",
    fk_rol: 1,
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await registerRequest(form);

      console.log(res.data);

      localStorage.setItem("token", res.data.token);

      alert("Usuario registrado");

      navigate("/dashboard");

    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Error en registro");
    }
  };

  const [showPassword, setShowPassword] = useState(false);

  return (
    <div>

      <form onSubmit={handleSubmit}>

        <h2>Registrarse</h2>

        <div className="username-container">
          <input
            type="text"
            name="username"
            placeholder="Usuario"
            onChange={handleChange}
          />
        </div>

        <div className="password-container">
            <input
                type={showPassword ? "text" : "password"}
                placeholder="Contraseña"
            />
            <span
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
            >
                {showPassword ? <AiFillEyeInvisible /> : <AiFillEye />}
            </span>
        </div>

        <button type="submit">Registrarse</button>
        <p>¿Ya tienes cuenta? <Link to="/">Inicia sesión</Link></p>
      </form>
    </div>
  );
}

export default Register;