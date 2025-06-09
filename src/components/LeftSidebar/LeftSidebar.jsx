import React, { useContext, useState } from "react";
import "./LeftSidebar.css";
import assets from "../../assets/assets";
import { useNavigate } from "react-router-dom";
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
import { db } from "../../config/firebase";
import { AppContext } from "../../context/AppContext";
import { toast } from "react-toastify";

const LeftSidebar = () => {
  const navigate = useNavigate();
  const {
    userData,
    chatData,
    setMessagesId,
    messagesId,
    chatUser,
    setChatUser,
    chatVisible,
    setChatVisible,
    chatRightVisible,
    setChatRightVisible,
  } = useContext(AppContext);

  const [user, setUser] = useState(null);
  const [showSearch, setShowSearch] = useState(false);

  const inputHandler = async (e) => {
    try {
      const input = e.target.value;
      if (input) {
        setShowSearch(true);
        const userRef = collection(db, "users");
        const q = query(userRef, where("username", "==", input.toLowerCase()));
        const querySnap = await getDocs(q);
        if (!querySnap.empty && querySnap.docs[0].data().id !== userData.id) {
          const searchUser = querySnap.docs[0].data();
          const userExists = chatData.some((chat) => chat.rId === searchUser.id);
          if (!userExists) {
            setUser(searchUser);
          } else {
            setUser(null);
            toast.info("User already in chat list");
          }
        } else {
          setUser(null);
        }
      } else {
        setShowSearch(false);
      }
    } catch (error) {
      toast.error("Something went wrong while searching");
    }
  };

  const addChat = async () => {
    try {
      const exists = chatData.some((chat) => chat.rId === user.id);
      if (exists) {
        toast.info("Chat already exists");
        return;
      }

      const messagesRef = collection(db, "messages");
      const chatsRef = collection(db, "chats");
      const newMessageRef = doc(messagesRef);

      await setDoc(newMessageRef, {
        createAt: serverTimestamp(),
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

      toast.success("Chat added");
      setUser(null);
      setShowSearch(false);
    } catch (error) {
      toast.error("Failed to add chat");
      console.error(error);
    }
  };

  const setChat = async (item) => {
    try {
      setMessagesId(item.messageId);
      setChatUser(item);

      const userChatsRef = doc(db, "chats", userData.id);
      const userChatsSnapshot = await getDoc(userChatsRef);
      const userChatsData = userChatsSnapshot.data();

      const chatIndex = userChatsData.chatsData.findIndex(
        (c) => c.messageId === item.messageId
      );

      if (chatIndex !== -1) {
        userChatsData.chatsData[chatIndex].messageSeen = true;
        await updateDoc(userChatsRef, {
          chatsData: userChatsData.chatsData,
        });
      }

      setChatVisible(true);
    } catch (error) {
      toast.error("Failed to open chat");
    }
  };

  // Remove duplicates before rendering
  const uniqueChats = [...new Map(chatData.map((item) => [item.rId, item])).values()];

  return (
    <div
      className={`ls ${chatVisible ? "hidden" : ""} ${
        !chatRightVisible ? "hidden" : ""
      }`}
    >
      <div className="ls-top">
        <div className="ls-nav">
          <img src={assets.logo} alt="logo" className="logo" />
          <div className="menu2">
            <img src={assets.menu_icon} className="menu1" alt="menu" />
            <div className="sub-menu">
              <p onClick={() => navigate("/profile")}>Edit</p>
              <hr />
              <p onClick={() => navigate("/")}>Logout</p>
            </div>
          </div>
        </div>
        <div className="ls-search">
          <img src={assets.search_icon} alt="search" />
          <input onChange={inputHandler} type="text" placeholder="search here" />
        </div>
      </div>

      <div className="ls-list">
        {showSearch && user ? (
          <div onClick={addChat} className="friends add-user">
            <img src={user.avatar} alt={user.name} />
            <p>{user.name}</p>
          </div>
        ) : (
          uniqueChats.map((item, index) => (
            <div
              onClick={() => setChat(item)}
              key={item.messageId || index}
              className={`friends ${
                item.messageSeen || item.messageId === messagesId ? "" : "border"
              }`}
            >
              <img src={item.userData.avatar} alt={item.userData.name} />
              <div>
                <p>{item.userData.name}</p>
                <span>{item.lastMessage}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LeftSidebar;
