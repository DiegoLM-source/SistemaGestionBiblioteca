import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

function GoogleAuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    const error = searchParams.get("error");

    if (token) {
      localStorage.setItem("token", token);
      navigate("/dashboard", { replace: true });
      return;
    }

    const message = error ? "No se pudo iniciar con Google." : "Respuesta OAuth inválida.";
    alert(message);
    navigate("/", { replace: true });
  }, [navigate, searchParams]);

  return <p>Validando inicio de sesión con Google...</p>;
}

export default GoogleAuthCallback;
