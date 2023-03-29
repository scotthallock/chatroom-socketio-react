import React, { useState, useEffect, useRef } from "react";
import { socket } from "./socket.js";

// Helpful resource: Using Socket.IO with React
// https://socket.io/how-to/use-with-react

export default function App() {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [onlineUsers, setOnlineUsers] = useState({});
  const [messages, setMessages] = useState([]);
  const inputRef = useRef(null);

  console.log("APP RENDER");
  console.log(onlineUsers[socket.id]);

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
      const newMessages = [newMessage, ...messages];
      // only display last 200 messages
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
      timestamp: Date.now(),
    });
    inputRef.current.value = "";
  };

  const handleKeyDown = (e) => {
    return e.key === "Enter" && sendMessage();
  };

  /* Create the JSX */

  const onlineUsersList = Object.values(onlineUsers).map((user) => {
    return (
      <li key={user.id}>
        <UserIcon user={user} />
        <span>{user.username}</span>
      </li>
    );
  });

  const messageList = messages.map((msg) => {
    return (
      <div key={msg.id} className="message">
        <UserIcon user={msg.user} />
        <div className="username">{msg.user.username}</div>
        <span className="content">{msg.content}</span>
      </div>
    );
  });

  return (
    <div className="app-container">
      <div className="online-users-container">
        <h3>Online</h3>
        <ul>{onlineUsersList}</ul>
      </div>
      <div className="main-container">
        <div className="messages-container">{messageList}</div>
        <div className="new-message-container">
          <input ref={inputRef} type="text" onKeyDown={handleKeyDown} />
          <button onClick={sendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
}

function UserIcon({ user }) {
  return (
    <span className="user-icon" style={{ backgroundColor: user.color }}>
      {user.username.split(" ").map(n => n[0]).join("")}
    </span>
  );
}
