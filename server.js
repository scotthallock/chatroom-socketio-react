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

io.on("connection", (socket) => {
  console.log("a user connected");
  console.log("thier ID is", socket.id);
})

httpServer.listen(3333, () => {
  console.log("listening on *:3333");
});
