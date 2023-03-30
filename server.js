import express from "express";
import http from "http";
import { Server } from "socket.io";

import path from "path";
import { fileURLToPath } from "url";

import randomAnimalName from "random-animal-name";
import randomColor from "randomcolor";
import { v4 as uuidv4 } from "uuid";

// Create __dirname variable because it is not available in ES modules
// and we have set "type": "module" in our package.json
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Initialize express `app` to be a function handler
// Supply this function handler to an http server
// Initialize a new instance of socket.io by passing it the httpServer object
const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer);

const onlineUsers = {};
const takenNames = new Set(); // using a Set for O(1) lookups of elements

const createUniqueName = () => {
  const name = randomAnimalName();
  return takenNames.has(name) ? createUniqueName() : name;
};

app.use("/", express.static(path.join(__dirname, "/dist")));

app.get("/", (req, res) => res.sendFile(__dirname, "/dist/bundle.html"));

io.on("connection", (socket) => {
  // add the online user to the list
  onlineUsers[socket.id] = {
    id: socket.id,
    username: createUniqueName(),
    color: randomColor({ luminosity: "light", format: "rgb" }),
  };

  // send updated user list to all clients
  io.emit("online-users", onlineUsers);

  // tell everyone this user joined the chat
  io.emit("receive-message", {
    id: uuidv4(),
    type: "alert-green",
    user: onlineUsers[socket.id],
    content: "has joined the chat",
  });

  // fires when a client sent a message
  socket.on("send-message", ({ userId, content }) => {
    // send the message to all clients (including the sender)
    io.emit("receive-message", {
      id: uuidv4(), // id for the react "key" prop
      type: "message",
      user: onlineUsers[userId],
      content,
    });
  });

  // fires when a client has disconnected (e.g. closed window)
  socket.on("disconnect", (reason) => {
    // tell everyone this user left the chat
    io.emit("receive-message", {
      id: uuidv4(),
      type: "alert-red",
      user: onlineUsers[socket.id],
      content: "has left the chat",
    });
    // send updated user list, too
    delete onlineUsers[socket.id];
    io.emit("online-users", onlineUsers);
  });
});

const port = 3333;
httpServer.listen(process.env.PORT || port, () =>
  console.log(`Server running on port ${port}`)
);
