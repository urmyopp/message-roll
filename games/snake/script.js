const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const startScreen = document.getElementById("startScreen");
const startBtn = document.getElementById("startBtn");

const tileSize = 20;
const tileCount = canvas.width / tileSize;

const targetWord = "JUDYHOPPS";
const targetScore = targetWord.length;
const moveInterval = 140;

let snake;
let food;
let direction;
let nextDirection;
let score;

let finished = false;
let started = false;
let directionChanged = false;

let lastTime = 0;
let accumulator = 0;
let animationId = null;

function resetGame() {
    snake = [{ x: 10, y: 10 }];

    direction = { x: 1, y: 0 };
    nextDirection = { x: 1, y: 0 };

    score = 0;
    finished = false;
    started = false;
    directionChanged = false;

    lastTime = 0;
    accumulator = 0;

    scoreEl.textContent = score;

    randomFood();
    drawBoard();
}

function startGame() {
    if (started || finished) return;

    started = true;

    if (startScreen) {
        startScreen.classList.add("hidden");
    }

    lastTime = performance.now();
    animationId = requestAnimationFrame(gameLoop);
}

function stopGame() {
    started = false;

    if (animationId !== null) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
}

function sendWin() {
    if (finished) return;
    finished = true;
    stopGame();
    parent.postMessage({ type: "GAME_WIN" }, "*");
}

function sendLose() {
    if (finished) return;
    finished = true;
    stopGame();
    parent.postMessage({ type: "GAME_LOSE" }, "*");
}

function randomFood() {
    let newFood;

    do {
        newFood = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount)
        };
    } while (snake.some(part => part.x === newFood.x && part.y === newFood.y));

    food = newFood;
}

function roundRectPath(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}

function drawLetterBlock(x, y, letter, index) {
    const px = x * tileSize + 1;
    const py = y * tileSize + 1;
    const size = tileSize - 2;
    const radius = 5;

    const colors = [
        "#ffb15e", "#ffac54", "#ffa64b", "#ff9f42", "#ff9939",
        "#ff9432", "#ff8d28", "#ff8823", "#ff821c"
    ];

    ctx.save();

    roundRectPath(px, py, size, size, radius);
    ctx.fillStyle = colors[index % colors.length];
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 11px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(letter, px + size / 2, py + size / 2 + 0.5);

    ctx.restore();
}

