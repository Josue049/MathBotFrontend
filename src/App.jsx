import { Routes, Route } from "react-router-dom";
// import Login from './pages/login'
import Home from "./pages/home";
import Dashboard from "./pages/dashboard";
import Register from "./pages/register";
import RegisterTeacher from "./pages/registerTeacher";
import ChatBot from "./pages/chatbot";
import Login from "./pages/login";
import SettingsPage from "./pages/settings";
import HistoryPage from "./pages/history";
import AccessPage from "./pages/access";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/register" element={<Register />} />
      <Route path="/register-teacher" element={<RegisterTeacher />} />
      <Route path="/login" element={<Login />} />
      <Route path="/access" element={<AccessPage />} />
      <Route path="/chat" element={<ChatBot />} />
      <Route path="/history" element={<HistoryPage />} />
      <Route path="/settings" element={<SettingsPage />} />
    </Routes>
  );
}

export default App;
