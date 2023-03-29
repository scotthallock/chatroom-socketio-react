import React, { useState, useEffect, useRef } from "react";
import { socket } from "./socket.js";

// Helpful resource: Using Socket.IO with React
// https://socket.io/how-to/use-with-react

export default function App() {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [onlineUsers, setOnlineUsers] = useState({});
  const [messages, setMessages] = useState([]);
  const inputRef = useRef(null);

  console.log("APP RENDER !!")
  console.log(messages);

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
      console.log(`User ${socket.id} connected!`);
    }

    function onDisconnect() {
      setIsConnected(false);
      console.log(`User ${socket.id} disconnected...`);
    }

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
    function onReceiveMessage(newMessage) {
      setMessages([...messages, newMessage]);
    }

    socket.on("receive-message", onReceiveMessage);

    return () => {
      socket.off("receive-message", onReceiveMessage);
    };
  }, [messages]);

  const sendMessage = () => {
    if (inputRef.current.value === "") return;
    socket.emit("send-message", inputRef.current.value);
    inputRef.current.value = "";
  };

  const handleKeyDown = (e) => {
    return e.key === "Enter" && sendMessage();
  };

  const onlineUsersList = Object.values(onlineUsers).map((user) => {
    return (
      <h6>
        {user.name} ... {user.id}
      </h6>
    );
  });

  return (
    <div>
      <h1>Hello World Chatroom</h1>
      <div>
        <h3>Online users:</h3>
        {onlineUsersList}
        <input ref={inputRef} type="text" onKeyDown={handleKeyDown} />
        <button onClick={sendMessage}>Click me</button>
      </div>
    </div>
  );
}