function drawNickHead(x, y) {
    const px = x * tileSize;
    const py = y * tileSize;

    ctx.save();
    ctx.translate(px + tileSize / 2, py + tileSize / 2);
    ctx.scale(1.45, 1.45);
    ctx.translate(-10.5, -11);

    // === Tai trái (đã dính sát đầu) ===
    ctx.fillStyle = "#e07a2f";
    ctx.beginPath();
    ctx.moveTo(4, 6.5);
    ctx.lineTo(3.5, 1.2);
    ctx.lineTo(9.8, 7.2);
    ctx.closePath();
    ctx.fill();

    // === Tai phải ===
    ctx.beginPath();
    ctx.moveTo(10.2, 7.2);
    ctx.lineTo(16.5, 1.2);
    ctx.lineTo(16, 6.5);
    ctx.closePath();
    ctx.fill();

    // === Lòng tai trái ===
    ctx.fillStyle = "#ffe4c4";
    ctx.beginPath();
    ctx.moveTo(5.2, 6.5);
    ctx.lineTo(5.8, 3);
    ctx.lineTo(9, 7.1);
    ctx.closePath();
    ctx.fill();

    // === Lòng tai phải ===
    ctx.beginPath();
    ctx.moveTo(11, 7.1);
    ctx.lineTo(14.2, 3);
    ctx.lineTo(14.8, 6.5);
    ctx.closePath();
    ctx.fill();

    // === Đầu dạng ngũ giác - Phần trên phẳng, phần cằm NHỌN hơn ===
    ctx.fillStyle = "#e07a2f";
    ctx.beginPath();
    ctx.moveTo(3, 8);        // trái trên (phẳng)
    ctx.lineTo(17, 8);       // phải trên (phẳng ngang)
    ctx.lineTo(18.8, 13.5);  // phải giữa
    ctx.lineTo(13.2, 21.5);  // phải dưới - nhọn hơn
    ctx.lineTo(10, 23);      // điểm nhọn cằm (đỉnh dưới)
    ctx.lineTo(6.8, 21.5);   // trái dưới - nhọn hơn
    ctx.lineTo(1.2, 13.5);   // trái giữa
    ctx.closePath();
    ctx.fill();

    // === Vùng mõm trắng kem (nhọn hơn theo cằm) ===
    ctx.fillStyle = "#ffe4c4";
    ctx.beginPath();
    ctx.moveTo(10, 16.2);
    ctx.lineTo(15.2, 19.8);
    ctx.lineTo(4.8, 19.8);
    ctx.closePath();
    ctx.fill();

    // === Mũi tím sẫm ===
    ctx.fillStyle = "#4a2c6b";
    ctx.beginPath();
    ctx.ellipse(10, 15.8, 2.05, 1.35, 0, 0, Math.PI * 2);
    ctx.fill();

    // === Mắt xanh lá ===
    ctx.fillStyle = "#4ade80";
    ctx.beginPath();
    ctx.ellipse(6.3, 11.3, 1.55, 1.15, -0.1, 0, Math.PI * 2);
    ctx.ellipse(13.7, 11.3, 1.55, 1.15, 0.1, 0, Math.PI * 2);
    ctx.fill();

    // Đồng tử đen
    ctx.fillStyle = "#1a1a1a";
    ctx.beginPath();
    ctx.arc(6.4, 11.25, 0.65, 0, Math.PI * 2);
    ctx.arc(13.6, 11.25, 0.65, 0, Math.PI * 2);
    ctx.fill();

    // Highlight mắt
    ctx.fillStyle = "rgba(255,255,255,0.8)";
    ctx.beginPath();
    ctx.arc(6, 10.9, 0.32, 0, Math.PI * 2);
    ctx.arc(14, 10.9, 0.32, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

function drawJudyFood(x, y) {
    const px = x * tileSize;
    const py = y * tileSize;

    ctx.save();
    ctx.translate(px + tileSize / 2, py + tileSize / 2);
    ctx.scale(1.38, 1.38);        // Tăng scale để đầu Judy to hơn
    ctx.translate(-10, -10.5);

    // Tai dài của thỏ Judy (to hơn)
    ctx.fillStyle = "#a3b8c9";
    ctx.beginPath();
    ctx.roundRect(3.5, -2.5, 5, 13.5, 3);
    ctx.fill();

    ctx.beginPath();
    ctx.roundRect(11.5, -2.5, 5, 13.5, 3);
    ctx.fill();

    // Đỉnh tai đen (to hơn)
    ctx.fillStyle = "#2c3e50";
    ctx.beginPath();
    ctx.roundRect(3.8, -2.5, 4.4, 4.2, 1.8);
    ctx.fill();
    ctx.beginPath();
    ctx.roundRect(11.8, -2.5, 4.4, 4.2, 1.8);
    ctx.fill();

    // Lòng tai hồng nhạt
    ctx.fillStyle = "#ffccdd";
    ctx.beginPath();
    ctx.roundRect(5.2, 1, 2.2, 7.5, 1.2);
    ctx.fill();
    ctx.beginPath();
    ctx.roundRect(12.6, 1, 2.2, 7.5, 1.2);
    ctx.fill();

    // Đầu thỏ tròn (to hơn)
    ctx.fillStyle = "#a3b8c9";
    ctx.beginPath();
    ctx.arc(10, 12.8, 7.4, 0, Math.PI * 2);
    ctx.fill();

    // Vùng mõm hồng nhạt (to hơn)
    ctx.fillStyle = "#ffe0e8";
    ctx.beginPath();
    ctx.ellipse(10, 15.2, 4.1, 2.8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Mũi hồng tươi (to hơn)
    ctx.fillStyle = "#ff7eb5";
    ctx.beginPath();
    ctx.arc(10, 14.3, 1.35, 0, Math.PI * 2);
    ctx.fill();

    // Mắt tím lớn (to hơn)
    ctx.fillStyle = "#8e4dff";
    ctx.beginPath();
    ctx.arc(6.4, 10.9, 1.45, 0, Math.PI * 2);
    ctx.arc(13.6, 10.9, 1.45, 0, Math.PI * 2);
    ctx.fill();

    // Đồng tử đen
    ctx.fillStyle = "#1f2a44";
    ctx.beginPath();
    ctx.arc(6.4, 10.85, 0.62, 0, Math.PI * 2);
    ctx.arc(13.6, 10.85, 0.62, 0, Math.PI * 2);
    ctx.fill();

    // Highlight mắt
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.beginPath();
    ctx.arc(6, 10.5, 0.35, 0, Math.PI * 2);
    ctx.arc(14, 10.5, 0.35, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // body chữ
    for (let i = snake.length - 1; i >= 1; i--) {
        const part = snake[i];
        const letter = targetWord[i - 1] || "";
        drawLetterBlock(part.x, part.y, letter, i - 1);
    }

    // đầu cáo
    drawNickHead(snake[0].x, snake[0].y);

    // mồi thỏ
    drawJudyFood(food.x, food.y);
}

function update() {
    if (finished || !started) return;

    direction = nextDirection;
    directionChanged = false;

    const head = {
        x: snake[0].x + direction.x,
        y: snake[0].y + direction.y
    };

    const hitWall =
        head.x < 0 ||
        head.x >= tileCount ||
        head.y < 0 ||
        head.y >= tileCount;

    const hitSelf = snake.some(part => part.x === head.x && part.y === head.y);

    if (hitWall || hitSelf) {
        drawBoard();
        sendLose();
        return;
    }

    snake.unshift(head);

    const ateFood = head.x === food.x && head.y === food.y;

    if (ateFood) {
        score += 1;
        scoreEl.textContent = score;

        if (score >= targetScore) {
            drawBoard();
            sendWin();
            return;
        }

        randomFood();
    } else {
        snake.pop();
    }

    drawBoard();
}

function gameLoop(timestamp) {
    if (finished || !started) return;

    const deltaTime = Math.min(timestamp - lastTime, moveInterval);
    lastTime = timestamp;
    accumulator += deltaTime;

    if (accumulator >= moveInterval) {
        update();
        accumulator = 0;
    }

    animationId = requestAnimationFrame(gameLoop);
}

function setDirection(dir) {
    if (!started || finished || directionChanged) return;

    if (dir === "up" && direction.y !== 1) {
        nextDirection = { x: 0, y: -1 };
        directionChanged = true;
    }

    if (dir === "down" && direction.y !== -1) {
        nextDirection = { x: 0, y: 1 };
        directionChanged = true;
    }

    if (dir === "left" && direction.x !== 1) {
        nextDirection = { x: -1, y: 0 };
        directionChanged = true;
    }

    if (dir === "right" && direction.x !== -1) {
        nextDirection = { x: 1, y: 0 };
        directionChanged = true;
    }
}

document.addEventListener("keydown", event => {
    const key = event.key.toLowerCase();

    if (
        key === "arrowup" ||
        key === "arrowdown" ||
        key === "arrowleft" ||
        key === "arrowright"
    ) {
        event.preventDefault();
    }

    if (key === "arrowup" || key === "w") setDirection("up");
    if (key === "arrowdown" || key === "s") setDirection("down");
    if (key === "arrowleft" || key === "a") setDirection("left");
    if (key === "arrowright" || key === "d") setDirection("right");
});

document.querySelectorAll(".mobile-controls button").forEach(button => {
    button.addEventListener("click", () => {
        setDirection(button.dataset.dir);
    });
});

// tránh giật/tăng tốc khi tab mất focus rồi quay lại
window.addEventListener("blur", () => {
    lastTime = performance.now();
    accumulator = 0;
});

window.addEventListener("focus", () => {
    lastTime = performance.now();
    accumulator = 0;
});

if (startBtn) {
    startBtn.addEventListener("click", () => {
        resetGame();
        startGame();
    });
}

resetGame();