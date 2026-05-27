import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  registerUser,
  getTeachersByInstitution,
} from "../services/authService";
import { AVATARS } from "../constants/avatars";

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

export default function RegistrationForm({ role }) {
  const navigate = useNavigate();
  const isTeacher = role === "teacher";
  const [form, setForm] = useState({
    nombre: "",
    apellidoPaterno: "",
    apellidoMaterno: "",
    edad: "",
    grado: "",
    institution: "",
    teacherId: "",
    correo: "",
    telefono: "",
    usuario: "",
    contrasena: "",
    avatar: "",
  });
  const [teachers, setTeachers] = useState([]);
  const [loadingTeachers, setLoadingTeachers] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadTeachers() {
      const institution = form.institution.trim();
      if (isTeacher || institution.length < 3) {
        setTeachers([]);
        return;
      }

      setLoadingTeachers(true);
      try {
        const data = await getTeachersByInstitution(institution);
        if (!cancelled) {
          setTeachers(Array.isArray(data) ? data : []);
        }
      } catch {
        if (!cancelled) {
          setTeachers([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingTeachers(false);
        }
      }
    }

    const timer = setTimeout(loadTeachers, 350);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [form.institution, isTeacher]);

  const title = useMemo(
    () => (isTeacher ? "Registro de profesor" : "Registro de estudiante"),
    [isTeacher],
  );

  const subtitle = useMemo(
    () =>
      isTeacher
        ? "Crea tu cuenta como profesor y administra a tus estudiantes"
        : "Crea tu cuenta como estudiante y elige a tu profesor dentro de tu institución",
    [isTeacher],
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: "", message: "" });

    try {
      if (!form.nombre.trim()) {
        setStatus({
          type: "error",
          message: "Debes ingresar tu nombre.",
        });
        setLoading(false);
        return;
      }

      if (!form.institution.trim()) {
        setStatus({
          type: "error",
          message: "Debes ingresar tu institución.",
        });
        setLoading(false);
        return;
      }

      if (!form.correo.trim()) {
        setStatus({
          type: "error",
          message: "Debes ingresar tu correo electrónico.",
        });
        setLoading(false);
        return;
      }

      if (!form.usuario.trim()) {
        setStatus({
          type: "error",
          message: "Debes ingresar tu usuario.",
        });
        setLoading(false);
        return;
      }

      if (!form.contrasena.trim() || form.contrasena.trim().length < 6) {
        setStatus({
          type: "error",
          message: "La contraseña debe tener al menos 6 caracteres.",
        });
        setLoading(false);
        return;
      }

      if (!isTeacher && !form.teacherId) {
        setStatus({
          type: "error",
          message: "Debes elegir un profesor de tu institución.",
        });
        setLoading(false);
        return;
      }

      if (!isTeacher && !form.edad) {
        setStatus({
          type: "error",
          message: "Debes ingresar tu edad.",
        });
        setLoading(false);
        return;
      }

      if (!isTeacher && !form.grado) {
        setStatus({
          type: "error",
          message: "Debes seleccionar tu grado escolar.",
        });
        setLoading(false);
        return;
      }

      const payload = {
        ...form,
        apellidoPaterno: isTeacher
          ? form.apellidoPaterno?.trim() ||
            `${form.nombre?.trim() || "Profesor"}`
          : form.apellidoPaterno,
        apellidoMaterno: isTeacher
          ? form.apellidoMaterno?.trim() || "Adulto"
          : form.apellidoMaterno,
        edad: isTeacher ? 30 : Number(form.edad),
        grado: isTeacher ? "Profesor" : form.grado,
        role: isTeacher ? "ROLE_TEACHER" : "ROLE_STUDENT",
        teacherId: isTeacher ? null : Number(form.teacherId),
      };

      await registerUser(payload);
      setStatus({
        type: "success",
        message: isTeacher
          ? "Cuenta de profesor creada. Ya puedes entrar al dashboard."
          : "Cuenta de estudiante creada. Ya puedes entrar a MathBot.",
      });
      navigate(isTeacher ? "/dashboard" : "/chat");
    } catch (error) {
      setStatus({
        type: "error",
        message: error?.message || "No se pudo registrar el usuario.",
      });
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    page: {
      fontFamily: "'Nunito', sans-serif",
      backgroundColor: "#f5f0e8",
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "flex-start",
      padding: "40px 16px",
    },
    card: {
      background: "#faf7f2",
      borderRadius: 24,
      padding: "40px 48px",
      width: "100%",
      maxWidth: 560,
      boxShadow: "0 4px 30px rgba(100,70,40,0.08)",
    },
    h1: {
      fontFamily: "'Fredoka One', cursive",
      color: "#6b3f1e",
      fontSize: "2.2rem",
      textAlign: "center",
      marginBottom: 6,
      letterSpacing: 1,
    },
    subtitle: {
      textAlign: "center",
      color: "#6b3f1e",
      fontWeight: 700,
      fontSize: "1rem",
      marginBottom: 28,
    },
    field: { marginBottom: 14 },
    label: {
      display: "block",
      fontSize: "0.78rem",
      fontWeight: 700,
      color: "#5a3b1e",
      marginBottom: 4,
    },
    input: {
      width: "100%",
      padding: "10px 14px",
      border: "1.5px solid #d4c4ae",
      borderRadius: 50,
      background: "white",
      fontFamily: "'Nunito', sans-serif",
      fontSize: "0.9rem",
      color: "#555",
      outline: "none",
      boxSizing: "border-box",
    },
    select: {
      width: "100%",
      padding: "10px 14px",
      border: "1.5px solid #d4c4ae",
      borderRadius: 50,
      background: "white",
      fontFamily: "'Nunito', sans-serif",
      fontSize: "0.9rem",
      color: "#888",
      outline: "none",
      appearance: "none",
      boxSizing: "border-box",
    },
    grid2: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 12,
    },
    phoneWrapper: { position: "relative" },
    optional: {
      position: "absolute",
      right: 16,
      top: "50%",
      transform: "translateY(-50%)",
      fontSize: "0.75rem",
      color: "#aaa",
      pointerEvents: "none",
    },
    avatars: {
      display: "flex",
      justifyContent: "center",
      gap: 12,
      margin: "20px 0 10px",
      flexWrap: "wrap",
    },
    avatarLabel: { textAlign: "center", cursor: "pointer" },
    avatarText: {
      fontSize: "0.72rem",
      color: "#888",
      marginTop: 4,
    },
    btn: {
      display: "block",
      width: "60%",
      margin: "24px auto 0",
      padding: "14px",
      background: "#6b3f1e",
      color: "white",
      fontFamily: "'Nunito', sans-serif",
      fontWeight: 700,
      fontSize: "1rem",
      border: "none",
      borderRadius: 50,
      cursor: "pointer",
    },
    status: {
      marginTop: 16,
      padding: "12px 14px",
      borderRadius: 16,
      textAlign: "center",
      fontSize: "0.92rem",
      fontWeight: 700,
      display: "none",
    },
    helper: {
      fontSize: 12,
      color: "#7d6a58",
      marginTop: 6,
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.h1}>MathBot</h1>
        <p style={styles.subtitle}>{subtitle}</p>

        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label style={styles.label}>Nombre(s)</label>
            <input
              style={styles.input}
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              placeholder="Ingresa tu nombre"
              required
            />
          </div>

          {isTeacher ? null : (
            <>
              <div style={styles.grid2}>
                <div style={styles.field}>
                  <label style={styles.label}>Apellido Paterno</label>
                  <input
                    style={styles.input}
                    name="apellidoPaterno"
                    value={form.apellidoPaterno}
                    onChange={handleChange}
                    placeholder="Apellido paterno"
                    required={!isTeacher}
                  />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Apellido Materno</label>
                  <input
                    style={styles.input}
                    name="apellidoMaterno"
                    value={form.apellidoMaterno}
                    onChange={handleChange}
                    placeholder="Apellido materno"
                    required={!isTeacher}
                  />
                </div>
              </div>

              <div style={styles.grid2}>
                <div style={styles.field}>
                  <label style={styles.label}>Edad</label>
                  <input
                    style={styles.input}
                    type="number"
                    name="edad"
                    value={form.edad}
                    onChange={handleChange}
                    placeholder="Edad"
                    min={5}
                    max={99}
                    required={!isTeacher}
                  />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Grado escolar</label>
                  <div style={{ position: "relative" }}>
                    <select
                      style={styles.select}
                      name="grado"
                      value={form.grado}
                      onChange={handleChange}
                      required={!isTeacher}
                    >
                      <option value="" disabled>
                        Selecciona tu grado escolar
                      </option>
                      {GRADOS.map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                    <span
                      style={{
                        position: "absolute",
                        right: 16,
                        top: "50%",
                        transform: "translateY(-50%)",
                        pointerEvents: "none",
                        color: "#888",
                      }}
                    >
                      ▾
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}

          {isTeacher ? (
            <div style={styles.helper}>
              Solo necesitamos tus datos básicos de adulto para crear tu cuenta.
            </div>
          ) : null}

          <div style={styles.field}>
            <label style={styles.label}>Institución</label>
            <input
              style={styles.input}
              name="institution"
              value={form.institution}
              onChange={handleChange}
              placeholder="Nombre de la escuela o institución"
              required
            />
          </div>

          {!isTeacher ? (
            <div style={styles.field}>
              <label style={styles.label}>Tu profesor</label>
              <select
                style={styles.select}
                name="teacherId"
                value={form.teacherId}
                onChange={handleChange}
                disabled={!form.institution.trim() || loadingTeachers}
              >
                <option value="">
                  {loadingTeachers
                    ? "Buscando profesores..."
                    : "Selecciona a tu profesor"}
                </option>
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.nombre} (@{teacher.usuario})
                  </option>
                ))}
              </select>
              <div style={styles.helper}>
                Escribe tu institución para ver los profesores disponibles.
              </div>
            </div>
          ) : (
            <div style={styles.helper}>
              El registro de profesor solicita menos datos porque es una cuenta
              de adulto.
            </div>
          )}

          <div style={styles.field}>
            <label style={styles.label}>Correo electrónico</label>
            <input
              style={styles.input}
              type="email"
              name="correo"
              value={form.correo}
              onChange={handleChange}
              placeholder="Ingresa tu correo electrónico"
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Teléfono</label>
            <div style={styles.phoneWrapper}>
              <input
                style={{ ...styles.input, paddingRight: 90 }}
                type="tel"
                name="telefono"
                value={form.telefono}
                onChange={handleChange}
                placeholder="Ingresa tu teléfono"
              />
              <span style={styles.optional}>(opcional)</span>
            </div>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Usuario</label>
            <input
              style={styles.input}
              name="usuario"
              value={form.usuario}
              onChange={handleChange}
              placeholder="Ingresa tu usuario"
              required
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
              required
              minLength={6}
            />
          </div>

          <div style={styles.avatars}>
            {AVATARS.map((av) => {
              const selected = form.avatar === av.id;
              return (
                <div
                  key={av.id}
                  style={styles.avatarLabel}
                  onClick={() =>
                    setForm((prev) => ({ ...prev, avatar: av.id }))
                  }
                >
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: "50%",
                      backgroundColor: av.bg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.7rem",
                      border: selected
                        ? "3px solid #6b3f1e"
                        : "3px solid transparent",
                      transform: selected ? "scale(1.12)" : "scale(1)",
                      transition: "border-color 0.2s, transform 0.15s",
                      cursor: "pointer",
                    }}
                  >
                    {av.emoji}
                  </div>
                  <div style={styles.avatarText}>{av.id}</div>
                </div>
              );
            })}
          </div>

          {status.message ? (
            <div
              style={{
                ...styles.status,
                display: "block",
                backgroundColor:
                  status.type === "success" ? "#e8f7ed" : "#fdecec",
                color: status.type === "success" ? "#16794c" : "#a3302d",
                border:
                  status.type === "success"
                    ? "1px solid #bfe8cf"
                    : "1px solid #f2b8b5",
              }}
            >
              {status.message}
            </div>
          ) : null}

          <button style={styles.btn} type="submit" disabled={loading}>
            {loading
              ? isTeacher
                ? "Creando profesor..."
                : "Creando cuenta..."
              : isTeacher
                ? "Crear profesor"
                : "Crear mi cuenta"}
          </button>
        </form>
      </div>
    </div>
  );
}
