import express from "express";
import http from "http";
import { Server } from "socket.io";

import path from "path";
import { fileURLToPath } from "url";

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

const onlineUsers = [];

io.on("connection", (socket) => {
  console.log(`A new user ${socket.id} connected!`);

  // add the online user to the set
  onlineUsers.push(socket.id);

  io.emit("online-users", onlineUsers);

  logOnlineUsers();

  socket.on("disconnect", (reason) => {
    // delete user from array
    const index = onlineUsers.indexOf(socket.id);
    onlineUsers.splice(index, 1);


    console.log(`The user ${socket.id} disconnected because ${reason}.`);
    io.emit("online-users", onlineUsers);
  });
});

const logOnlineUsers = () => {
  console.log("===================================");
  console.log("Here is a list of all online users:");
  console.log(onlineUsers);
  console.log("===================================");
};

httpServer.listen(3333, () => {
  console.log("listening on *:3333");
});
