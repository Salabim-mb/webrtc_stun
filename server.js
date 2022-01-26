const { SOCKET_STATE } = require("./socketState");
const port = 3030;
const publicUrl = `${__dirname}/public`;

const express = require("express");
const http = require("http");
const { performance } = require("perf_hooks");
const app = express();

let broadcaster;

const server = http.createServer(app);
const io = require("socket.io")(server);

app.use(express.static(publicUrl));

io.sockets.on(SOCKET_STATE.ERROR, (event) => {
  console.error(event)
});

io.sockets.on(SOCKET_STATE.CONNECT, (socket) => {
  console.log(`id: ${socket.id}, event: ${SOCKET_STATE.CONNECT}, time since startup: ${performance.now()} ms`)
  socket.on(SOCKET_STATE.OFFER, (answererId, msg) => {
    console.log(`id: ${socket.id}, event: ${SOCKET_STATE.OFFER}, time since startup: ${performance.now()} ms`)
    socket.to(answererId).emit(SOCKET_STATE.OFFER, socket.id, msg);
  });
  socket.on(SOCKET_STATE.ANSWER, (callerId, msg) => {
    console.log(`id: ${socket.id}, event: ${SOCKET_STATE.ANSWER}, time since startup: ${performance.now()} ms`)
    socket.to(callerId).emit(SOCKET_STATE.ANSWER, socket.id, msg);
  });
  socket.on(SOCKET_STATE.CANDIDATE, (callerId, msg) => {
    console.log(`id: ${socket.id}, event: ${SOCKET_STATE.CANDIDATE}, time since startup: ${performance.now()} ms`)
    socket.to(callerId).emit(SOCKET_STATE.CANDIDATE, socket.id, msg);
  });

  socket.on(SOCKET_STATE.DISCONNECT, () => {
    console.log(`id: ${socket.id}, event: ${SOCKET_STATE.DISCONNECT}, time since startup: ${performance.now()} ms`)
    if (socket.id === broadcaster) {
      broadcaster = null;
      socket.broadcast.emit(SOCKET_STATE.BROADCASTER_DISCONNECT);
    } else {
      socket.to(broadcaster).emit(SOCKET_STATE.DISCONNECT, socket.id);
    }
  });

  socket.on(SOCKET_STATE.BROADCASTER, () => {
    console.log(`id: ${socket.id}, event: ${SOCKET_STATE.BROADCASTER}, time since startup: ${performance.now()} ms`)
    // if (!broadcaster || socket.id === broadcaster) {
      broadcaster = socket.id;
      socket.broadcast.emit(SOCKET_STATE.BROADCASTER);
    // } else {
    //   console.log("someone tried to become a broadcaster while there's already one! id: " + socket.id);
    //   socket.to(socket.id).emit(SOCKET_STATE.BROADCAST_IN_PROGRESS);
    // }
  });
  socket.on(SOCKET_STATE.SPECTATOR, () => {
    console.log(`id: ${socket.id}, event: ${SOCKET_STATE.SPECTATOR}, time since startup: ${performance.now()} ms`)
    socket.to(broadcaster).emit(SOCKET_STATE.SPECTATOR, socket.id);
  });

  socket.on(SOCKET_STATE.SOURCE_CHANGE, () => {
    console.log(`id: ${socket.id}, event: ${SOCKET_STATE.SOURCE_CHANGE}, time since startup: ${performance.now()} ms`)
    socket.broadcast.emit(SOCKET_STATE.SOURCE_CHANGE);
  })

  socket.on(SOCKET_STATE.MESSAGE, (msg) => {
    console.log(`id: ${socket.id}, event: ${SOCKET_STATE.MESSAGE}, time since startup: ${performance.now()} ms`)
    // todo
    socket.broadcast.emit(SOCKET_STATE.MESSAGE, socket.id, msg)
  });

  socket.on(SOCKET_STATE.CANVAS_DATA, (data) => {
    console.log(`id: ${socket.id}, event: ${SOCKET_STATE.CANVAS_DATA}, time since startup: ${performance.now()} ms`)
    socket.broadcast.emit(SOCKET_STATE.CANVAS_DATA, data);
  });
});

server.listen(port, () => {
  const currentTime = process.hrtime()
  console.log(`
  Server is running on port ${port}. Time: ${currentTime[0] * 1000000 + currentTime[1] / 1000} microseconds
  `)
});