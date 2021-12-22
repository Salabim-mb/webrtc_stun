let peerConnection;
const config = {
  iceServers: [
    {
      "urls": "stun:stun.l.google.com:19302",
    },
  ]
};

const spectatorSocket = io.connect(window.location.origin);
const video = document.querySelector("video");
const enableAudioBtn = document.querySelector("button#enable-audio");
const disableAudioBtn = document.querySelector("button#disable-audio");

enableAudioBtn.addEventListener("click", enableAudio);
disableAudioBtn.addEventListener("click", disableAudio);

spectatorSocket.on("offer", (id, description) => {
  peerConnection = new RTCPeerConnection(config);
  peerConnection
    .setRemoteDescription(description)
    .then(() => peerConnection.createAnswer())
    .then(sdp => peerConnection.setLocalDescription(sdp))
    .then(() => {
      spectatorSocket.emit("answer", id, peerConnection.localDescription);
    });
  peerConnection.ontrack = event => {
    video.srcObject = event.streams[0];
  };
  peerConnection.onicecandidate = event => {
    if (event.candidate) {
      spectatorSocket.emit("candidate", id, event.candidate);
    }
  };
});

spectatorSocket.on("source_change", () => {
  spectatorSocket.emit("spectate");
});

spectatorSocket.on("broadcaster_disconnect", () => {
  console.log("broadcaster disconnected")
  video.srcObject = null;
})


spectatorSocket.on("candidate", (id, candidate) => {
  peerConnection
    .addIceCandidate(new RTCIceCandidate(candidate))
    .catch(e => console.error(e));
});

spectatorSocket.on("connection", () => {
  spectatorSocket.emit("spectate");
});

spectatorSocket.on("broadcast", () => {
  spectatorSocket.emit("spectate");
});

window.onunload = window.onbeforeunload = () => {
  spectatorSocket.close();
  peerConnection.close();
};

function enableAudio() {
  console.log("Enabling audio")
  video.muted = false;
}

function disableAudio() {
  console.log("Disabling audio")
  video.muted = true;
}