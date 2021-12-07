HTMLElement.prototype.renderElement = function(elName='div', attributeObj={}, configObj={}, appendAtFirst=false) {
  let el = document.createElement(elName);
  for (let key of Object.keys(attributeObj)) {
    el.setAttribute(key, attributeObj[key]);
  }
  for (let key of Object.keys(configObj)) {
    el[key] = configObj(key);
  }
  if (appendAtFirst) {
    this.appendChild(el);
  }
  return el;
}

const rtcInitConfig = {
  iceServers: [{
    urls: "stun:stun.stunprotocol.org"
  }]
}