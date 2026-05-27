import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ChatHeader from "../components/ChatHeader";
import { getStoredUser, getTeacherDashboard } from "../services/authService";
import { getAvatarById } from "../constants/avatars";

function formatDate(value) {
  if (!value) return "Sin actividad";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Sin actividad";
  return date.toLocaleString("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getRoleName(role) {
  if (!role) return "";
  if (role === "ROLE_TEACHER") return "Profesor";
  return "Estudiante";
}

export default function Dashboard() {
  const navigate = useNavigate();
  const currentUser = getStoredUser();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!currentUser?.id) {
      navigate("/access?intent=login");
      return;
    }

    const role = (currentUser.role || "").toUpperCase();
    if (role !== "ROLE_TEACHER") {
      navigate("/chat");
      return;
    }

    let cancelled = false;

    async function loadDashboard() {
      setLoading(true);
      setError("");
      try {
        const res = await getTeacherDashboard();
        if (!cancelled) {
          setData(res);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err?.message || "No se pudo cargar el dashboard del profesor.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [currentUser?.id, currentUser?.role, navigate]);

  const stats = data?.classStats;
  const students = data?.students || [];
  const gradeDistribution = useMemo(
    () => stats?.gradeDistribution || [],
    [stats],
  );

  return (
    <div style={s.shell}>
      <ChatHeader
        user={currentUser}
        navItems={["Dashboard", "Historial", "Configuración"]}
      />

      <main style={s.main}>
        <div style={s.hero}>
          <div>
            <p style={s.kicker}>Panel del profesor</p>
            <h1 style={s.title}>
              Bienvenido,{" "}
              {data?.teacher?.nombre || currentUser?.nombre || "profesor"}
            </h1>
            <p style={s.subtitle}>
              {data?.teacher?.institution ||
                currentUser?.institution ||
                "Tu institución"}{" "}
              · {getRoleName(data?.teacher?.role || currentUser?.role)}
            </p>
          </div>
          <button style={s.primaryBtn} onClick={() => navigate("/history")}>
            {/* <span>{getAvatarById(student.avatar).emoji}</span> */}
          </button>
        </div>

        {loading ? (
          <p style={s.stateText}>Cargando estadísticas...</p>
        ) : error ? (
          <div style={s.errorBox}>{error}</div>
        ) : (
          <>
            <section style={s.cardRow}>
              <StatCard
                label="Total de alumnos"
                value={stats?.totalStudents ?? 0}
                accent="#8b4a20"
              />
              <StatCard
                label="Conversaciones totales"
                value={stats?.totalConversations ?? 0}
                accent="#b36b3f"
              />
              <StatCard
                label="Alumnos activos"
                value={stats?.activeStudents ?? 0}
                accent="#6b3f1e"
              />
            </section>

            <section style={s.panel}>
              <div style={s.panelHeader}>
                <h2 style={s.panelTitle}>Distribución por grado</h2>
                <span style={s.panelTag}>
                  {gradeDistribution.length} grados
                </span>
              </div>
              <div style={s.gradeGrid}>
                {gradeDistribution.length > 0 ? (
                  gradeDistribution.map((item) => (
                    <div key={item.grade} style={s.gradeChip}>
                      <strong>{item.grade}</strong>
                      <span>{item.total} alumnos</span>
                    </div>
                  ))
                ) : (
                  <p style={s.stateText}>Todavía no hay alumnos registrados.</p>
                )}
              </div>
            </section>

            <section style={s.panel}>
              <div style={s.panelHeader}>
                <h2 style={s.panelTitle}>Alumnos registrados</h2>
                <span style={s.panelTag}>{students.length} estudiantes</span>
              </div>
              <div style={s.studentGrid}>
                {students.length > 0 ? (
                  students.map((student) => (
                    <button
                      key={student.id}
                      style={s.studentCard}
                      onClick={() =>
                        navigate(`/history?studentId=${student.id}`)
                      }
                    >
                      <div style={s.studentTopRow}>
                        <div style={s.studentAvatar}>
                          <span>
                            {student.avatar
                              ? student.avatar.slice(0, 2).toUpperCase()
                              : "MB"}
                          </span>
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={s.studentName}>{student.nombre}</p>
                          <p style={s.studentMeta}>
                            @{student.usuario} · {student.grado}
                          </p>
                        </div>
                      </div>
                      <div style={s.metricRow}>
                        <span style={s.metricLabel}>Chats</span>
                        <strong style={s.metricValue}>
                          {student.conversations ?? 0}
                        </strong>
                      </div>
                      <div style={s.metricRow}>
                        <span style={s.metricLabel}>Última actividad</span>
                        <strong style={s.metricValue}>
                          {formatDate(student.lastActivity)}
                        </strong>
                      </div>
                    </button>
                  ))
                ) : (
                  <p style={s.stateText}>
                    Todavía no tienes alumnos vinculados a tu cuenta.
                  </p>
                )}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

function StatCard({ label, value, accent }) {
  return (
    <div style={s.statCard}>
      <p style={s.statLabel}>{label}</p>
      <div style={{ ...s.statValue, color: accent }}>{value}</div>
    </div>
  );
}

const s = {
  shell: {
    minHeight: "100vh",
    background: "#faf5ef",
  },
  main: {
    maxWidth: 1200,
    margin: "0 auto",
    padding: "28px 24px 48px",
    fontFamily: "'Nunito', sans-serif",
  },
  hero: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 18,
    marginBottom: 24,
    background: "linear-gradient(135deg, #fff9f0 0%, #f5e7d8 100%)",
    border: "1px solid #ead9c7",
    borderRadius: 24,
    padding: 24,
    boxShadow: "0 16px 40px rgba(84, 48, 20, 0.08)",
  },
  kicker: {
    margin: 0,
    color: "#a16742",
    fontWeight: 800,
    letterSpacing: 1,
    textTransform: "uppercase",
    fontSize: 12,
  },
  title: {
    margin: "6px 0 8px",
    fontFamily: "Georgia, serif",
    color: "#4a2e1a",
    fontSize: 36,
  },
  subtitle: {
    margin: 0,
    color: "#7d5b45",
    fontWeight: 600,
  },
  primaryBtn: {
    border: "none",
    borderRadius: 999,
    padding: "14px 18px",
    background: "#6b3f1e",
    color: "#fff",
    fontWeight: 800,
    cursor: "pointer",
    boxShadow: "0 10px 24px rgba(107,63,30,0.18)",
  },
  cardRow: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 16,
    marginBottom: 18,
  },
  statCard: {
    background: "#fff",
    border: "1px solid #ead9c7",
    borderRadius: 20,
    padding: 18,
    boxShadow: "0 10px 24px rgba(84, 48, 20, 0.06)",
  },
  statLabel: {
    margin: 0,
    fontSize: 14,
    color: "#8b705c",
    fontWeight: 700,
  },
  statValue: {
    fontSize: 40,
    fontWeight: 900,
    marginTop: 8,
  },
  panel: {
    background: "#fff",
    border: "1px solid #ead9c7",
    borderRadius: 20,
    padding: 20,
    boxShadow: "0 10px 24px rgba(84, 48, 20, 0.06)",
    marginBottom: 18,
  },
  panelHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 16,
  },
  panelTitle: {
    margin: 0,
    fontSize: 20,
    color: "#4a2e1a",
    fontFamily: "Georgia, serif",
  },
  panelTag: {
    background: "#f5e7d8",
    color: "#7a4a2a",
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 800,
  },
  gradeGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: 12,
  },
  gradeChip: {
    background: "#faf5ef",
    border: "1px solid #ead9c7",
    borderRadius: 16,
    padding: 14,
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  studentGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 14,
  },
  studentCard: {
    border: "1px solid #ead9c7",
    background: "linear-gradient(180deg, #fffaf5 0%, #fff 100%)",
    borderRadius: 18,
    padding: 16,
    textAlign: "left",
    cursor: "pointer",
    boxShadow: "0 10px 24px rgba(84, 48, 20, 0.06)",
  },
  studentTopRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 14,
  },
  studentAvatar: {
    width: 46,
    height: 46,
    borderRadius: "50%",
    display: "grid",
    placeItems: "center",
    background: "#f5e7d8",
    color: "#6b3f1e",
    fontWeight: 900,
  },
  studentName: {
    margin: 0,
    fontSize: 16,
    color: "#4a2e1a",
    fontWeight: 800,
  },
  studentMeta: {
    margin: "4px 0 0",
    fontSize: 12,
    color: "#8b705c",
  },
  metricRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    borderTop: "1px dashed #ead9c7",
    paddingTop: 10,
    marginTop: 10,
  },
  metricLabel: {
    fontSize: 12,
    color: "#8b705c",
    fontWeight: 700,
  },
  metricValue: {
    fontSize: 12,
    color: "#4a2e1a",
    textAlign: "right",
  },
  stateText: {
    margin: 0,
    color: "#8b705c",
  },
  errorBox: {
    background: "#fdecec",
    color: "#a3302d",
    border: "1px solid #f2b8b5",
    borderRadius: 16,
    padding: 16,
    fontWeight: 700,
  },
};
