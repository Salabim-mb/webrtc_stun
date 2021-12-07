const peerConnections = {};
const config = {
  iceServers: [
    {
      "urls": "stun:stun.l.google.com:19302",
    },
  ]
};

const videoElement = document.querySelector("video");
const audioSelect = document.querySelector("select#audioSource");
const videoSelect = document.querySelector("select#videoSource");

const broadcasterSocket = io.connect(window.location.origin);

broadcasterSocket.on("answer", (id, description) => {
  peerConnections[id].setRemoteDescription(description);
});

broadcasterSocket.on("spectate", id => {
  const peerConnection = new RTCPeerConnection(config);
  peerConnections[id] = peerConnection;

  let stream = videoElement.srcObject;
  stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));

  peerConnection.onicecandidate = event => {
    if (event.candidate) {
      broadcasterSocket.emit("candidate", id, event.candidate);
    }
  };

  peerConnection
    .createOffer()
    .then(sdp => peerConnection.setLocalDescription(sdp))
    .then(() => {
      broadcasterSocket.emit("offer", id, peerConnection.localDescription);
    });
});

broadcasterSocket.on("candidate", (id, candidate) => {
  peerConnections[id].addIceCandidate(new RTCIceCandidate(candidate));
});

broadcasterSocket.on("peer_disconnect", id => {
  peerConnections[id].close();
  delete peerConnections[id];
});

window.onunload = window.onbeforeunload = () => {
  broadcasterSocket.close();
};

// Get camera and microphone


audioSelect.onchange = getStream;
videoSelect.onchange = getStream;

getStream()
  .then(() => navigator.mediaDevices.enumerateDevices())
  .then((deviceInfos) => {
    window.deviceInfos = deviceInfos;
    for (const deviceInfo of deviceInfos) {
      const option = document.createElement("option");
      option.value = deviceInfo.deviceId;
      if (deviceInfo.kind === "audioinput") {
        option.text = deviceInfo.label || `Microphone ${audioSelect.length + 1}`;
        audioSelect.appendChild(option);
      } else if (deviceInfo.kind === "videoinput") {
        option.text = deviceInfo.label || `Camera ${videoSelect.length + 1}`;
        videoSelect.appendChild(option);
      }
    }
  });

function getStream() {
  if (window.stream) {
    window.stream.getTracks().forEach(track => {
      track.stop();
    });
  }
  const audioSource = audioSelect.value;
  const videoSource = videoSelect.value;
  const constraints = {
    audio: { deviceId: audioSource ? { exact: audioSource } : undefined },
    video: { deviceId: videoSource ? { exact: videoSource } : undefined }
  };
  return navigator.mediaDevices
    .getUserMedia(constraints)
    .then((stream) => {
      window.stream = stream;
      audioSelect.selectedIndex = [...audioSelect.options].findIndex(
        option => option.text === stream.getAudioTracks()[0].label
      );
      videoSelect.selectedIndex = [...videoSelect.options].findIndex(
        option => option.text === stream.getVideoTracks()[0].label
      );
      videoElement.srcObject = stream;
      broadcasterSocket.emit("broadcast");
    })
    .catch(handleError);
}

function handleError(error) {
  console.error("Error: ", error);
}