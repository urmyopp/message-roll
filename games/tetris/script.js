const canvas = document.getElementById('tetris');
const ctx = canvas.getContext('2d');
const nextCanvas = document.getElementById('next');
const nextCtx = nextCanvas.getContext('2d');

const BLOCK_SIZE = 24;
const COLS = 10;
const ROWS = 20;

const TARGET_SCORE_TO_WIN = 5000;   // ← Điểm để thắng game (có thể chỉnh)

let board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
let score = 0;
let linesCleared = 0;
let level = 1;
let dropInterval = 800;
let lastDropTime = Date.now();
let gameOver = false;
let paused = false;
let finished = false;

let currentPiece = null;
let nextPiece = null;

const COLORS = [
    null,
    '#00f0f0', // I
    '#0000f0', // J
    '#f0a000', // L
    '#f0f000', // O
    '#00f000', // S
    '#a000f0', // T
    '#f00000'  // Z
];

const PIECES = [
    [[1,1,1,1]],                    // I
    [[2,2,2],[2,0,0]],              // J
    [[3,3,3],[0,0,3]],              // L
    [[4,4],[4,4]],                  // O
    [[0,5,5],[5,5,0]],              // S
    [[0,6,0],[6,6,6]],              // T
    [[7,7,0],[0,7,7]]               // Z
];

const startBtn = document.getElementById('start-btn');
startBtn.addEventListener('click', () => {
    startGame();         // bắt đầu game
    startBtn.style.display = 'none';  // ẩn nút Start sau khi bấm
});

function randomPiece() {
    const type = Math.floor(Math.random() * PIECES.length);
    return {
        shape: PIECES[type],
        color: COLORS[type + 1],
        x: Math.floor(COLS / 2) - Math.floor(PIECES[type][0].length / 2), // Căn giữa tốt hơn
        y: 0,
        type: type + 1
    };
}

function drawBlock(ctx, x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    
    // Đường viền sáng + tối để khối đẹp hơn
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 2;
    ctx.strokeRect(x * BLOCK_SIZE + 1, y * BLOCK_SIZE + 1, BLOCK_SIZE - 2, BLOCK_SIZE - 2);
    
    ctx.strokeStyle = 'rgba(0,0,0,0.4)';
    ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
}

function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Vẽ các khối đã đặt
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            if (board[r][c]) {
                drawBlock(ctx, c, r, COLORS[board[r][c]]);
            }
        }
    }

    // Vẽ khối đang rơi
    if (currentPiece) {
        currentPiece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    drawBlock(ctx, currentPiece.x + x, currentPiece.y + y, currentPiece.color);
                }
            });
        });
    }
}

// ====================== SỬA LỖI NEXT PIECE ======================
function drawNext() {
    nextCtx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
    if (!nextPiece) return;

    const shape = nextPiece.shape;
    const blockSize = 20; // Kích thước khối nhỏ hơn cho ô NEXT

    // Tính toán để căn giữa khối NEXT
    const totalWidth = shape[0].length * blockSize;
    const totalHeight = shape.length * blockSize;
    const offsetX = Math.floor((nextCanvas.width - totalWidth) / 2);
    const offsetY = Math.floor((nextCanvas.height - totalHeight) / 2);

    shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                const drawX = offsetX + x * blockSize;
                const drawY = offsetY + y * blockSize;
                
                nextCtx.fillStyle = nextPiece.color;
                nextCtx.fillRect(drawX, drawY, blockSize, blockSize);
                
                nextCtx.strokeStyle = 'rgba(255,255,255,0.4)';
                nextCtx.lineWidth = 2;
                nextCtx.strokeRect(drawX + 1, drawY + 1, blockSize - 2, blockSize - 2);
            }
        });
    });
}

function collide(piece, board) {
    for (let y = 0; y < piece.shape.length; y++) {
        for (let x = 0; x < piece.shape[y].length; x++) {
            if (piece.shape[y][x] !== 0) {
                const newX = piece.x + x;
                const newY = piece.y + y;
                if (newX < 0 || newX >= COLS || newY >= ROWS || (newY >= 0 && board[newY][newX] !== 0)) {
                    return true;
                }
            }
        }
    }
    return false;
}

function mergePiece() {
    currentPiece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                board[currentPiece.y + y][currentPiece.x + x] = currentPiece.type;
            }
        });
    });
}

