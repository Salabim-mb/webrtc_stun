// create canvas element and append it to document body
const canvas = document.querySelector("canvas");

const ctx = canvas.getContext('2d');

const resize = () => {
  ctx.canvas.width = canvas.offsetWidth;
  ctx.canvas.height = canvas.offsetHeight;
};
resize();

// last known position
let pos = { x: 0, y: 0 };

document.addEventListener('mousemove', draw, false);
document.addEventListener('mousedown', setPosition, false);
document.addEventListener('mouseup', () => {}, false) // event broadcasted by ws
document.addEventListener('mouseenter', setPosition, false);

// new position from mouse event
function setPosition(e) {
  console.log(e)
  pos.x = e.clientX - canvas.offsetLeft;
  pos.y = e.clientY - canvas.offsetTop;
}

function draw(e) {
  // left mouse button only
  if (e.buttons !== 1) return;

  ctx.beginPath();
console.log(pos.x, pos.y, canvas.offsetTop)
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#000000';

  ctx.moveTo(pos.x, pos.y);
  setPosition(e);
  ctx.lineTo(pos.x, pos.y);

  ctx.stroke();
}
