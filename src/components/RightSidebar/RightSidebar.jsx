import React, { useContext, useEffect } from "react";
import "./RightSidebar.css";
import assets from "../../assets/assets";
import { logout } from "../../config/firebase";
import { AppContext } from "../../context/AppContext";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const RightSidebar = () => {
  const navigate= useNavigate();
  const {
    chatUser,
    messages,
    chatRightVisible,
    setChatRightVisible,
    chatVisible,
    setChatVisible,
  } = useContext(AppContext);
  const [msgImages, setMsgImages] = useState([]);
  useState;

  useEffect(() => {
    let tempVar = [];
    messages.map((msg) => {
      //working on each msg
      if (msg.image) {
        //if image available store in tempVar
        tempVar.push(msg.image);
      }
    });
    setMsgImages(tempVar);
  }, [messages]);
  return chatUser ? (
    <div
      className={`rs ${!chatRightVisible ? "hide-second" : "hidden"} ${
        chatVisible ? "" : "hidden"
      }`}
    >
      <div className="rs-profile">
        <img src={chatUser.userData.avatar} alt="" />
        <h3>
          {" "}
          {Date.now() - chatUser.userData.lastSeen <= 70000 ? (
            <img src={assets.green_dot} className="dot" alt="" />
          ) : null}{" "}
          {chatUser.userData.name}{" "}
        </h3>
        <p>{chatUser.userData.bio}</p>
        <img
          src={assets.arrow_icon}
          className="arrow1"
          alt=""
          onClick={() => {
            setChatRightVisible(true);
          }}
        />
      </div>
      <hr />
      <div className="rs-media">
        <p>Media</p>
        <div>
          {msgImages.map((url, index) => (
            <img
              onClick={() => window.open(url)}
              key={index}
              src={url}
              alt=""
            />
          ))}
          {/* <img src={assets.pic1} alt="" />
            <img src={assets.pic2} alt="" />
            <img src={assets.pic3} alt="" />
            <img src={assets.pic4} alt="" />
            <img src={assets.pic1} alt="" />
            <img src={assets.pic2} alt="" />*/}
        </div>
      </div>
      <button onClick={() => logout()}>Logout</button>
    </div>
  ) : (
    <div className={`rs ${chatVisible ? "" : "hidden"}`}>
      <button onClick={() => logout()}>Logout</button>
    </div>
    
  );
  
};

export default RightSidebar;
