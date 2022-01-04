HTMLElement.prototype.renderElement = function(elName='div', attributeObj={}, configObj={}, appendAtFirst=false) {
  let el = document.createElement(elName);
  for (let key of Object.keys(attributeObj)) {
    el.setAttribute(key, attributeObj[key]);
  }
  for (let key of Object.keys(configObj)) {
    el[key] = configObj[key];
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

const pad = (value) => value < 10 ? '0'+value : value;

const trDate = (_date, _format="DD.mm.YYYY HH:MM:SS.TTT") => {
  let date = _date;
  let format = _format;
  if (typeof _date === "string" || typeof _date === "number") {
    date = new Date(_date);
  }
  format = format.replace("DD", pad(date.getDate()));
  format = format.replace("mm", pad(date.getMonth() + 1));
  format = format.replace("YYYY", pad(date.getFullYear()));
  format = format.replace("HH", pad(date.getHours()));
  format = format.replace("MM", pad(date.getMinutes()));
  format = format.replace("SS", pad(date.getSeconds()));
  format = format.replace("TTT", pad(date.getMilliseconds()));

  return format;
}

const log = (alertMessage="test", severity="info") => {
  const loggerEl = document.querySelector("div#logger");
  loggerEl && loggerEl.renderElement('div', {
    class: `alert alert-${severity}`,
    role: 'alert'
  }, {
    innerHTML: `<b>${trDate(new Date())}:</b> ${alertMessage}`
  }, true);
}
