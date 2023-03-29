import React, { useState, useEffect } from "react";
import { socket } from "./socket.js";

// Helpful resource: Using Socket.IO with React
// https://socket.io/how-to/use-with-react

export default function App() {

  const [isConnected, setIsConnected] = useState(socket.connected);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
      console.log(`User ${socket.id} connected!`);
    }

    function onDisconnect() {
      console.log(`User ${socket.id} disconnected...`);
      setIsConnected(false);
    }

    function logOnlineUsers(users) {
      console.log("The online-users listener fired:")
      console.log(users);
      setOnlineUsers(users);
    }

    // Register the event listeners
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on("online-users", logOnlineUsers)

    // Event registration cleanup
    // (to prevent duplicate event registrations)
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('online-users', logOnlineUsers);
    };
  }, []);

  const handleClick = () => {
    console.log("you clicked");
  };

  const onlineUsersList = onlineUsers.map(e => {
    return <h6>${e}</h6>;
  });

  // ADD DISPLAY OF ALL ONLINE USERS

  return (
    <div>
      <h1>Hello World Chatroom</h1>
      <div>
        <h3>Online users:</h3>
        {onlineUsersList}
        <button onClick={handleClick}>Click me</button>
      </div>
    </div>
  );
}
