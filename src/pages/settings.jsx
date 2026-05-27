import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ChatHeader from "../components/ChatHeader";
import { AVATARS } from "../constants/avatars";
import {
  getCurrentUser,
  getStoredUser,
  updateProfile,
} from "../services/authService";

const GRADOS = [
  "1° Primaria",
  "2° Primaria",
  "3° Primaria",
  "4° Primaria",
  "5° Primaria",
  "6° Primaria",
  "1° Secundaria",
  "2° Secundaria",
  "3° Secundaria",
];

export default function SettingsPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(getStoredUser());
  const [form, setForm] = useState({ nombre: "", grado: "", avatar: "a" });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  useEffect(() => {
    async function hydrateUser() {
      if (!user?.id) {
        navigate("/login");
        return;
      }

      try {
        const fresh = await getCurrentUser();
        setUser(fresh);
        setForm({
          nombre: fresh?.nombre || "",
          grado: fresh?.grado || "",
          avatar: fresh?.avatar || "a",
        });
      } catch {
        navigate("/login");
      }
    }

    hydrateUser();
  }, [navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: "", message: "" });

    try {
      const updated = await updateProfile(form);
      setUser(updated);
      setStatus({ type: "success", message: "Preferencias actualizadas." });
    } catch (error) {
      setStatus({
        type: "error",
        message: error?.message || "No se pudo actualizar el perfil.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#fbf7f0" }}>
      <ChatHeader user={user} />
      <main style={{ maxWidth: 720, margin: "40px auto", padding: "0 16px" }}>
        <section
          style={{
            background: "#fff",
            borderRadius: 22,
            border: "1px solid #ead9c7",
            boxShadow: "0 12px 30px rgba(70, 40, 20, 0.08)",
            padding: 28,
          }}
        >
          <h1 style={{ marginTop: 0, color: "#5b3218" }}>Configuración</h1>
          <p style={{ color: "#7d5b45" }}>
            Actualiza tu nombre, grado y avatar.
          </p>

          <form onSubmit={handleSubmit}>
            <label
              style={{
                display: "block",
                marginBottom: 8,
                fontWeight: 700,
                color: "#5b3218",
              }}
            >
              Nombre
            </label>
            <input
              value={form.nombre}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, nombre: e.target.value }))
              }
              style={{
                width: "100%",
                border: "1px solid #d9c3af",
                borderRadius: 14,
                padding: "12px 14px",
                marginBottom: 16,
                boxSizing: "border-box",
              }}
            />

            <label
              style={{
                display: "block",
                marginBottom: 8,
                fontWeight: 700,
                color: "#5b3218",
              }}
            >
              Grado
            </label>
            <select
              value={form.grado}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, grado: e.target.value }))
              }
              style={{
                width: "100%",
                border: "1px solid #d9c3af",
                borderRadius: 14,
                padding: "12px 14px",
                marginBottom: 16,
                boxSizing: "border-box",
              }}
            >
              <option value="">Selecciona grado</option>
              {GRADOS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>

            <label
              style={{
                display: "block",
                marginBottom: 8,
                fontWeight: 700,
                color: "#5b3218",
              }}
            >
              Avatar
            </label>
            <div
              style={{
                display: "flex",
                gap: 12,
                flexWrap: "wrap",
                marginBottom: 16,
              }}
            >
              {AVATARS.map((av) => {
                const selected = form.avatar === av.id;
                return (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({ ...prev, avatar: av.id }))
                    }
                    style={{
                      width: 54,
                      height: 54,
                      borderRadius: "50%",
                      border: selected
                        ? "3px solid #6b3f1e"
                        : "2px solid #e8dcc8",
                      background: av.bg,
                      fontSize: 24,
                      cursor: "pointer",
                    }}
                    aria-label={`Seleccionar avatar ${av.id}`}
                  >
                    {av.emoji}
                  </button>
                );
              })}
            </div>

            {status.message ? (
              <div
                style={{
                  marginBottom: 12,
                  padding: "10px 12px",
                  borderRadius: 12,
                  background: status.type === "error" ? "#fdecec" : "#e8f7ed",
                  color: status.type === "error" ? "#a3302d" : "#16794c",
                  fontWeight: 700,
                }}
              >
                {status.message}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              style={{
                border: "none",
                borderRadius: 999,
                padding: "12px 20px",
                background: "#6b3f1e",
                color: "#fff",
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              {loading ? "Guardando..." : "Guardar cambios"}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}
