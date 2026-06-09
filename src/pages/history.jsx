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

function MessageBubble({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div
      className={`${styles.messageRow} ${isUser ? styles.messageRowUser : styles.messageRowAssistant}`}
    >
      <div
        className={`${styles.messageBubble} ${isUser ? styles.messageBubbleUser : styles.messageBubbleAssistant}`}
      >
        {msg.imageUrl ? (
          <img
            src={msg.imageUrl}
            alt="Ejercicio"
            className={styles.messageImage}
          />
        ) : null}
        <p className={styles.messageText}>{msg.content}</p>
      </div>
    </div>
  );
}

export default function HistoryPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const user = getStoredUser();
  const isTeacher = (user?.role || "").toUpperCase() === "ROLE_TEACHER";
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [conversation, setConversation] = useState(null);
  const [loadingConversation, setLoadingConversation] = useState(false);
  const selectedStudentId = Number(searchParams.get("studentId"));
  const selectedConversationId = Number(searchParams.get("conversationId"));
  const effectiveUserId =
    isTeacher && selectedStudentId ? selectedStudentId : user?.id;

  useEffect(() => {
    if (!user?.id) {
      navigate("/login");
      return;
    }

    if (isTeacher && !selectedStudentId) {
      navigate("/dashboard");
      return;
    }

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
  }, [navigate, effectiveUserId, user?.id, isTeacher, selectedStudentId]);

  useEffect(() => {
    if (!selectedConversationId || !effectiveUserId) {
      setConversation(null);
      return;
    }

    async function loadConversation() {
      setLoadingConversation(true);
      try {
        const res = await chatService.getConversation(
          effectiveUserId,
          selectedConversationId,
        );
        setConversation(res?.conversation || null);
      } catch {
        setConversation(null);
      } finally {
        setLoadingConversation(false);
      }
    }

    loadConversation();
  }, [selectedConversationId, effectiveUserId]);

  const title = useMemo(() => {
    if (isTeacher && selectedStudentId) {
      return "Historial del alumno";
    }
    if (!user?.nombre && !user?.usuario) return "Historial";
    return `Historial de ${user.nombre || user.usuario}`;
  }, [selectedStudentId, user?.nombre, user?.usuario, isTeacher]);

  function openConversation(conversationId) {
    const params = new URLSearchParams(searchParams);
    params.set("conversationId", String(conversationId));
    setSearchParams(params);
  }

  function closeConversation() {
    const params = new URLSearchParams(searchParams);
    params.delete("conversationId");
    setSearchParams(params);
  }

  const navItems = isTeacher
    ? ["Dashboard", "Historial", "Configuración"]
    : ["Inicio", "Historial", "Configuración"];

  return (
    <div className={styles.page}>
      <ChatHeader user={user} navItems={navItems} />

      <main className={styles.main}>
        <div className={styles.headingRow}>
          <div>
            <h1 className={styles.title}>{title}</h1>
            {isTeacher ? (
              <button
                className={styles.backBtn}
                type="button"
                onClick={() => navigate("/dashboard")}
              >
                ← Volver al dashboard
              </button>
            ) : null}
          </div>
          {!isTeacher ? (
            <button className={styles.newBtn} onClick={() => navigate("/chat")}>
              Nueva consulta
            </button>
          ) : null}
        </div>

        {selectedConversationId ? (
          <section className={styles.detailPanel}>
            <div className={styles.detailHeader}>
              <h2 className={styles.detailTitle}>
                {conversation?.title || "Conversación"}
              </h2>
              <button
                className={styles.backBtn}
                type="button"
                onClick={closeConversation}
              >
                ← Volver al listado
              </button>
            </div>
            {loadingConversation ? (
              <p className={styles.stateText}>Cargando conversación...</p>
            ) : conversation?.messages?.length ? (
              <div className={styles.messages}>
                {conversation.messages.map((msg, index) => (
                  <MessageBubble key={index} msg={msg} />
                ))}
              </div>
            ) : (
              <p className={styles.stateText}>
                No se encontraron mensajes en esta conversación.
              </p>
            )}
          </section>
        ) : loading ? (
          <p className={styles.stateText}>Cargando conversaciones...</p>
        ) : items.length === 0 ? (
          <p className={styles.stateText}>
            Aún no hay conversaciones guardadas.
          </p>
        ) : (
          <section className={styles.list}>
            {items.map((item) => (
              <button
                key={item.id}
                className={styles.row}
                type="button"
                onClick={() => {
                  if (isTeacher) {
                    openConversation(item.id);
                    return;
                  }
                  navigate(`/chat?conversationId=${item.id}`);
                }}
              >
                <div>
                  <p className={styles.rowTitle}>
                    {item.title || "Conversación"}
                  </p>
                  <p className={styles.rowDate}>
                    {formatDate(item.updated_at || item.created_at)}
                  </p>
                </div>
                <span className={styles.openText}>
                  {isTeacher ? "Ver" : "Abrir"}
                </span>
              </button>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}
