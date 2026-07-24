const Canvas = require("@napi-rs/canvas");
const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

async function loadImage(src) {
  if (/^https?:\/\//.test(src)) {
    const { data } = await axios.get(src, { responseType: "arraybuffer" });
    return Canvas.loadImage(Buffer.from(data));
  }
  return Canvas.loadImage(src);
}

module.exports = async function ({
  avatar,
  name
}) {

  const folder = path.join(__dirname, "../events/assets/welcome");

  const backgrounds = [
    "bg1.png",
    "bg2.png",
    "bg3.png"
  ];

  const bg =
    backgrounds[Math.floor(Math.random() * backgrounds.length)];

  const background = await loadImage(path.join(folder, bg));

  const canvas = Canvas.createCanvas(1280, 720);
  const ctx = canvas.getContext("2d");

  ctx.drawImage(background, 0, 0, 1280, 720);

  const avatarImage = await loadImage(avatar);

  ctx.save();

  ctx.beginPath();
  ctx.arc(170, 360, 110, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();

  ctx.drawImage(avatarImage, 60, 250, 220, 220);

  ctx.restore();

  ctx.lineWidth = 8;
  ctx.strokeStyle = "#ffffff";

  ctx.beginPath();
  ctx.arc(170, 360, 110, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 60px Sans";

  ctx.fillText(name, 340, 320);

  ctx.font = "38px Sans";

  ctx.fillStyle = "#e6e6e6";

  ctx.fillText("WELCOME TO THE GROUP", 340, 390);

  const output = path.join(
    __dirname,
    "../events/tmp",
    `welcome_${Date.now()}.png`
  );

  await fs.ensureDir(path.dirname(output));

  await fs.writeFile(output, await canvas
