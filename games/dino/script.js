const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");

const scoreEl = document.getElementById("score");
const jumpBtn = document.getElementById("jumpBtn");
const startScreen = document.getElementById("startScreen");
const startBtn = document.getElementById("startBtn");

const TARGET_SCORE = 300;
const GROUND_Y = 210;

let dino;
let obstacles;
let score;
let speed;
let gravity;
let frame;
let finished;
let started = false;
let animationId = null;

let scale = 1;  // tỉ lệ giữa canvas hiển thị và canvas gốc

// Kích thước dino to hơn
const DINO_WIDTH = 50;   // trước là 34
const DINO_HEIGHT = 66;  // trước là 44

// Kích thước obstacle to hơn
const OBSTACLE_WIDTH = 50;  // trước ~22–36
const OBSTACLE_HEIGHT = 72; // trước ~34–52

function updateScale() {
    const displayWidth = canvas.clientWidth;
    scale = displayWidth / canvas.width;  // canvas.width = 640
}
window.addEventListener("resize", updateScale);
updateScale(); // gọi lần đầu

function sendWin() {
    if (finished) return;
    finished = true;
    parent.postMessage({ type: "GAME_WIN" }, "*");
}

function sendLose() {
    if (finished) return;
    finished = true;
    parent.postMessage({ type: "GAME_LOSE" }, "*");
}

function resetGame() {
    dino = {
        x: 58,
        y: GROUND_Y - DINO_HEIGHT,
        width: DINO_WIDTH,
        height: DINO_HEIGHT,
        velocityY: 0,
        jumping: false
    };

    obstacles = [createObstacle(680)];

    score = 0;
    speed = 5.2;
    gravity = 0.62;
    frame = 0;
    finished = false;
    started = false;

    scoreEl.textContent = score;

    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
}

function createObstacle(x) {
    const height = OBSTACLE_HEIGHT + Math.floor(Math.random() * 18);
    const width = OBSTACLE_WIDTH + Math.floor(Math.random() * 14);

    return {
        x,
        y: GROUND_Y - height,
        width,
        height
    };
}

function jump() {
    if (!started || finished) return;

    if (!dino.jumping) {
        dino.velocityY = -13.5;
        dino.jumping = true;
    }
}

function updateDino() {
    dino.y += dino.velocityY;
    dino.velocityY += gravity;

    const groundPosition = GROUND_Y - dino.height;

    if (dino.y >= groundPosition) {
        dino.y = groundPosition;
        dino.velocityY = 0;
        dino.jumping = false;
    }
}

function updateObstacles() {
    obstacles.forEach(obstacle => {
        obstacle.x -= speed;
    });

    obstacles = obstacles.filter(obstacle => obstacle.x + obstacle.width > 0);

    const lastObstacle = obstacles[obstacles.length - 1];

    if (!lastObstacle || lastObstacle.x < 410) {
        const gap = 170 + Math.random() * 160;
        obstacles.push(createObstacle(canvas.width + gap));
    }
}

function updateScore() {
    frame++;

    if (frame % 4 === 0) {
        score += 1;
        scoreEl.textContent = score;
    }

    // Điều chỉnh tốc độ tăng dần dựa trên tỉ lệ scale
    speed += 0.0018 * scale;

    if (score >= TARGET_SCORE) {
        sendWin();
    }
}

function isColliding(a, b) {
    const padding = 4;
    return (
        a.x + padding < b.x + b.width &&
        a.x + a.width - padding > b.x &&
        a.y + padding < b.y + b.height &&
        a.y + a.height - padding > b.y
    );
}

function checkCollision() {
    for (const obstacle of obstacles) {
        if (isColliding(dino, obstacle)) {
            sendLose();
            return;
        }
    }
}

function drawBackground() {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "#dbeeff";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y);
    ctx.lineTo(canvas.width, GROUND_Y);
    ctx.stroke();

    ctx.fillStyle = "#dbeeff";
    for (let i = 0; i < 8; i++) {
        const x = (i * 96 - (frame * speed * 0.35) % 96);
        ctx.fillRect(x, GROUND_Y + 14, 34, 3);
    }
}

// ================== LOAD HÌNH ==================
const dinoImg = new Image();
dinoImg.src = "../../assets/images/Nick Wilde.png";  // đường dẫn tới hình dino

const obstacleImg = new Image();
obstacleImg.src = "../../assets/images/Judy Hopps.png";  // đường dẫn tới hình thỏ

// ================== DRAW ==================
function drawDino() {
    ctx.drawImage(dinoImg, dino.x, dino.y, dino.width, dino.height);
}

function drawObstacles() {
    obstacles.forEach(obstacle => {
        ctx.drawImage(obstacleImg, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });
}

function drawEndOverlay(text) {
    ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#24528f";
    ctx.font = "800 28px Arial";
    ctx.textAlign = "center";
    ctx.fillText(text, canvas.width / 2, canvas.height / 2 - 10);
}

function updateSpeed() {
    // Xác định tốc độ dựa trên tỉ lệ scale, đồng thời giới hạn tốc độ trong phạm vi hợp lý
    const minSpeed = 4; // Tốc độ tối thiểu
    const maxSpeed = 8; // Tốc độ tối đa

    // Điều chỉnh tốc độ theo tỉ lệ scale, với giới hạn minSpeed và maxSpeed
    speed = minSpeed + (scale * 2); // Thay đổi công thức này tùy theo nhu cầu của bạn
    speed = Math.min(Math.max(speed, minSpeed), maxSpeed); // Giới hạn tốc độ
}

function gameLoop() {
    ctx.setTransform(scale, 0, 0, scale, 0, 0); // scale tất cả
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBackground();
    drawDino();
    drawObstacles();

    if (finished) {
        drawEndOverlay(score >= TARGET_SCORE ? "You won!" : "Game over");
        return;
    }

    if (started) {
        updateDino();
        updateObstacles();
        updateScore();
        checkCollision();
    }

    updateSpeed(); // Cập nhật tốc độ mỗi frame

    animationId = requestAnimationFrame(gameLoop);
}

function startGame() {
    if (started) return;

    resetGame();           // reset lại tất cả dữ liệu
    started = true;
    startScreen.classList.add("hidden");
    gameLoop();            // bắt đầu loop
}

// ==================== Event Listeners ====================

document.addEventListener("keydown", (event) => {
    const key = event.key.toLowerCase();
    if ([" ", "w", "arrowup"].includes(event.code.toLowerCase()) || key === "w" || key === "arrowup") {
        event.preventDefault();
        jump();
    }
});

jumpBtn.addEventListener("click", jump);
canvas.addEventListener("pointerdown", jump);

startBtn.addEventListener("click", startGame);

// Bắt đầu lần đầu
resetGame();   // chỉ reset, chưa chạy game