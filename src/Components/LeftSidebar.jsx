import { useNavigate } from "react-router-dom";
import assets from "../assets/assets";
import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db, logout } from "../config/firebase";
import { useContext, useEffect, useState } from "react";
import { AppContent } from "../Context/AppContext";
export default function LeftSidebar() {
  let navigate = useNavigate();
  let [user, setUser] = useState(null);
  let [ShowSearch, setShowSearch] = useState(false);
  let {
    userData,
    chatData,
    setMessagesId,
    messagesId,
    setChatUser,
    setState,
    state,
    chatVisible,
    setChatVisible,
    chatUser,
  } = useContext(AppContent);

  let inputHandler = async (e) => {
    try {
      let input = e.target.value;
      if (input) {
        setShowSearch(true);
        let userRef = collection(db, "users");
        let q = query(userRef, where("username", "==", input.toLowerCase()));
        const querySnap = await getDocs(q);
        if (!querySnap.empty && querySnap.docs[0].data().id !== userData.id) {
          let userExist = false;
          chatData.map((user) => {
            if (user.rId === querySnap.docs[0].data().id) {
              userExist = true;
            }
          });
          if (!userExist) {
            setUser(querySnap.docs[0].data());
          }
        } else {
          setUser(null);
        }
      } else {
        setShowSearch(false);
      }
    } catch (error) {
      console.log(error);
    }
  };
  let addChat = async () => {
    let messagesRef = collection(db, "messages");
    const chatsRef = collection(db, "chats");
    try {
      let newMessageRef = doc(messagesRef);
      await setDoc(newMessageRef, {
        createdAt: serverTimestamp(),
        messages: [],
      });
      await updateDoc(doc(chatsRef, user.id), {
        chatsData: arrayUnion({
          messageId: newMessageRef.id,
          lastMessage: "",
          rId: userData.id,
          updatedAt: Date.now(),
          messageSeen: true,
        }),
      });
      await updateDoc(doc(chatsRef, userData.id), {
        chatsData: arrayUnion({
          messageId: newMessageRef.id,
          lastMessage: "",
          rId: user.id,
          updatedAt: Date.now(),
          messageSeen: true,
        }),
      });
      setShowSearch(false);
      const uSnap = await getDoc(doc(db, "users", user.id));
      const uData = uSnap.data();
      setChat({
        messagesId: newMessageRef.id,
        lastMessage: "",
        rId: user.id,
        updatedAt: Date.now(),
        messageSeen: true,
        userData: uData,
      });
    } catch (error) {
      console.log(error);
    }
  };
  let setChat = async (item) => {
    setMessagesId(item.messageId);
    setChatUser(item);
    setState(state + 1);
    const userChatsRef = doc(db, "chats", userData.id);
    const userChatsSnapshot = await getDoc(userChatsRef);
    const userChatsData = userChatsSnapshot.data();
    const chatIndex = userChatsData.chatsData.findIndex(
      (c) => c.messageId === item.messageId
    );
    userChatsData.chatsData[chatIndex].messageSeen = true;
    await updateDoc(userChatsRef, {
      chatsData: userChatsData.chatsData,
    });
    setChatVisible(true);
  };
  useEffect(() => {
    const updateChatUserData = async () => {
      if (chatUser) {
        const userRef = doc(db, "users", userData.id);
        const userSnap = await getDoc(userRef);
        const userData = userSnap.data();
        setChatUser((prev) => ({ ...prev, userData }));
      }
    };
    updateChatUserData();
  }, [chatData]);
  return (
    <div className={`left-side ${chatVisible ? "hidden" : ""}`}>
      <div className="top">
        <div className="nav">
          <img src={assets.logo} alt="" className="logo" />
          <div className="menu">
            <img src={assets.menu_icon} alt="" />
            <div className="sub-menu">
              <p onClick={() => navigate("/profile")}>Edit Profile</p>
              <hr />
              <p onClick={() => logout()}>Logout</p>
            </div>
          </div>
        </div>
        <div className="search">
          <img src={assets.search_icon} alt="" />
          <input
            onChange={inputHandler}
            type="text"
            placeholder="Search here.."
          />
        </div>
      </div>
      <div className="list">
        {ShowSearch && user ? (
          <div className="friend add-user" onClick={addChat}>
            <img src={user.avatar} alt="" />
            <div>
              <p>{user.name}</p>
            </div>
          </div>
        ) : (
          chatData.map((item, index) => (
            <div
              onClick={() => setChat(item)}
              className={`friend ${
                item.messageSeen || item.messageId === messagesId
                  ? ""
                  : "border"
              }`}
              key={index}
            >
              <img src={item.userData.avatar} alt="" />
              <div>
                <p>{item.userData.name}</p>
                <span>{item.lastMessage}..</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
