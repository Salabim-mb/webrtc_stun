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
  log("Offer from broadcaster received")
  peerConnection = new RTCPeerConnection(config);
  peerConnection
    .setRemoteDescription(description)
    .then(() => peerConnection.createAnswer())
    .then(sdp => peerConnection.setLocalDescription(sdp))
    .then(() => {
      spectatorSocket.emit("answer", id, peerConnection.localDescription);
      log("Session description sent to broadcaster");
    });
  peerConnection.ontrack = (event) => {
    video.srcObject = event.streams[0];
    log("Video stream received!", "success");
  };
  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      spectatorSocket.emit("candidate", id, event.candidate);
    }
  };
});

window.onload = () => {
  spectatorSocket.connect()
  log("Sending a request to join stream");
  spectatorSocket.emit("spectate");

}

spectatorSocket.on("source_change", () => {
  log("Source change! Broadcaster is now sharing his screen");
  spectatorSocket.emit("spectate");
});

spectatorSocket.on("broadcaster_disconnect", () => {
  console.log("broadcaster disconnected")
  video.srcObject = null;
  log("Broadcaster has disconnected", "danger");
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
  log("Enabling audio", "warning");
  video.muted = false;
}

function disableAudio() {
  log("Disabling audio", "warning");
  video.muted = true;
}