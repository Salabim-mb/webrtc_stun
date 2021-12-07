module.exports = {
  SOCKET_STATE: {
    // debug + assessing correctness of call's state
    ERROR: "error",

    // management of calling/receiving
    OFFER: "offer",
    ANSWER: "answer",
    CANDIDATE: "candidate",

    // socket management
    CONNECT: "connection",
    DISCONNECT: "peer_disconnect",
    BROADCASTER_DISCONNECT: "broadcaster_disconnect",

    // roles
    BROADCASTER: "broadcast",
    SPECTATOR: "spectate",

    // misc - error handling, drawing, etc.
    BROADCAST_IN_PROGRESS: "broadcast_taken",
    LINE_DRAW: "line_draw",
    MESSAGE: "message",
  }
}