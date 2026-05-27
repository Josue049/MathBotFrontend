import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import ChatHeader from "../components/ChatHeader";
import chatService from "../services/chatService";
import { getStoredUser } from "../services/authService";
import styles from "./history.module.css";

function formatDate(isoDate) {
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function HistoryPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const user = getStoredUser();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const selectedStudentId = Number(searchParams.get("studentId"));
  const effectiveUserId =
    user?.role === "ROLE_TEACHER" && selectedStudentId
      ? selectedStudentId
      : user?.id;

  useEffect(() => {
    if (!effectiveUserId) {
      navigate("/login");
      return;
    }

    async function loadAllHistory() {
      setLoading(true);
      try {
        const res = await chatService.getHistory(effectiveUserId, 100);
        setItems(res?.items || []);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    }

    loadAllHistory();
  }, [navigate, effectiveUserId]);

  const title = useMemo(() => {
    if (user?.role === "ROLE_TEACHER" && selectedStudentId) {
      return "Historial del alumno";
    }
    if (!user?.nombre && !user?.usuario) return "Historial";
    return `Historial de ${user.nombre || user.usuario}`;
  }, [selectedStudentId, user?.nombre, user?.usuario, user?.role]);

  return (
    <div className={styles.page}>
      <ChatHeader user={user} />

      <main className={styles.main}>
        <div className={styles.headingRow}>
          <h1 className={styles.title}>{title}</h1>
          <button className={styles.newBtn} onClick={() => navigate("/chat")}>
            Nueva consulta
          </button>
        </div>

        {loading ? (
          <p className={styles.stateText}>Cargando conversaciones...</p>
        ) : items.length === 0 ? (
          <p className={styles.stateText}>
            Aún no tienes conversaciones guardadas.
          </p>
        ) : (
          <section className={styles.list}>
            {items.map((item) => (
              <button
                key={item.id}
                className={styles.row}
                onClick={() => navigate(`/chat?conversationId=${item.id}`)}
              >
                <div>
                  <p className={styles.rowTitle}>
                    {item.title || "Conversación"}
                  </p>
                  <p className={styles.rowDate}>
                    {formatDate(item.updated_at || item.created_at)}
                  </p>
                </div>
                <span className={styles.openText}>Abrir</span>
              </button>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}
