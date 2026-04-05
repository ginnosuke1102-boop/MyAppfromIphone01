const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const scoreEl = document.getElementById("score");
const timeEl = document.getElementById("time");
const restartBtn = document.getElementById("restart");
const leftBtn = document.getElementById("leftBtn");
const rightBtn = document.getElementById("rightBtn");

const player = {
  width: 70,
  height: 16,
  x: canvas.width / 2 - 35,
  y: canvas.height - 30,
  speed: 8,
};

let score = 0;
let timeLeft = 30;
let keys = { left: false, right: false };
let coins = [];
let gameOver = false;
let spawnTimer = 0;
let countdownInterval;

function resetGame() {
  score = 0;
  timeLeft = 30;
  keys = { left: false, right: false };
  coins = [];
  gameOver = false;
  spawnTimer = 0;
  player.x = canvas.width / 2 - player.width / 2;
  scoreEl.textContent = String(score);
  timeEl.textContent = String(timeLeft);

  clearInterval(countdownInterval);
  countdownInterval = setInterval(() => {
    if (gameOver) return;
    timeLeft -= 1;
    timeEl.textContent = String(Math.max(timeLeft, 0));
    if (timeLeft <= 0) {
      gameOver = true;
      clearInterval(countdownInterval);
    }
  }, 1000);
}

function spawnCoin() {
  const size = 18 + Math.random() * 10;
  coins.push({
    x: Math.random() * (canvas.width - size),
    y: -size,
    size,
    speed: 2 + Math.random() * 2.5,
  });
}

function update() {
  if (gameOver) return;

  if (keys.left) player.x -= player.speed;
  if (keys.right) player.x += player.speed;
  player.x = Math.max(0, Math.min(canvas.width - player.width, player.x));

  spawnTimer += 1;
  if (spawnTimer > 25) {
    spawnCoin();
    spawnTimer = 0;
  }

  coins = coins.filter((coin) => {
    coin.y += coin.speed;

    const hitX = coin.x + coin.size > player.x && coin.x < player.x + player.width;
    const hitY = coin.y + coin.size > player.y && coin.y < player.y + player.height;

    if (hitX && hitY) {
      score += 1;
      scoreEl.textContent = String(score);
      return false;
    }

    return coin.y < canvas.height + coin.size;
  });
}

function drawBackground() {
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, "#bbdefb");
  gradient.addColorStop(1, "#e8f5e9");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawPlayer() {
  ctx.fillStyle = "#1565c0";
  ctx.fillRect(player.x, player.y, player.width, player.height);
}

function drawCoins() {
  ctx.fillStyle = "#ffca28";
  coins.forEach((coin) => {
    ctx.beginPath();
    ctx.arc(coin.x + coin.size / 2, coin.y + coin.size / 2, coin.size / 2, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawEndText() {
  if (!gameOver) return;

  ctx.fillStyle = "#000000aa";
  ctx.fillRect(40, canvas.height / 2 - 80, canvas.width - 80, 120);

  ctx.fillStyle = "#fff";
  ctx.font = "bold 32px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("ゲーム終了", canvas.width / 2, canvas.height / 2 - 30);

  ctx.font = "24px sans-serif";
  ctx.fillText(`スコア: ${score}`, canvas.width / 2, canvas.height / 2 + 12);
  ctx.textAlign = "start";
}

function loop() {
  update();
  drawBackground();
  drawPlayer();
  drawCoins();
  drawEndText();
  requestAnimationFrame(loop);
}

window.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") keys.left = true;
  if (event.key === "ArrowRight") keys.right = true;
});

window.addEventListener("keyup", (event) => {
  if (event.key === "ArrowLeft") keys.left = false;
  if (event.key === "ArrowRight") keys.right = false;
});

function bindHoldButton(button, directionKey) {
  const onPress = (event) => {
    event.preventDefault();
    keys[directionKey] = true;
  };
  const onRelease = (event) => {
    event.preventDefault();
    keys[directionKey] = false;
  };

  button.addEventListener("touchstart", onPress, { passive: false });
  button.addEventListener("touchend", onRelease, { passive: false });
  button.addEventListener("touchcancel", onRelease, { passive: false });
  button.addEventListener("mousedown", onPress);
  button.addEventListener("mouseup", onRelease);
  button.addEventListener("mouseleave", onRelease);
}

bindHoldButton(leftBtn, "left");
bindHoldButton(rightBtn, "right");
restartBtn.addEventListener("click", resetGame);

resetGame();
loop();
