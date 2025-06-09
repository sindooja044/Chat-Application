import React, { useContext, useEffect, useState } from "react";
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
  console.log(userData);
  console.log(chatData);
  const [user, setUser] = useState(null);
  const [showSearch, setShowSearch] = useState(false);

  const inputHandler = async (e) => {
    //if any changes in search bar this method exicuted

    try {
      const input = e.target.value;
      if (input) {
        //if  we type in input flield then exicute this code
        setShowSearch(true);
        const userRef = collection(db, "users"); //taking users collection
        const q = query(userRef, where("username", "==", input.toLowerCase())); //if username in users ==input.if user enter upprcase convert to lower
        const querySnap = await getDocs(q); //getting document from query
        if (!querySnap.empty && querySnap.docs[0].data().id !== userData.id) {
          console.log(querySnap.docs[0].data());

          let userExist = false;
          chatData.map((user) => {
            if (user.rId === querySnap.docs[0].data().id) {
              /*  if user id ===search id it will not display   */
              userExist = true;
            }
          });
          if (!userExist) {
            setUser(
              querySnap.docs[0].data()
            ); /* only  false case we can show */
          }
        } else {
          setUser(null);
        }
      } else {
        setShowSearch(false); //if we dont type anything then set false
      }
    } catch (error) {}
  };

  const addChat = async () => {
    const messagesRef = collection(db, "messages");
    const chatsRef = collection(db, "chats");
    try {
      const newMessageRef = doc(messagesRef);
      await setDoc(newMessageRef, {
        createAt: serverTimestamp(),
        messages: [], //messages have both receivers data and our data
      });
      await updateDoc(doc(chatsRef, user.id), {
        //when establish connection between 2 users then create this data both users data
        chatsData: arrayUnion({
          messageId: newMessageRef.id,
          lastMessage: "",
          rId: userData.id,
          updatedAt: Date.now(),
          messageSeen: true,
        }),
      });
      //when we add new chat that 2 users databse the neww entry created
      await updateDoc(doc(chatsRef, userData.id), {
        //when establish connection between 2 users then create this data both users data
        chatsData: arrayUnion({
          messageId: newMessageRef.id,
          lastMessage: "",
          rId: user.id,
          updatedAt: Date.now(),
          messageSeen: true,
        }),
      });
    } catch (error) {
      toast.error(error.message);
      console.error(error);
    }
  };

  const setChat = async (item) => {
    //when click div we goto chat page with that user
    console.log(item);
    setMessagesId(item.messageId);
    setChatUser(item);
    const userChatsRef = doc(db, "chats", userData.id); //getting document of user
    const userChatsSnapshot = await getDoc(userChatsRef);
    const userChatsData = userChatsSnapshot.data(); //getting multiple users data

    const chatIndex = userChatsData.chatsData.findIndex(
      (c) => c.messageId === item.messageId
    ); //using the chatIndex we will modify the chatData
    userChatsData.chatsData[chatIndex].messageSeen = true; //making true
    await updateDoc(userChatsRef, {
      chatsData: userChatsData.chatsData, //updating changes in db
    });
    setChatVisible(true);
  };
  return (
    <div
      className={`ls ${chatVisible ? "hidden" : ""} ${
        !chatRightVisible ? "hidden" : ""
      } `}
    >
      <div className="ls-top">
        <div className="ls-nav">
          <img src={assets.logo} alt="" className="logo" />
          <div className="menu2">
            <img src={assets.menu_icon} className="menu1" alt="" />

            <div className=" sub-menu">
              <p onClick={() => navigate("/profile")}>Edit</p>
              <hr />
              <p onClick={() => navigate("/")}>Logout</p>
            </div>
          </div>
        </div>
        <div className="ls-search">
          <img src={assets.search_icon} alt="" />
          <input
            onChange={inputHandler}
            type="text"
            placeholder="search here"
          />
        </div>
      </div>

      {/* if showSearchTRUE and user available then display this block else all array */}
      <div className="ls-list">
        {showSearch && user ? (
          <div onClick={addChat} className="friends add-user">
            <img src={user.avatar} alt="" />
            <p>{user.name}</p>
          </div>
        ) : (
          chatData.map((item, index) => (
            <div
              onClick={() => setChat(item)}
              key={index}
              className={` friends ${
                item.messageSeen || item.messageId === messagesId
                  ? ""
                  : "border"
              }`}
            >
              {" "}
              {/*msgseen highlated*/}
              <img src={item.userData.avatar} alt="" />
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