function clearLines() {
    let lines = 0;
    for (let r = ROWS - 1; r >= 0; r--) {
        if (board[r].every(cell => cell !== 0)) {
            board.splice(r, 1);
            board.unshift(Array(COLS).fill(0));
            lines++;
            r++;
        }
    }
    return lines;
}

function updateScore(lines) {
    const points = [0, 100, 300, 500, 800];
    score += points[lines] * level;
    linesCleared += lines;
    level = Math.floor(linesCleared / 10) + 1;
    dropInterval = Math.max(100, 800 - (level - 1) * 70);

    document.getElementById('score').textContent = score.toLocaleString('vi-VN');
    document.getElementById('level').textContent = level;
    document.getElementById('lines').textContent = linesCleared;

    // Kiểm tra điều kiện thắng
    if (score >= TARGET_SCORE_TO_WIN && !finished) {
        sendWin();
    }
}

function drop() {
    if (!currentPiece || gameOver || paused || finished) return;

    currentPiece.y++;
    if (collide(currentPiece, board)) {
        currentPiece.y--;
        mergePiece();
        const cleared = clearLines();
        if (cleared > 0) updateScore(cleared);

        // Chọn piece mới
        currentPiece = nextPiece;
        nextPiece = randomPiece();
        drawNext(); // <-- cập nhật canvas preview Next

        if (collide(currentPiece, board)) {
            gameOver = true;
            sendLose();
        }
    }
    drawBoard();
}

function rotatePiece() {
    if (!currentPiece || gameOver || paused || finished) return;
    
    const original = currentPiece.shape;
    const rotated = original[0].map((_, i) =>
        original.map(row => row[i]).reverse()
    );

    const previousShape = currentPiece.shape;
    currentPiece.shape = rotated;

    if (collide(currentPiece, board)) {
        currentPiece.shape = previousShape;
    }
    drawBoard();
}

// Controls
document.addEventListener('keydown', e => {
    if (gameOver || paused || finished) return;

    const keys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '];

    if (!keys.includes(e.key)) return;  // các phím khác bỏ qua

    e.preventDefault();  // <-- NGĂN browser scroll

    switch (e.key) {
        case 'ArrowLeft':
            currentPiece.x--;
            if (collide(currentPiece, board)) currentPiece.x++;
            break;
        case 'ArrowRight':
            currentPiece.x++;
            if (collide(currentPiece, board)) currentPiece.x--;
            break;
        case 'ArrowDown':
            drop();
            break;
        case 'ArrowUp':
        case ' ':
            rotatePiece();
            break;
    }

    drawBoard();
});

document.getElementById('pause-btn').addEventListener('click', () => {
    if (gameOver || finished) return;
    paused = !paused;
    document.getElementById('pause-btn').textContent = paused ? 'RESUME' : 'PAUSE';
});

document.getElementById('restart-btn').addEventListener('click', () => {
    location.reload();
});

// Messaging
function sendWin() {
    if (finished) return;
    finished = true;
    parent.postMessage({ type: "GAME_WIN", score: score }, "*");
    showFinalMessage(true);
}

function sendLose() {
    if (finished) return;
    finished = true;
    parent.postMessage({ type: "GAME_LOSE", score: score }, "*");
    showFinalMessage(false);
}

function showFinalMessage(win) {
    const status = document.getElementById('status');
    if (win) {
        status.innerHTML = `🎉 <span style="color:#22c55e">VICTORY!</span><br>Final Score: <strong>${score.toLocaleString('vi-VN')}</strong>`;
    } else {
        status.innerHTML = `💥 <span style="color:#ef4444">GAME OVER</span><br>Final Score: <strong>${score.toLocaleString('vi-VN')}</strong>`;
    }
}

// Start Game
function startGame() {
    board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    score = 0;
    linesCleared = 0;
    level = 1;
    dropInterval = 800;
    gameOver = false;
    paused = false;
    finished = false;

    document.getElementById('score').textContent = '0';
    document.getElementById('level').textContent = '1';
    document.getElementById('lines').textContent = '0';
    document.getElementById('status').innerHTML = '';

    currentPiece = randomPiece();
    nextPiece = randomPiece();

    drawBoard();
    drawNext();
    gameLoop();
}

// Game Loop
function gameLoop() {
    if (!gameOver && !paused && !finished) {
        const now = Date.now();
        if (now - lastDropTime > dropInterval) {
            drop();
            lastDropTime = now;
        }
    }
    drawBoard();
    requestAnimationFrame(gameLoop);
}

// startGame();