import { ClimbingBoxLoader } from "react-spinners";
import ChatBox from "../../Components/ChatBox";
import LeftSidebar from "../../Components/LeftSidebar";
import RightSidebar from "../../Components/RightSidebar";
import "./Chat.css";
import { useContext, useEffect, useState } from "react";
import { AppContent } from "../../Context/AppContext";

function Chat() {
  let [loading, setLoading] = useState(true);
  let { chatData, userData } = useContext(AppContent);
  useEffect(() => {
    if ((chatData, userData)) {
      setLoading(false);
    } else {
      setLoading(true);
    }
  }, [chatData, userData]);
  return (
    <div className="chat">
      {loading ? (
        <ClimbingBoxLoader color="#fff" />
      ) : (
        <div className="chat-container">
          <LeftSidebar />
          <ChatBox />
          <RightSidebar />
        </div>
      )}
    </div>
  );
}

export default Chat;
