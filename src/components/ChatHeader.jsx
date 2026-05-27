import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getStoredUser, logoutUser } from "../services/authService";
import { getAvatarById } from "../constants/avatars";
import styles from "../pages/chatbot.module.css";

export default function ChatHeader({
  navItems = ["Inicio", "Historial", "Configuración"],
  user,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeNav, setActiveNav] = useState(navItems[0]);
  const [currentUser, setCurrentUser] = useState(user ?? getStoredUser());
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    setCurrentUser(user ?? getStoredUser());
  }, [user]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const avatar = useMemo(
    () => getAvatarById(currentUser?.avatar),
    [currentUser?.avatar],
  );

  const displayName = currentUser?.usuario || currentUser?.nombre || "Invitado";
  const isTeacher = (currentUser?.role || "").toUpperCase() === "ROLE_TEACHER";
  const displayGrade = isTeacher
    ? currentUser?.institution || "Profesor"
    : currentUser?.grado || "Sin sesión";

  const navToPath = {
    Inicio: isTeacher ? "/dashboard" : "/",
    Dashboard: "/dashboard",
    Historial: "/history",
    Configuración: "/settings",
  };

  useEffect(() => {
    if (location.pathname === "/settings") {
      setActiveNav("Configuración");
    } else if (location.pathname === "/dashboard") {
      setActiveNav("Dashboard");
    } else if (location.pathname === "/history") {
      setActiveNav("Historial");
    } else if (location.pathname === "/") {
      setActiveNav("Inicio");
    }
  }, [location.pathname]);

  function handleLogout() {
    logoutUser();
    setCurrentUser(null);
    setMenuOpen(false);
    navigate("/login");
  }

  return (
    <div className={styles.header}>
      <img src="MathBot-icon.png" alt="MathBot" />
      <div className={styles.navLinks}>
        {navItems.map((item) => (
          <button
            key={item}
            onClick={() => {
              setActiveNav(item);
              if (navToPath[item]) {
                navigate(navToPath[item]);
              }
            }}
            className={`${styles.navLink} ${activeNav === item ? styles.navLinkActive : ""}`}
          >
            {item}
          </button>
        ))}
      </div>
      {currentUser ? (
        <div
          className={styles.userArea}
          ref={menuRef}
          style={{ position: "relative" }}
        >
          <span className={styles.userName}>{displayName}</span>
          <span className={styles.gradeBadge}>{displayGrade}</span>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className={styles.avatarCircle}
            style={{ border: "none", cursor: "pointer", padding: 0 }}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-label="Abrir menú de perfil"
          >
            <span
              style={{
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                backgroundColor: avatar.bg,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22,
                lineHeight: 1,
              }}
            >
              {avatar.emoji}
            </span>
          </button>
          {menuOpen ? (
            <div
              role="menu"
              style={{
                position: "absolute",
                top: "calc(100% + 8px)",
                right: 0,
                background: "#fffdf8",
                border: "1px solid #e8dcc8",
                borderRadius: 14,
                boxShadow: "0 12px 28px rgba(80, 50, 20, 0.14)",
                padding: 8,
                minWidth: 180,
                zIndex: 20,
              }}
            >
              <button
                type="button"
                onClick={handleLogout}
                style={{
                  width: "100%",
                  border: "none",
                  borderRadius: 10,
                  padding: "10px 12px",
                  background: "#f7eadd",
                  color: "#6b3f1e",
                  fontWeight: 800,
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                Cerrar sesión
              </button>
            </div>
          ) : null}
        </div>
      ) : (
        <div className={styles.userArea}>
          <button
            type="button"
            onClick={() => navigate("/access?intent=login")}
            className={styles.navLink}
            style={{ background: "transparent", border: "none" }}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => navigate("/access?intent=register")}
            className={styles.navLink}
            style={{ background: "transparent", border: "none" }}
          >
            Register
          </button>
        </div>
      )}
    </div>
  );
}
