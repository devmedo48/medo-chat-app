import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
} from "firebase/auth";
import {
  collection,
  doc,
  getDocs,
  getFirestore,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { toast } from "react-toastify";

const firebaseConfig = {
  apiKey: "AIzaSyBUHMiuPSpO1-8JIqIlFJZi2wNT0s8Xf8Y",
  authDomain: "chat-app-12c49.firebaseapp.com",
  projectId: "chat-app-12c49",
  storageBucket: "chat-app-12c49.firebasestorage.app",
  messagingSenderId: "1006556439343",
  appId: "1:1006556439343:web:48e3453393ce849a1577da",
  measurementId: "G-WKT2NXCG0Y",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let signup = async (username, email, password) => {
  try {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    let user = res.user;
    await setDoc(doc(db, "users", user.uid), {
      id: user.uid,
      username: username.toLowerCase(),
      email,
      name: "",
      avatar: "",
      bio: "Hey, There i am using chat-app from Medo Dev",
      lastSeen: Date.now(),
    });
    await setDoc(doc(db, "chats", user.uid), {
      chatsData: [],
    });
    toast.success("You have created account successfully");
  } catch (err) {
    console.log(err);
    toast.error(err.code.split("/")[1].split("-").join(" "));
  }
};

let login = async (email, password) => {
  try {
    await signInWithEmailAndPassword(auth, email, password);
    toast.success("You have loggedin successfully");
  } catch (error) {
    toast.error(error.code.split("/")[1].split("-").join(" "));
    console.log(error);
  }
};

let logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    toast.error(error.code.split("/")[1].split("-").join(" "));
    console.log(error);
  }
};

let resetPass = async (email) => {
  if (!email) {
    toast.info("Enter your email");
    return;
  }
  try {
    const userRef = collection(db, "users");
    const q = query(userRef, where("email", "==", email));
    const querySnap = await getDocs(q);
    if (!querySnap.empty) {
      await sendPasswordResetEmail(auth, email);
      toast.success("Reset Email Sent");
    } else {
      toast.error("Email doesn't exist");
    }
  } catch (error) {
    toast.error(error.code.split("/")[1].split("-").join(" "));
    console.log(error);
  }
};

export { signup, login, logout, auth, db, resetPass };
