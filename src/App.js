import React, { useState, useEffect, useRef } from "react";
import { socket } from "./socket.js";

// Helpful resource: Using Socket.IO with React
// https://socket.io/how-to/use-with-react

export default function App() {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [onlineUsers, setOnlineUsers] = useState({});
  const [messages, setMessages] = useState([]);
  const inputRef = useRef(null);

  console.log("APP RENDER !!");
  console.log(`You are ${onlineUsers[socket.id]?.name}`);

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
      setMessages([...messages, newMessage]);
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

  const onlineUsersList = Object.values(onlineUsers).map((user) => (
    <li key={user.id}>{user.username}</li>
  ));

  return (
    <div className="app-container">
      <div className="online-users-container">
        <h1>Online</h1>
        <ul>{onlineUsersList}</ul>
      </div>

      <div className="main-container">
        <MessageDisplay messages={messages} />
        <div className="new-message-container">
          <input ref={inputRef} type="text" onKeyDown={handleKeyDown} />
          <button onClick={sendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
}

function MessageDisplay({ messages }) {
  const messageList = messages.map((msg) => {
    return (
      <div>
        <span className="username">{msg.username}</span>
        <span className="content">{msg.content}</span>
      </div>
    );
  });

  return <div className="messages-container">{messageList}</div>;
}
