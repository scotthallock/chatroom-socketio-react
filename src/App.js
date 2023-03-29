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
      const newMessages = [...messages, newMessage];
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
        <span className="username">{user.username}</span>
      </li>
    );
  });

  return (
    <div className="app-container">
      <div className="main-container">
        <MessageBoard messages={messages} />
        <div className="new-message-container">
          <input ref={inputRef} type="text" onKeyDown={handleKeyDown} />
          <button onClick={sendMessage}>Send</button>
        </div>
      </div>
      <div className="online-users-container">
        <h3>Online</h3>
        <ul>{onlineUsersList}</ul>
      </div>
    </div>
  );
}

function UserIcon({ user }) {
  return (
    <span className="user-icon" style={{ backgroundColor: user.color }}>
      {user.username
        .split(" ")
        .map((n) => n[0])
        .join("")}
    </span>
  );
}

function MessageBoard({ messages }) {
  const reducedMessages = messages.reduce(
    (acc, msg) => {
      const { list, prev } = acc;
      // An "alert" message renders differently
      // (When a user joins or leaves the chatroom)
      if (msg.type.includes("alert")) {
        list.push(
          <div key={msg.id} className={`alert ${msg.type}`}>
            <span>
              <span className="username">{msg.user.username}</span>{" "}
              {msg.content}
            </span>
          </div>
        );
        return { list, prev: msg };
      }

      // If a user sends multiple messages in a row
      // Only display their username and icon with the first message
      list.push(
        <div key={msg.id} className="message">
          {prev && prev.user.username === msg.user.username ? (
            <div className="message-text">
              <span className="content">{msg.content}</span>
            </div>
          ) : (
            <>
              <UserIcon user={msg.user} />
              <div className="message-text">
                <span className="username">{msg.user.username}</span>
                <span className="content">{msg.content}</span>
              </div>
            </>
          )}
        </div>
      );

      return { list, prev: msg };
    },
    { list: [], prev: null }
  );

  return (
    <div className="messages-container">{reducedMessages.list.reverse()}</div>
  );
}
