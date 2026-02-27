const canvas = document.getElementById("c");
const ctx = canvas.getContext("2d");
const info = document.getElementById("info");

function resize(){
  canvas.width = innerWidth;
  canvas.height = innerHeight;
}
addEventListener("resize", resize);
resize();

let t = 0;

function draw(){
  t++;

  ctx.clearRect(0,0,canvas.width,canvas.height);

  // neon grid
  ctx.globalAlpha = 0.12;
  ctx.strokeStyle = "#00f0ff";
  const step = 40;
  for (let x=0;x<canvas.width;x+=step){ ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,canvas.height); ctx.stroke(); }
  for (let y=0;y<canvas.height;y+=step){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(canvas.width,y); ctx.stroke(); }
  ctx.globalAlpha = 1;

  // emoji placeholders
  ctx.font = "42px Segoe UI Emoji, Apple Color Emoji, Noto Color Emoji, sans-serif";
  ctx.fillText("🧍‍♂️", 120, 220);
  ctx.fillText("🧟", 240, 260);
  ctx.fillText("🧌", 360, 300);

  info.textContent = "Prototype running. Next: real maze + zombies + bosses.";

  requestAnimationFrame(draw);
}
draw();