import React, { useEffect, useState } from "react";
import "./ChatBox.css";
import assets from "../../assets/assets";
import { useContext } from "react";
import { AppContext } from "../../context/AppContext";
import {
  arrayUnion,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../config/firebase";
import { toast } from "react-toastify";
import uploadToCloudinary from "./../../lib/upload";

const ChatBox = () => {
  const {
    userData,
    messagesId,
    messages,
    chatUser,
    setMessages,
    chatVisible,
    setChatVisible,
    chatRightVisible,
    setChatRightVisible,
  } = useContext(AppContext);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    try {
      if (input && messagesId) {
        //if inpput and messageId available
        await updateDoc(doc(db, "messages", messagesId), {
          messages: arrayUnion({
            sId: userData.id, //creating this
            text: input,
            createdAt: new Date(),
          }),
        });
        const userIDs = [chatUser.rId, userData.id]; //cretate storing lastSeen
        userIDs.forEach(async (id) => {
          const userChatsRef = doc(db, "chats", id);
          const userChatsSnapshot = await getDoc(userChatsRef);
          if (userChatsSnapshot.exists()) {
            const userChatData = userChatsSnapshot.data();
            const chatIndex = userChatData.chatsData.findIndex(
              (c) => c.messageId === messagesId
            );

            userChatData.chatsData[chatIndex].lastMessage = input.slice(0, 30); //we get last msg

            userChatData.chatsData[chatIndex].updatedAt = Date.now(); //show at top

            if (userChatData.chatsData[chatIndex].rId === userData.id) {
              userChatData.chatsData[chatIndex].messageSeen = false; //messageseen updated
            }
            await updateDoc(userChatsRef, {
              chatsData: userChatData.chatsData, //saving in db
            });
          }
        });
      }
    } catch (error) {
      toast.error(error.message);
    }
    setInput(""); //clearing input
  };

  const convertTimeStamp = (timestamp) => {
    //AM PM logic
    let date = timestamp.toDate();
    let hour = date.getHours();
    let minute = date.getMinutes();
    let ampm = hour >= 12 ? "PM" : "AM";
    // Convert 0 (midnight) to 12
    hour = hour % 12;
    hour = hour ? hour : 12; // the hour '0' should be '12'

    // Add leading zero to minutes if needed
    minute = minute < 10 ? "0" + minute : minute;

  return `${hour}:${minute} ${ampm}`;
    
  };

  const sendImage = async (e) => {
    try {
      const fileUrl = await uploadToCloudinary(e.target.files[0]); //get img url
      if (fileUrl && messagesId) {
        await updateDoc(doc(db, "messages", messagesId), {
          messages: arrayUnion({
            sId: userData.id, //creating this
            image: fileUrl,
            createdAt: new Date(),
          }),
        });

        const userIDs = [chatUser.rId, userData.id]; //cretate storing lastSeen
        userIDs.forEach(async (id) => {
          const userChatsRef = doc(db, "chats", id);
          const userChatsSnapshot = await getDoc(userChatsRef);
          if (userChatsSnapshot.exists()) {
            const userChatData = userChatsSnapshot.data();
            const chatIndex = userChatData.chatsData.findIndex(
              (c) => c.messageId === messagesId
            );

            userChatData.chatsData[chatIndex].lastMessage = "Image"; //we get last msg    //showing last msg like Image

            userChatData.chatsData[chatIndex].updatedAt = Date.now(); //show at top

            if (userChatData.chatsData[chatIndex].rId === userData.id) {
              userChatData.chatsData[chatIndex].messageSeen = false; //messageseen updated
            }
            await updateDoc(userChatsRef, {
              chatsData: userChatData.chatsData, //saving in db
            });
          }
        });
      }
    } catch (error) {
      toast.error(error.message);
    }
  };
  //when select user from leftbar messages will be diplay in chat box in reverse  perticular with messagesId

  useEffect(() => {
    if (messagesId) {
      //if messagesId available
      const unSub = onSnapshot(doc(db, "messages", messagesId), (res) => {
        setMessages(res.data().messages.reverse());
        console.log(res.data().messages.reverse());
      });
      return () => {
        unSub();
      };
    }
  }, [messagesId]);

  return chatUser ? (
    <div
      className={`chat-box ${chatVisible ? "" : "hidden"} ${
        !chatRightVisible ? "hidden" : ""
      }`}
    >
      <div className="chat-user">
        <img src={chatUser.userData.avatar} alt="" />{" "}
        {/* diplating perticular user puc and name */}
        <p>
          {chatUser.userData.name}{" "}
          {Date.now() - chatUser.userData.lastSeen <= 70000 ? (
            <img src={assets.green_dot} className="dot" alt="" />
          ) : null}
        </p>
        <img
          onClick={() => setChatRightVisible(false)}
          src={assets.help_icon}
          alt=""
          className="help"
        />
        <img
          onClick={() => {
            setChatVisible(false);
          }}
          src={assets.arrow_icon}
          className="arrow"
          alt=""
        />
      </div>

      <div className="chat-msg">
        {messages.map(
          (
            msg,
            index //working on each msg
          ) => (
            <div
              key={index}
              className={msg.sId === userData.id ? "s-msg" : "r-msg"}
            >
              {msg["image"] ? ( //msg visible logic
                <img className="msg-img" src={msg.image} alt="" />
              ) : (
                <p className="msg">{msg.text}</p>
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
                <p>{convertTimeStamp(msg.createdAt)}</p>
              </div>
            </div>
          )
        )}

        {/* <div className="s-msg">
                    <p className='msg'>hello</p>
                    <div>
                        <img src={assets.profile_img} alt="" />
                        <p>2.30pm</p>
                    </div>
                </div>

                <div className="s-msg">
                    <img className="msg-img" src={assets.pic1} alt="" />
                    <div>
                        <img src={assets.profile_img} alt="" />
                        <p>2.30pm</p>
                    </div>
                </div>
                <div className="r-msg">
                    <p className='msg'>hello</p>
                    <div>
                        <img src={assets.profile_img} alt="" />
                        <p>2.30pm</p>
                    </div>
                </div> */}
      </div>
      <div className="chat-input">
        <input
          onChange={(e) => setInput(e.target.value)}
          value={input}
          type="text"
          placeholder="send a message"
        />
        <input
          onChange={sendImage}
          type="file"
          id="image"
          accept="image/png,image/jpeg"
          hidden
        />{" "}
        {/* file uploading image*/}
        <label htmlFor="image">
          <img src={assets.gallery_icon} alt="" />
        </label>
        <img onClick={sendMessage} src={assets.send_button} alt="" />
      </div>
    </div>
  ) : (
    <div
      className={`chat-welcome ${chatVisible ? "" : "hidden"} ${
        !chatRightVisible ? "hidden" : ""
      }`}
    >
      <img src={assets.logo_icon} alt="" />
      <p>chat anytime, anywhere</p>
    </div>
  );
};

export default ChatBox;
