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
const shareScreenBtn = document.querySelector("button#btnScreenShare");

const broadcasterSocket = io.connect(window.location.origin);

broadcasterSocket.on("answer", (id, description) => {
  peerConnections[id].setRemoteDescription(description);
});

broadcasterSocket.on("spectate", id => {
  const peerConnection = new RTCPeerConnection(config);
  peerConnections[id] = peerConnection;
  log(id + " joins the stream", "success");

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
      log("Sending offer to spectator");
      console.log("offer send", performance.now())
    });
});

broadcasterSocket.on("candidate", (id, candidate) => {
  peerConnections[id].addIceCandidate(new RTCIceCandidate(candidate));
});

broadcasterSocket.on("peer_disconnect", (id) => {
  peerConnections[id].close();
  delete peerConnections[id];
  log("Spectator " + id + " left the stream.", "danger");
});

window.addEventListener("beforeunload", () => {
  broadcasterSocket.emit("peer_disconnect");
  broadcasterSocket.close();
  return 'broadcaster about to disconnect'
})

audioSelect.onchange = getStream;
videoSelect.onchange = getStream;

getStream()
  .then(() => navigator.mediaDevices.enumerateDevices())
  .then((deviceInfos) => {
    log("Devices discovered", "success");
    console.log("device discovery", performance.now())
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
      log("Stream discovered. Appending to video object.", "success")
      console.log("stream discovery", performance.now())
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

function getScreen() {
  let screenCaptureStream;
  navigator.mediaDevices.getDisplayMedia().then((media) => {
    log("Screen stream discovered, appending to video object", "success");
    console.log("screen discovery", performance.now())
    media.onremovetrack = media.oninactive = () => {
      console.log("Screen sharing ended");
      getStream()
    };
    videoElement.srcObject = media;
    broadcasterSocket.emit("source_change", JSON.stringify({
      media: media,
      timeSent: performance.now()
    }));
  })
}

shareScreenBtn.addEventListener("click", getScreen);

function handleError(error) {
  console.error("Error: ", error);
}

const canvas = document.querySelector("canvas");
const dumpCanvasWrapper = () => {
  const data = dumpCanvas(canvas);
  broadcasterSocket.emit("canvas_data", data);
}

canvas.addEventListener('mouseup', dumpCanvasWrapper, false)
canvas.addEventListener('touchend', dumpCanvasWrapper, false);

broadcasterSocket.on("canvas_data", (data) => {
  const img = new Image();
  img.onload = () => {
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
  };
  img.src = data;
});