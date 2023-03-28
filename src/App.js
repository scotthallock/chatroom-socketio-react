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
      setOnlineUsers([ ...onlineUsers, socket.id]);
    }

    function onDisconnect() {
      console.log(`User ${socket.id} disconnected...`);
      setIsConnected(false);
    }

    function onFooEvent(value) {
      setFooEvents(previous => [...previous, value]);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('foo', onFooEvent);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('foo', onFooEvent);
    };
  }, []);

  const onlineUsersList = onlineUsers.map(e => {
    return <h6>${e}</h6>;
  });

  return (
    <div>
      <h1>Hello World Chatroom</h1>
      <div>
        <h3>Online users:</h3>
        {onlineUsersList}
      </div>
    </div>
  );
}
