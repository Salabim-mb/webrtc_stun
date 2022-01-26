// create canvas element and append it to document body
// const canvas = document.querySelector("canvas");

const ctx = canvas.getContext('2d');

const resize = () => {
  ctx.canvas.width = canvas.offsetWidth;
  ctx.canvas.height = canvas.offsetHeight;
};
resize();

// last known position
let pos = { x: 0, y: 0 };

// events supporting also touch screens
canvas.addEventListener('mousemove', draw, false);
canvas.addEventListener('touchmove', draw, false);

canvas.addEventListener('mousedown', setPosition, false);
canvas.addEventListener('touchstart', setPosition, false);
// mouseup event implemented in both spectator and broadcast
canvas.addEventListener('mouseenter', setPosition, false);

// new position from mouse event
function setPosition(e) {
  pos.x = e.clientX - canvas.offsetLeft;
  pos.y = e.clientY - canvas.offsetTop;
}

function draw(e) {
  // left mouse button only
  if (e.buttons !== 1) return;

  ctx.beginPath();
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#000000';

  ctx.moveTo(pos.x, pos.y);
  setPosition(e);
  ctx.lineTo(pos.x, pos.y);

  ctx.stroke();
}
