import { useSearchParams, useNavigate } from "react-router-dom";
import ChatHeader from "../components/ChatHeader";

export default function AccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const intent = searchParams.get("intent") || "login";

  const handleSelect = (role) => {
    if (intent === "register") {
      navigate(role === "teacher" ? "/register-teacher" : "/register");
      return;
    }

    navigate(`/login?role=${role}`);
  };

  const title =
    intent === "register"
      ? "¿Quién se va a registrar?"
      : "¿Quién va a iniciar sesión?";

  return (
    <>
      <ChatHeader />
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #f7efe5 0%, #ede0cf 100%)",
          display: "grid",
          placeItems: "center",
          padding: 24,
          fontFamily: "'Nunito', sans-serif",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 760,
            background: "#fffaf5",
            borderRadius: 28,
            padding: 32,
            boxShadow: "0 24px 60px rgba(84, 48, 20, 0.12)",
            border: "1px solid #ead9c7",
          }}
        >
          <h1
            style={{
              fontFamily: "Georgia, serif",
              color: "#5b3218",
              textAlign: "center",
              marginTop: 0,
            }}
          >
            {title}
          </h1>
          <p
            style={{ textAlign: "center", color: "#7d5b45", marginBottom: 28 }}
          >
            Selecciona tu perfil para continuar.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 18,
            }}
          >
            <button
              type="button"
              onClick={() => handleSelect("student")}
              style={{
                padding: 24,
                borderRadius: 22,
                border: "1px solid #e3cfbb",
                background: "#fff",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <div style={{ fontSize: 44 }}>🎒</div>
              <h2 style={{ margin: "10px 0 6px", color: "#5b3218" }}>
                Estudiante
              </h2>
              <p style={{ margin: 0, color: "#7d5b45" }}>
                Accede a tus chats, tareas y tu historial.
              </p>
            </button>

            <button
              type="button"
              onClick={() => handleSelect("teacher")}
              style={{
                padding: 24,
                borderRadius: 22,
                border: "1px solid #e3cfbb",
                background: "#fff",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <div style={{ fontSize: 44 }}>🧑‍🏫</div>
              <h2 style={{ margin: "10px 0 6px", color: "#5b3218" }}>
                Profesor
              </h2>
              <p style={{ margin: 0, color: "#7d5b45" }}>
                Administra alumnos, estadísticas y el dashboard.
              </p>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
