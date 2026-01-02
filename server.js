const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("."));

const server = http.createServer(app);
const io = new Server(server);

let queue = [];
let nextId = 1;
let averageServiceTime = 3;

function emitQueueUpdate() {
  const updatedQueue = queue.map((u, index) => ({
    ...u,
    position: index + 1,
    eta: index * averageServiceTime
  }));
  io.emit("queueUpdate", updatedQueue);
}

app.post("/join", (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).send("Name required");
  const user = { id: nextId++, name };
  queue.push(user);
  emitQueueUpdate();
  res.json(user);
});

app.post("/leave", (req, res) => {
  const { id } = req.body;
  queue = queue.filter(u => u.id !== id);
  emitQueueUpdate();
  res.sendStatus(200);
});

app.post("/served", (req,res)=>{
  const { id } = req.body;
  queue = queue.filter(u => u.id !== id);
  emitQueueUpdate();
  res.sendStatus(200);
});

app.post("/setServiceTime", (req,res)=>{
  const { minutes } = req.body;
  if (!minutes || minutes <=0) return res.status(400).send("Invalid time");
  averageServiceTime = minutes;
  emitQueueUpdate();
  res.sendStatus(200);
});

io.on("connection", (socket)=>{
  console.log("User connected");
  socket.emit("queueUpdate", queue.map((u,i)=>({...u, position:i+1, eta:i*averageServiceTime})));
  socket.on("disconnect", ()=>console.log("User disconnected"));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

