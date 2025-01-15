import { useContext, useEffect, useState } from "react";
import assets from "../assets/assets";
import { logout } from "../config/firebase";
import { AppContent } from "../Context/AppContext";

export default function RightSidebar() {
  let { chatUser, messages, state } = useContext(AppContent);
  const [online, setOnline] = useState(false);
  let [msgImages, setMsgImages] = useState([]);
  useEffect(() => {
    let tempVar = [];
    messages.map((msg) => {
      if (msg.image) {
        tempVar.push(msg.image);
      }
    });
    setMsgImages(tempVar);
  }, [messages]);
  useEffect(() => {
    if (chatUser) {
      if (Date.now() - chatUser.userData.lastSeen <= 80000) {
        setOnline(true);
      } else {
        setOnline(false);
      }
    }
  }, [state, chatUser]);
  return chatUser ? (
    <div className="right-side">
      <div className="profile">
        <img src={chatUser.userData.avatar} alt="" />
        <h3>
          {chatUser.userData.name}{" "}
          {online && <img src={assets.green_dot} className="dot" alt="" />}
        </h3>
        <p>{chatUser.userData.bio}</p>
      </div>
      <hr />
      <div className="media">
        <p>Media</p>
        {msgImages.length > 0 ? (
          <div>
            {msgImages.map((url, index) => (
              <img
                onClick={() => window.open(url)}
                key={index}
                src={url}
                alt=""
              />
            ))}
          </div>
        ) : (
          <div>no media</div>
        )}
      </div>
      <button onClick={() => logout()}>Logout</button>
    </div>
  ) : (
    <div className="right-side">
      <button onClick={() => logout()}>Logout</button>
    </div>
  );
}
