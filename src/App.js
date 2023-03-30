import React, { useState, useEffect, useRef } from "react";
import { socket } from "./socket.js";
import UserIcon from "./components/UserIcon.js";
import WelcomeMessage from "./components/WelcomeMessage.js";
import MessageBoard from "./components/MessageBoard.js";

export default function App() {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [onlineUsers, setOnlineUsers] = useState({});
  const [messages, setMessages] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    // Register the event listeners
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("online-users", setOnlineUsers);

    // Event registration cleanup (to prevent duplicate event registrations)
    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("online-users", setOnlineUsers);
    };
  }, []);

  useEffect(() => {
    const onReceiveMessage = (newMessage) => {
      const newMessages = [...messages, newMessage];
      // only save/display last 200 messages
      if (newMessages.length === 200) newMessages.pop();
      setMessages(newMessages);
    };

    socket.on("receive-message", onReceiveMessage);

    return () => {
      socket.off("receive-message", onReceiveMessage);
    };
  }, [messages]);

  const sendMessage = () => {
    if (inputRef.current.value === "") return;

    socket.emit("send-message", {
      userId: socket.id,
      content: inputRef.current.value,
    });

    inputRef.current.value = "";
  };

  const handleKeyDown = (e) => e.key === "Enter" && sendMessage();

  const thisUser = onlineUsers[socket.id];

  const onlineUsersList = Object.values(onlineUsers).map((user) => {
    return (
      <li key={user.id}>
        <UserIcon user={user} />
        <span className="username">{user.username}</span>
      </li>
    );
  });

  return (
    <>
      <WelcomeMessage user={thisUser} isConnected={isConnected} />
      <div className="app-container">
        <div className="main-container">
          <MessageBoard messages={messages} />
          <div className="new-message-container">
            <input
              ref={inputRef}
              placeholder="Message the chatroom"
              className="input-message"
              type="text"
              onKeyDown={handleKeyDown}
            />
            <button className="send-button" onClick={sendMessage}>
              Send
            </button>
          </div>
        </div>
        <div className="online-users-container">
          <h3>Online</h3>
          <ul>{onlineUsersList}</ul>
        </div>
      </div>
      <p className="info">
        To demo this app, open another tab/window with the same URL and chat away!
      </p>
    </>
  );
}
