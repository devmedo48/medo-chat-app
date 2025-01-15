import { useContext, useEffect, useState } from "react";
import assets from "../assets/assets";
import { AppContent } from "../Context/AppContext";
import {
  arrayUnion,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { toast } from "react-toastify";
import uploadImage from "../config/cloudinary";

export default function ChatBox() {
  let {
    userData,
    messagesId,
    chatUser,
    messages,
    setMessages,
    state,
    setState,
    chatVisible,
    setChatVisible,
  } = useContext(AppContent);
  const [input, setInput] = useState("");
  const [online, setOnline] = useState(false);
  async function sendMessage() {
    try {
      await updateDoc(doc(db, "users", userData.id), {
        lastSeen: Date.now(),
      });
      if (input && messagesId) {
        await updateDoc(doc(db, "messages", messagesId), {
          messages: arrayUnion({
            sId: userData.id,
            text: input,
            createdAt: Date.now(),
          }),
        });
        const userIDs = [chatUser.rId, userData.id];
        userIDs.forEach(async (id) => {
          const userChatRef = doc(db, "chats", id);
          const userChatSnapshot = await getDoc(userChatRef);
          if (userChatSnapshot.exists()) {
            const userChatData = userChatSnapshot.data();
            const chatIndex = userChatData.chatsData.findIndex(
              (c) => c.messageId === messagesId
            );

            userChatData.chatsData[chatIndex].lastMessage = input.slice(0, 30);
            userChatData.chatsData[chatIndex].updatedAt = Date.now();
            if (userChatData.chatsData[chatIndex].rId === userData.id) {
              userChatData.chatsData[chatIndex].messageSeen = false;
            }
            await updateDoc(userChatRef, {
              chatsData: userChatData.chatsData,
            });
          }
        });
        setInput("");
        setState(state + 1);
      }
    } catch (error) {
      toast.error(error.message);
    }
  }
  async function sendImage(e) {
    try {
      let image = e.target.files[0];
      let imageUrl = await uploadImage(image);
      console.log(imageUrl);

      if (imageUrl && messagesId) {
        await updateDoc(doc(db, "messages", messagesId), {
          messages: arrayUnion({
            sId: userData.id,
            image: imageUrl,
            createdAt: Date.now(),
          }),
        });
        const userIDs = [chatUser.rId, userData.id];
        userIDs.forEach(async (id) => {
          const userChatRef = doc(db, "chats", id);
          const userChatSnapshot = await getDoc(userChatRef);
          if (userChatSnapshot.exists()) {
            const userChatData = userChatSnapshot.data();
            const chatIndex = userChatData.chatsData.findIndex(
              (c) => c.messageId === messagesId
            );

            userChatData.chatsData[chatIndex].lastMessage = "Image";
            userChatData.chatsData[chatIndex].updatedAt = Date.now();
            if (userChatData.chatsData[chatIndex].rId === userData.id) {
              userChatData.chatsData[chatIndex].messageSeen = false;
            }
            await updateDoc(userChatRef, {
              chatsData: userChatData.chatsData,
            });
          }
        });
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  }
  useEffect(() => {
    if (messagesId) {
      const unSub = onSnapshot(doc(db, "messages", messagesId), (res) => {
        setMessages(res.data().messages.reverse());
      });
      return () => {
        unSub();
      };
    }
  }, [messagesId]);
  useEffect(() => {
    if (chatUser) {
      if (Date.now() - chatUser.userData.lastSeen <= 80000) {
        setOnline(true);
      } else {
        setOnline(false);
      }
    }
  }, [state, chatUser]);
  function convertTimestamp(timestamp) {
    let date = new Date(timestamp);
    let hour = date.getHours();
    let dateMinute = date.getMinutes();
    let minute =
      String(dateMinute).length === 1 ? `0${dateMinute}` : dateMinute;

    if (hour > 12) {
      return `${hour - 12} : ${minute} PM`;
    } else {
      return `${hour} : ${minute} AM`;
    }
  }
  return chatUser ? (
    <div className={`chat-box ${chatVisible ? "" : "hidden"}`}>
      <div className="chat-user">
        <img src={chatUser.userData.avatar} alt="" />
        <p>
          {chatUser.userData.name}{" "}
          {online && <img src={assets.green_dot} className="dot" alt="" />}
        </p>
        <img className="help" src={assets.help_icon} alt="" />
        <img
          onClick={() => setChatVisible(false)}
          className="arrow"
          src={assets.arrow_icon}
          alt=""
        />
      </div>

      <div className="chat-msg">
        {messages.map((msg, index) => (
          <div
            className={msg.sId === userData.id ? "s-msg" : "r-msg"}
            key={index}
          >
            {msg.text ? (
              <p className="msg">{msg.text}</p>
            ) : (
              <img src={msg.image} alt="" className="msg-img" />
            )}
            <div>
              <img
                src={
                  msg.sId === userData.id
                    ? userData.avatar
                    : chatUser.userData.avatar
                }
                alt=""
              />
              <p>{convertTimestamp(msg.createdAt)}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="chat-input">
        <input
          onKeyDown={(e) => {
            e.key === "Enter" && sendMessage();
          }}
          onChange={(e) => setInput(e.target.value)}
          value={input}
          type="text"
          placeholder="Send a message"
        />
        <input
          onChange={sendImage}
          type="file"
          accept="image/png,image/jpeg"
          id="image"
          hidden
        />
        <label htmlFor="image">
          <img src={assets.gallery_icon} alt="" />
        </label>
        <img onClick={sendMessage} src={assets.send_button} alt="" />
      </div>
    </div>
  ) : (
    <div className={`chat-welcome ${chatVisible ? "" : "hidden"}`}>
      <img src={assets.logo_icon} alt="" />
      <p>Chat anytime, anywhere</p>
    </div>
  );
}
