const { SOCKET_STATE } = require("./socketState");
const port = 3030;
const publicUrl = `${__dirname}/public`;

const express = require("express");
const http = require("http");
const app = express();

let broadcaster;

const server = http.createServer(app);
const io = require("socket.io")(server);

app.use(express.static(publicUrl));

io.sockets.on(SOCKET_STATE.ERROR, (event) => {
  console.error(event)
});

io.sockets.on(SOCKET_STATE.CONNECT, (socket) => {
  socket.on(SOCKET_STATE.OFFER, (answererId, msg) => {
    socket.to(answererId).emit(SOCKET_STATE.OFFER, socket.id, msg);
  });
  socket.on(SOCKET_STATE.ANSWER, (callerId, msg) => {
    socket.to(callerId).emit(SOCKET_STATE.ANSWER, socket.id, msg);
  });
  socket.on(SOCKET_STATE.CANDIDATE, (callerId, msg) => {
    socket.to(callerId).emit(SOCKET_STATE.CANDIDATE, socket.id, msg);
  });

  socket.on(SOCKET_STATE.DISCONNECT, () => {
    if (socket.id === broadcaster) {
      broadcaster = null;
      console.log("broadcaster disconnected")
      socket.broadcast.emit(SOCKET_STATE.BROADCASTER_DISCONNECT);
    } else {
      socket.to(broadcaster).emit(SOCKET_STATE.DISCONNECT, socket.id);
    }
  });

  socket.on(SOCKET_STATE.BROADCASTER, () => {
    // if (!broadcaster || socket.id === broadcaster) {
      broadcaster = socket.id;
      console.log("new Broadcaster! id: " + socket.id)
      socket.broadcast.emit(SOCKET_STATE.BROADCASTER);
    // } else {
    //   console.log("someone tried to become a broadcaster while there's already one! id: " + socket.id);
    //   socket.to(socket.id).emit(SOCKET_STATE.BROADCAST_IN_PROGRESS);
    // }
  });
  socket.on(SOCKET_STATE.SPECTATOR, () => {
    console.log("new Spectator! id: " + socket.id);
    socket.to(broadcaster).emit(SOCKET_STATE.SPECTATOR, socket.id);
  });

  socket.on(SOCKET_STATE.SOURCE_CHANGE, () => {
    socket.broadcast.emit(SOCKET_STATE.SOURCE_CHANGE);
  })

  socket.on(SOCKET_STATE.MESSAGE, (msg) => {
    // todo
    socket.broadcast.emit(SOCKET_STATE.MESSAGE, socket.id, msg)
  });
});

server.listen(port, () => console.log(`
  Server is running on port ${port}
`
));