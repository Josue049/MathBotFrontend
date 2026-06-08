import styles from "./Home.module.css";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ChatHeader from "../components/ChatHeader";
import chatService from "../services/chatService";
import { getStoredUser } from "../services/authService";
import { uploadExerciseImage } from "../services/visionService";

function formatDate(isoDate) {
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function Home() {
  const navigate = useNavigate();
  const user = getStoredUser();
  const [topics, setTopics] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    async function loadHistory() {
      if (!user?.id) {
        setTopics([]);
        return;
      }

      try {
        const res = await chatService.getHistory(user.id);
        const items = (res.items || []).map((item) => ({
          id: item.id,
          title: item.title,
          date: formatDate(item.updated_at || item.created_at),
          status: "done",
        }));
        setTopics(items);
      } catch {
        setTopics([]);
      }
    }

    loadHistory();
  }, [user?.id]);

  async function handlePhotoSelected(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!user?.id) {
      navigate("/access?intent=login");
      return;
    }

    setUploading(true);
    setUploadError("");
    try {
      const res = await uploadExerciseImage({ userId: user.id, file });
      const conversationId = res?.conversationId;
      if (!res?.ok || !conversationId) {
        throw new Error(res?.reply || "No se pudo analizar la foto.");
      }
      navigate(`/chat?conversationId=${conversationId}&mode=vision`);
    } catch (err) {
      setUploadError(err?.message || "No se pudo subir la foto.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className={styles.page}>
      {/* Navbar */}
      <ChatHeader />

      {/* Main content */}
      <main className={styles.main}>
        {/* Left panel */}
        <div className={styles.leftPanel}>
          <h1 className={styles.headline}>
            ¿En qué puedo
            <br />
            ayudarte hoy?
          </h1>
          <div className={styles.buttonGroup}>
            <button
              className={styles.primaryBtn}
              onClick={() => navigate("/chat")}
            >
              Nueva consulta
            </button>
            <button
              className={styles.secondaryBtn}
              onClick={() => navigate("/history")}
            >
              Ver historial completo
            </button>
            <button
              className={styles.secondaryBtn}
              onClick={() => {
                if (!user?.id) {
                  navigate("/access?intent=login");
                  return;
                }
                fileInputRef.current?.click();
              }}
              disabled={uploading}
            >
              <CameraIcon />
              {uploading ? "Analizando foto..." : "Subir foto de ejercicio"}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              style={{ display: "none" }}
              onChange={handlePhotoSelected}
            />
          </div>
          {uploadError ? (
            <p className={styles.cardDate} style={{ color: "#a3302d", marginTop: 12 }}>
              {uploadError}
            </p>
          ) : null}
        </div>

        {/* Right panel: topic cards */}
        <div className={styles.cardGrid}>
          {topics.length > 0 ? (
            topics.map((topic) => (
              <TopicCard
                key={topic.id}
                topic={topic}
                onOpenConversation={(id) =>
                  navigate(`/chat?conversationId=${id}`)
                }
              />
            ))
          ) : (
            <p className={styles.cardDate}>
              Aún no hay conversaciones guardadas.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}

function TopicCard({ topic, onOpenConversation }) {
  return (
    <div
      className={styles.card}
      onClick={() => onOpenConversation(topic.id)}
      role="button"
      tabIndex={0}
    >
      <div className={styles.cardIcon}>
        <ChatIcon />
      </div>
      <p className={styles.cardTitle}>{topic.title}</p>
      <div className={styles.cardFooter}>
        <span className={styles.cardDate}>{topic.date}</span>
        <span
          className={`${styles.dot} ${topic.status === "done" ? styles.dotDone : styles.dotPending}`}
        />
      </div>
    </div>
  );
}

/* ── SVG icons ── */
function OwlIcon() {
  return (
    <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
      <circle cx="17" cy="17" r="17" fill="#7a4a2a" />
      <ellipse cx="13" cy="18" rx="3.5" ry="4" fill="white" />
      <ellipse cx="21" cy="18" rx="3.5" ry="4" fill="white" />
      <circle cx="13" cy="18" r="2" fill="#3d2010" />
      <circle cx="21" cy="18" r="2" fill="#3d2010" />
      <path
        d="M15 23 Q17 25 19 23"
        stroke="#c8926a"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M11 13 Q13 10 17 11 Q21 10 23 13"
        stroke="#c8926a"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

function OwlAvatar() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <circle cx="14" cy="14" r="14" fill="#f0e8dc" />
      <ellipse
        cx="10.5"
        cy="15"
        rx="3"
        ry="3.5"
        fill="white"
        stroke="#c8926a"
        strokeWidth="1"
      />
      <ellipse
        cx="17.5"
        cy="15"
        rx="3"
        ry="3.5"
        fill="white"
        stroke="#c8926a"
        strokeWidth="1"
      />
      <circle cx="10.5" cy="15" r="1.5" fill="#3d2010" />
      <circle cx="17.5" cy="15" r="1.5" fill="#3d2010" />
      <path
        d="M12 19.5 Q14 21 16 19.5"
        stroke="#c8926a"
        strokeWidth="1.2"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#9a7060"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function CameraIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#7a4a2a"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={styles.cameraIcon}
    >
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}
