import React, { useContext, useEffect, useState } from "react";
import "./ProfileUpdate.css";
import assets from "../../assets/assets";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../config/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import uploadToCloudinary from "../../lib/upload"; // 🔹 Updated Import for Cloudinary Upload
import { toast } from "react-toastify";
import { AppContext } from "../../context/AppContext";

const ProfileUpdate = () => {
  const navigate = useNavigate();
  const [image, setImage] = useState(null);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [prevImage, setPrevImage] = useState("");
  const [uid, setUid] = useState("");
  const {setUserData}=useContext(AppContext) 

  const profileUpdate = async (event) => {
    event.preventDefault();
    try {
      if (!prevImage && !image) {
        toast.error("Upload a profile picture");
        return;
      }
  
      let imgUrl = prevImage;
  
      if (image) {
        try {
          toast.info("Uploading image... Please wait.");
          imgUrl = await uploadToCloudinary(image); // 🔹 Upload to Cloudinary
          if (!imgUrl) throw new Error("Image upload failed");
          setPrevImage(imgUrl);
          console.log("Image uploaded successfully:", imgUrl);
          toast.success("Image uploaded successfully!");
        } catch (error) {
          console.error("Image upload error:", error);
          toast.error("Image upload failed. Try again.");
          return;
        }
      }
  
      console.log("Updating Firestore with:", { uid, imgUrl, name, bio });
  
      const docRef = doc(db, "users", uid);
      await updateDoc(docRef, {
        avatar: imgUrl,
        bio: bio ,
        name: name,
      });
  
      console.log("Firestore update successful!");
      toast.success("Profile updated successfully!");

      const snap=await getDoc(docRef);  //when we clicl=k save it will update data and naV TO CHAT
      setUserData(snap.data());   //updating setState
      navigate('/chat');

    } catch (error) {
      console.error("Error updating profile in Firestore:", error);
      toast.error("Something went wrong. Try again!");
    }
  };
  

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log("Authenticated user ID:", user.uid); // ✅ Debug Log
        setUid(user.uid);
  
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
  
        if (docSnap.exists()) {
          setName(docSnap.data().name || "");
          setBio(docSnap.data().bio || "");
          setPrevImage(docSnap.data().avatar || "");
          console.log("User data loaded from Firestore:", docSnap.data()); // ✅ Debug Log
        } else {
          console.log("No user document found in Firestore");
        }
      } else {
        navigate("/");
      }
    });
  
    return () => unsubscribe();
  }, []);
  

  return (
    <div className="profile">
      <div className="profile-container">
        <form onSubmit={profileUpdate}>
          <h3>Profile Details</h3>
          <label id="avatar">
            <input
              onChange={(e) => setImage(e.target.files[0])}
              type="file"
              accept=".jpg, .jpeg, .png"
              hidden
            />
            <img src={image ? URL.createObjectURL(image) : prevImage || assets.avatar_icon} alt="Profile" />
            Upload Profile Image
          </label>

          <input onChange={(e) => setName(e.target.value)} value={name} type="text" placeholder="Your Name" required />
          <textarea onChange={(e) => setBio(e.target.value)} value={bio} placeholder="Write Profile Bio" required />
          <button type="submit">Save</button>
        </form>
        <img className="profile-pic" src={image ? URL.createObjectURL(image) : prevImage || assets.logo_icon} alt="Profile" />
      </div>
    </div>
  );
};

export default ProfileUpdate;
