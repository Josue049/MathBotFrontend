import ChatHeader from "../components/ChatHeader";
import RegistrationForm from "../components/RegistrationForm";

export default function Register() {
  return (
    <>
      <ChatHeader />
      <link
        href="https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700&display=swap"
        rel="stylesheet"
      />
      <RegistrationForm role="student" />
    </>
  );
}
