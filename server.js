import express from "express";
import http from "http";
import { Server } from "socket.io";

import path from "path";
import { fileURLToPath } from "url";
import randomAnimalName from 'random-animal-name';

// Create __dirname variable because it is not available in ES modules
// and we have set "type": "module" in our package.json
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Initialize express `app` to be a function handler
// Supply this function handler to an http server
// Initialize a new instance of socket.io by passing it the httpServer object
const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer);

app.use("/", express.static(path.join(__dirname, "/dist")));

app.get("/", (req, res) => res.sendFile(__dirname, "/dist/bundle.html"));


/**
 * User object structure:
 * 
 * "asidpfaosdfakp1o2": {
 *    id: "asidpfaosdfakp1o2" // the socket.id
 *    name: "clever penguin" // randomly generated animal name
 * }
 */

const onlineUsers = {};
const takenNames = new Set();

const createUniqueName = () => {
  const name = randomAnimalName();
  return takenNames.has(name) ? createUniqueName() : name;
};

io.on("connection", (socket) => {
  // add the online user
  onlineUsers[socket.id] = {
    id: socket.id,
    name: createUniqueName(),
  };

  // tell everyone else that this user joined
  io.emit("online-users", onlineUsers);

  socket.on("send-message", (message) => {
    io.emit("receive-message", message);
    console.log(message);
  })

  socket.on("disconnect", (reason) => {
    delete onlineUsers[socket.id];
    io.emit("online-users", onlineUsers);
    console.log(`The user ${socket.id} disconnected. (${reason})`);
  });
});

// const logOnlineUsers = () => {
//   console.log("===================================");
//   console.log("Here is a list of all online users:");
//   console.log(onlineUsers);
//   console.log("===================================");
// };

httpServer.listen(3333, () => {
  console.log("listening on *:3333");
});
