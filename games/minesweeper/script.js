const boardEl = document.getElementById("board");
const mineCountEl = document.getElementById("safeCount");
const flagModeBtn = document.getElementById("flagModeBtn");

const SIZE = 8;
const MINE_COUNT = 8;

let mines = new Set();
let openedCells = new Set();
let flaggedCells = new Set();
let finished = false;
let flagMode = false;
let firstOpen = true;

// --- Messaging ---
function sendWin() {
    if (finished) return;

    finished = true;
    parent.postMessage({ type: "GAME_WIN" }, "*");
    revealBoard(true);
}

function sendLose() {
    if (finished) return;

    finished = true;
    parent.postMessage({ type: "GAME_LOSE" }, "*");
    revealBoard(false);
}

// --- Helper functions ---
function getIndex(row, col) {
    return row * SIZE + col;
}

function getPosition(index) {
    return {
        row: Math.floor(index / SIZE),
        col: index % SIZE
    };
}

function getNeighbors(index) {
    const { row, col } = getPosition(index);
    const neighbors = [];

    for (let r = -1; r <= 1; r++) {
        for (let c = -1; c <= 1; c++) {
            if (r === 0 && c === 0) continue;

            const nr = row + r;
            const nc = col + c;

            if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE) {
                neighbors.push(getIndex(nr, nc));
            }
        }
    }

    return neighbors;
}

function countNeighborMines(index) {
    return getNeighbors(index).filter(neighbor => mines.has(neighbor)).length;
}

function getCellButton(index) {
    return boardEl.children[index];
}

// --- Game logic ---
function createMines(firstIndex) {
    mines.clear();

    const safeZone = new Set([firstIndex, ...getNeighbors(firstIndex)]);

    while (mines.size < MINE_COUNT) {
        const index = Math.floor(Math.random() * SIZE * SIZE);

        if (!safeZone.has(index)) {
            mines.add(index);
        }
    }
}

function openSingleCell(index) {
    if (openedCells.has(index) || flaggedCells.has(index)) return;

    const btn = getCellButton(index);
    const count = countNeighborMines(index);

    openedCells.add(index);

    btn.classList.add("open");
    btn.disabled = true;
    btn.textContent = count > 0 ? count : "";
}

function floodOpen(startIndex) {
    const queue = [startIndex];
    const visited = new Set();

    while (queue.length > 0) {
        const current = queue.shift();

        if (visited.has(current)) continue;
        visited.add(current);

        if (openedCells.has(current) || flaggedCells.has(current)) continue;

        openSingleCell(current);

        if (countNeighborMines(current) === 0) {
            getNeighbors(current).forEach(neighbor => {
                if (!visited.has(neighbor)) {
                    queue.push(neighbor);
                }
            });
        }
    }
}

function toggleFlag(index, btn) {
    if (finished || openedCells.has(index)) return;

    if (flaggedCells.has(index)) {
        flaggedCells.delete(index);
        btn.classList.remove("flagged");
        btn.textContent = "";
    } else {
        flaggedCells.add(index);
        btn.classList.add("flagged");
        btn.textContent = "🚩";
    }

    updateMineCount();
}

function updateMineCount() {
    mineCountEl.textContent = MINE_COUNT - flaggedCells.size;
}

function checkWin() {
    const totalSafeCells = SIZE * SIZE - MINE_COUNT;

    if (openedCells.size === totalSafeCells) {
        sendWin();
    }
}

function openCell(index, button) {
    if (finished || openedCells.has(index)) return;

    // Nếu ô đã có cờ thì click sẽ gỡ cờ
    if (flaggedCells.has(index)) {
        toggleFlag(index, button);
        return;
    }

    // Nếu đang bật Flag Mode thì click để cắm cờ
    if (flagMode) {
        toggleFlag(index, button);
        return;
    }

    // Lần mở đầu tiên mới tạo mìn
    if (firstOpen) {
        firstOpen = false;
        createMines(index);
        floodOpen(index);
        checkWin();
        return;
    }

    // Nếu bấm trúng mìn
    if (mines.has(index)) {
        button.textContent = "💣";
        button.classList.add("open", "mine");
        button.disabled = true;

        openedCells.add(index);
        sendLose();
        return;
    }

    // Nếu ô không có mìn
    if (countNeighborMines(index) === 0) {
        floodOpen(index);
    } else {
        openSingleCell(index);
    }

    checkWin();
}

function revealBoard(isWin) {
    const cells = document.querySelectorAll(".cell");

    cells.forEach((btn, index) => {
        btn.disabled = true;

        if (mines.has(index)) {
            btn.textContent = "💣";
            btn.classList.add("mine");
            return;
        }

        if (openedCells.has(index) && isWin) {
            btn.classList.add("safe-win");
        }
    });
}

// --- Flag Mode ---
function updateFlagModeButton() {
    if (!flagModeBtn) return;

    flagModeBtn.textContent = flagMode ? "Flag Mode: On" : "Flag Mode: Off";
    flagModeBtn.classList.toggle("active", flagMode);
}

// --- Board creation ---
function createBoard() {
    boardEl.innerHTML = "";

    for (let i = 0; i < SIZE * SIZE; i++) {
        const btn = document.createElement("button");

        btn.className = "cell";
        btn.type = "button";

        btn.addEventListener("click", () => openCell(i, btn));

        btn.addEventListener("contextmenu", event => {
            event.preventDefault();
            toggleFlag(i, btn);
        });

        boardEl.appendChild(btn);
    }
}

if (flagModeBtn) {
    flagModeBtn.addEventListener("click", () => {
        flagMode = !flagMode;
        updateFlagModeButton();
    });
}

// --- Initialize ---
createBoard();
updateMineCount();
updateFlagModeButton();