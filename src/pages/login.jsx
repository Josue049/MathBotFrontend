import { useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { loginUser } from "../services/authService";

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const role = searchParams.get("role") || "student";
  const [form, setForm] = useState({ identifier: "", contrasena: "" });
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: "", message: "" });

    try {
      const result = await loginUser(form);
      const currentRole = (result?.user?.role || "").toUpperCase();

      if (currentRole === "ROLE_TEACHER") {
        navigate("/dashboard");
        return;
      }

      if (role === "teacher" && currentRole !== "ROLE_TEACHER") {
        setStatus({
          type: "error",
          message:
            "Esta cuenta no es de profesor. Usa el acceso de estudiante.",
        });
        return;
      }

      navigate("/chat");
    } catch (error) {
      setStatus({
        type: "error",
        message: error?.message || "No se pudo iniciar sesión.",
      });
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    page: {
      minHeight: "100vh",
      display: "grid",
      placeItems: "center",
      background: "linear-gradient(135deg, #f6efe6 0%, #efe2d3 100%)",
      fontFamily: "'Nunito', sans-serif",
      padding: 16,
    },
    card: {
      width: "100%",
      maxWidth: 420,
      background: "#fffaf5",
      borderRadius: 24,
      padding: 32,
      boxShadow: "0 18px 50px rgba(84, 48, 20, 0.12)",
      border: "1px solid #ead9c7",
    },
    title: {
      margin: 0,
      fontFamily: "'Georgia', serif",
      color: "#5b3218",
      fontSize: 32,
      textAlign: "center",
    },
    subtitle: {
      textAlign: "center",
      color: "#7d5b45",
      marginTop: 8,
      marginBottom: 24,
    },
    field: { marginBottom: 14 },
    label: {
      display: "block",
      marginBottom: 6,
      color: "#5b3218",
      fontWeight: 700,
    },
    input: {
      width: "100%",
      border: "1px solid #d9c3af",
      borderRadius: 14,
      padding: "12px 14px",
      fontSize: 15,
      boxSizing: "border-box",
      outline: "none",
      background: "#fff",
    },
    button: {
      width: "100%",
      marginTop: 12,
      border: "none",
      borderRadius: 999,
      padding: "14px 18px",
      background: "#6b3f1e",
      color: "#fff",
      fontWeight: 800,
      cursor: "pointer",
    },
    status: {
      marginTop: 12,
      padding: "10px 12px",
      borderRadius: 12,
      fontWeight: 700,
      textAlign: "center",
    },
    footer: {
      marginTop: 14,
      textAlign: "center",
      color: "#7d5b45",
      fontSize: 14,
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>MathBot</h1>
        <p style={styles.subtitle}>
          {role === "teacher" ? "Acceso de profesor" : "Acceso de estudiante"}
        </p>

        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label style={styles.label}>Usuario o correo</label>
            <input
              style={styles.input}
              name="identifier"
              value={form.identifier}
              onChange={handleChange}
              placeholder="Ingresa tu usuario o correo"
              autoComplete="username"
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Contraseña</label>
            <input
              style={styles.input}
              type="password"
              name="contrasena"
              value={form.contrasena}
              onChange={handleChange}
              placeholder="Ingresa tu contraseña"
              autoComplete="current-password"
            />
          </div>

          {status.message ? (
            <div
              style={{
                ...styles.status,
                background: status.type === "error" ? "#fdecec" : "#e8f7ed",
                color: status.type === "error" ? "#a3302d" : "#16794c",
              }}
            >
              {status.message}
            </div>
          ) : null}

          <button style={styles.button} disabled={loading} type="submit">
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <div style={styles.footer}>
          ¿No tienes cuenta?{" "}
          <Link to={role === "teacher" ? "/register-teacher" : "/register"}>
            Regístrate
          </Link>
        </div>
      </div>
    </div>
  );
}
