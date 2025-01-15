import { Route, Routes, useNavigate } from "react-router-dom";
import Login from "./Pages/Login/Login";
import Chat from "./Pages/Chat/Chat";
import ProfileUpdate from "./Pages/ProfileUpdate/ProfileUpdate";
import { ToastContainer } from "react-toastify";
import { useContext, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./config/firebase";
import { AppContent } from "./Context/AppContext";

function App() {
  let navigate = useNavigate();
  let { loadUserData } = useContext(AppContent);
  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        navigate("/chat");
        await loadUserData(user.uid);
      } else {
        navigate("/");
      }
    });
  }, []);
  return (
    <>
      <ToastContainer />
      <Routes>
        <Route index element={<Login />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/profile" element={<ProfileUpdate />} />
      </Routes>
    </>
  );
}

export default App;
