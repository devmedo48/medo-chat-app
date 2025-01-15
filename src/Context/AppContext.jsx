/* eslint-disable react/prop-types */
/* eslint-disable react-refresh/only-export-components */
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { createContext, useEffect, useState } from "react";
import { db, auth } from "../config/firebase";
import { useNavigate } from "react-router-dom";

export let AppContent = createContext();
export default function AppContextProvider({ children }) {
  let [userData, setUserData] = useState(null);
  let [chatUser, setChatUser] = useState(null);
  let [messagesId, setMessagesId] = useState(null);
  let [chatData, setChatData] = useState([]);
  let [messages, setMessages] = useState([]);
  let [chatVisible, setChatVisible] = useState(false);
  let [state, setState] = useState(0);
  let navigate = useNavigate();
  let loadUserData = async (uid) => {
    try {
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);
      const userData = await userSnap.data();
      setUserData(userData);
      if (userData.avatar && userData.name) {
        navigate("/chat");
      } else {
        navigate("/profile");
      }
      await updateDoc(userRef, {
        lastSeen: Date.now(),
      });
      setInterval(async () => {
        if (auth.chatUser) {
          await updateDoc(userRef, {
            lastSeen: Date.now(),
          });
        }
      }, 60000);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    if (userData) {
      let chatRef = doc(db, "chats", userData.id);
      let unSub = onSnapshot(chatRef, async (res) => {
        const chatItems = res.data().chatsData;
        const tempData = [];
        for (let item of chatItems) {
          let userRef = doc(db, "users", item.rId);
          let userSnap = await getDoc(userRef);
          let userData = userSnap.data();
          tempData.push({ ...item, userData });
        }
        setChatData(tempData.sort((a, b) => b.updatedAt - a.updatedAt));
      });
      return () => {
        unSub();
      };
    }
  }, [userData]);
  let value = {
    chatVisible,
    setChatVisible,
    userData,
    setChatData,
    chatData,
    setUserData,
    loadUserData,
    messages,
    setMessages,
    messagesId,
    setMessagesId,
    chatUser,
    setChatUser,
    state,
    setState,
  };
  return <AppContent.Provider value={value}>{children}</AppContent.Provider>;
}
