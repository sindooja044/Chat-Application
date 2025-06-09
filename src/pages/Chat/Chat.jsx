import React, { useContext, useEffect, useState } from "react";
import "./Chat.css";
import LeftSidebar from "../../components/LeftSidebar/LeftSidebar";
import ChatBox from "../../components/ChatBox/ChatBox";
import RightSidebar from "../../components/RightSidebar/RightSidebar";
import { AppContext } from "../../context/AppContext";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js"; // For components like modals, tooltips, etc.
import useIsMobile from "../../hooks/useIsMobile";

const Chat = () => {
  const { chatData, userData, chatVisible } = useContext(AppContext); //we put chatData[null] so before loading we show loading msg
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (chatData && userData) {
      setLoading(false);
    }
  }, [chatData, userData]); //any of the array data updated this function will exicuted
  return (
    <div className="chat">
      {loading ? (
        <div className="d-flex justify-content-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="chat-container">
          {(!isMobile || !chatVisible) && <LeftSidebar />}
          {(!isMobile || chatVisible) && <ChatBox />}
          {<RightSidebar />}
        </div>
      )}
    </div>
  );
};

export default Chat;
