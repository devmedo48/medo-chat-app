import "./ProfileUpdate.css";
import assets from "../../assets/assets";
import { useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../config/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import uploadImage from "../../config/cloudinary";
import { AppContent } from "../../Context/AppContext";
function ProfileUpdate() {
  let [image, setImage] = useState(false);
  let [name, setName] = useState("");
  let [bio, setBio] = useState("");
  let [uid, setUid] = useState("");
  let [prevImage, setPrevImage] = useState("");
  let navigate = useNavigate();
  let { setUserData } = useContext(AppContent);
  async function updateProfile(e) {
    e.preventDefault();
    try {
      if (!image && !prevImage) {
        toast.info("Upload profile image please!");
      } else {
        const docRef = doc(db, "users", uid);
        if (image) {
          const imageUrl = await uploadImage(image);
          setPrevImage(imageUrl);
          await updateDoc(docRef, {
            name,
            bio,
            avatar: imageUrl,
          });
        } else {
          await updateDoc(docRef, {
            name,
            bio,
          });
        }
        let snap = await getDoc(docRef);
        setUserData(snap.data());
        navigate("/chat");
      }
    } catch (err) {
      console.log(err);
      toast.error(err.message);
    }
  }
  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUid(user.uid);
        let docRef = doc(db, "users", user.uid);
        let docSnap = await getDoc(docRef);
        if (docSnap.data().name) {
          setName(docSnap.data().name);
        }
        if (docSnap.data().bio) {
          setBio(docSnap.data().bio);
        }
        if (docSnap.data().avatar) {
          setPrevImage(docSnap.data().avatar);
        }
      } else {
        navigate("/");
      }
    });
  }, []);
  return (
    <div className="profile-p">
      <div className="profile-container">
        <form onSubmit={updateProfile}>
          <h3>Profile Details</h3>
          <label htmlFor="avatar">
            <input
              onChange={(e) => setImage(e.target.files[0])}
              type="file"
              id="avatar"
              accept=".png, .jpg, .jpeg"
              hidden
            />
            <img
              src={
                image
                  ? URL.createObjectURL(image)
                  : prevImage
                  ? prevImage
                  : assets.avatar_icon
              }
              alt=""
            />
            upload profile image
          </label>
          <input
            type="text"
            placeholder="Your name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <textarea
            placeholder="Write profile bio"
            required
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          ></textarea>
          <button>Save</button>
        </form>
        <img
          className="profile-pic"
          src={
            image
              ? URL.createObjectURL(image)
              : prevImage
              ? prevImage
              : assets.logo_icon
          }
          alt=""
        />
      </div>
    </div>
  );
}

export default ProfileUpdate;
