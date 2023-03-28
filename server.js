import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

app.use("/", express.static(path.join(__dirname, "/dist")));

app.get("/", (req, res) => {
  console.log("ouch", Date.now());
  res.sendFile(__dirname, "/dist/bundle.html");
});

app.listen(3333, () => {
  console.log("server started on port 3333");
});
