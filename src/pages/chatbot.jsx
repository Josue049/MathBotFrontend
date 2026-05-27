import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import chatService from "../services/chatService";
import { getStoredUser } from "../services/authService";
import styles from "./chatbot.module.css";
import ChatHeader from "../components/ChatHeader";

const QUICK_TOPICS = [
  { label: "Suma con llevadas", msg: "¿Cómo se hace una suma con llevadas?" },
  { label: "Resta", msg: "Explícame cómo hacer una resta" },
  { label: "Tablas", msg: "¿Qué son las tablas de multiplicar?" },
  { label: "Dame un ejercicio", msg: "Dame un ejercicio de matemáticas" },
];

function formatText(text) {
  const parts = text.split(/(```[\s\S]*?```|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("```") && part.endsWith("```")) {
      const code = part.slice(3, -3).trim();
      return (
        <pre key={i} className={styles.codeBlock}>
          {code}
        </pre>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={i} className={styles.inlineCode}>
          {part.slice(1, -1)}
        </code>
      );
    }
    return part.split("\n").map((line, j, arr) => (
      <span key={`${i}-${j}`}>
        {line
          .split(/(\*\*.*?\*\*)/g)
          .map((seg, k) =>
            seg.startsWith("**") && seg.endsWith("**") ? (
              <strong key={k}>{seg.slice(2, -2)}</strong>
            ) : (
              seg
            ),
          )}
        {j < arr.length - 1 && <br />}
      </span>
    ));
  });
}

function TypingDots() {
  return (
    <div className={styles.typingDots}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={styles.typingDot}
          style={{ animationDelay: `${i * 0.2}s` }}
        />
      ))}
    </div>
  );
}

function Message({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div
      className={`${styles.messageRow} ${isUser ? styles.messageRowUser : styles.messageRowAssistant}`}
    >
      {!isUser && <img className={styles.userChat} src="buho.png"></img>}
      <div
        className={`${styles.bubble} ${isUser ? styles.bubbleUser : styles.bubbleAssistant}`}
      >
        {msg.typing ? <TypingDots /> : formatText(msg.content)}
      </div>
    </div>
  );
}

export default function ChatBot() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const currentUser = getStoredUser();
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "¡Hola! Soy **MathBot** 🎉\nEstoy aquí para ayudarte con las matemáticas. ¿Qué quieres aprender hoy?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingConversation, setLoadingConversation] = useState(false);
  const [showQuick, setShowQuick] = useState(true);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    async function loadConversationFromQuery() {
      const queryConversationId = Number(searchParams.get("conversationId"));
      const activeUserId = Number(currentUser?.id);

      if (!activeUserId || !queryConversationId) {
        return;
      }

      if (conversationId === queryConversationId) {
        return;
      }

      setLoadingConversation(true);
      try {
        const res = await chatService.getConversation(
          activeUserId,
          queryConversationId,
        );
        const conversation =
          res?.conversation || (Array.isArray(res?.messages) ? res : null);
        const loadedMessages = Array.isArray(conversation?.messages)
          ? conversation.messages
          : [];

        if (res?.ok === false || !conversation) {
          throw new Error(
            "No se pudo cargar la conversación guardada. Intenta abrirla de nuevo.",
          );
        }

        setConversationId(queryConversationId);
        setShowQuick(false);

        if (loadedMessages.length > 0) {
          setMessages(loadedMessages);
        } else {
          setMessages([
            {
              role: "assistant",
              content:
                "Esta conversación no tiene mensajes guardados todavía. Escribe tu siguiente pregunta para continuar.",
            },
          ]);
        }
      } catch (err) {
        setMessages([
          {
            role: "assistant",
            content: `⚠️ No pude cargar el historial de este chat. ${err?.message || ""}`,
          },
        ]);
      } finally {
        setLoadingConversation(false);
      }
    }

    loadConversationFromQuery();
  }, [searchParams, currentUser?.id, conversationId]);

  useEffect(() => {
    if (!currentUser?.id) {
      navigate("/login");
    }
  }, [currentUser?.id, navigate]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(text) {
    if (!text.trim() || loading || loadingConversation) return;

    const activeUserId = Number(currentUser?.id);
    if (!activeUserId) {
      navigate("/login");
      return;
    }

    setShowQuick(false);
    setLoading(true);

    const userMsg = { role: "user", content: text };
    setMessages((prev) => [
      ...prev,
      userMsg,
      { role: "assistant", content: "", typing: true },
    ]);

    try {
      let activeConversationId = conversationId;

      if (!activeConversationId) {
        const start = await chatService.startConversation(activeUserId, text);

        if (!start?.ok || !start?.conversationId) {
          throw new Error(
            start?.title ||
              "No se pudo crear la conversación. Intenta de nuevo.",
          );
        }

        activeConversationId = Number(start.conversationId);
        setConversationId(activeConversationId);
      }

      if (!activeConversationId) {
        throw new Error("Conversación inválida. Intenta nuevamente.");
      }

      const res = await chatService.sendToBackend({
        userId: activeUserId,
        conversationId: activeConversationId,
        message: text,
      });

      if (res?.ok === false) {
        throw new Error(
          res?.reply || "La IA no pudo responder en este momento.",
        );
      }

      const reply = res.reply || "Lo siento, no obtuve respuesta.";

      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: "assistant", content: reply };
        return updated;
      });
    } catch (err) {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: `⚠️ Ocurrió un error. ${err?.message || ""}`,
        };
        return updated;
      });
    }

    setLoading(false);
    inputRef.current?.focus();
  }

  function handleSend() {
    const text = input.trim();
    if (!text) return;
    setInput("");
    sendMessage(text);
  }

  return (
    <div className={styles.chatbot}>
      <ChatHeader user={currentUser} />

      <div className={styles.subBody}>
        <div className={styles.content}>
          <div className={styles.messages}>
            {messages.map((msg, i) => (
              <Message key={i} msg={msg} />
            ))}
            <div ref={bottomRef} />
          </div>

          {showQuick && (
            <div className={styles.quickBar}>
              {QUICK_TOPICS.map(({ label, msg }) => (
                <button
                  key={label}
                  className={styles.quickBtn}
                  onClick={() => {
                    setInput("");
                    sendMessage(msg);
                  }}
                  disabled={loading}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          <div className={styles.inputBar}>
            <input
              ref={inputRef}
              className={styles.textInput}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && !e.shiftKey && handleSend()
              }
              placeholder="Escribe tu pregunta..."
              maxLength={300}
              disabled={loading}
            />
            <button
              className={styles.sendBtn}
              onClick={handleSend}
              disabled={loading || loadingConversation || !input.trim()}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>

        <div className={styles.panel}>
          {/* <h1>hola</h1> */}
        </div>
      </div>
    </div>
  );
}
