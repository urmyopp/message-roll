const boardEl = document.getElementById("board");
const highestTileEl = document.getElementById("highestTile");

const SIZE = 4;
const TARGET_TILE = 128;

let board = createEmptyBoard();
let finished = false;

function createEmptyBoard() {
    return Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
}

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

function getEmptyCells() {
    const cells = [];

    for (let row = 0; row < SIZE; row++) {
        for (let col = 0; col < SIZE; col++) {
            if (board[row][col] === 0) {
                cells.push({ row, col });
            }
        }
    }

    return cells;
}

function addRandomTile() {
    const emptyCells = getEmptyCells();

    if (!emptyCells.length) return;

    const cell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    board[cell.row][cell.col] = Math.random() < 0.9 ? 2 : 4;
}

function getHighestTile() {
    return Math.max(...board.flat());
}

function renderBoard() {
    boardEl.innerHTML = "";

    board.flat().forEach(value => {
        const tile = document.createElement("div");
        tile.className = `tile tile-${value}`;
        tile.textContent = value === 0 ? "" : value;
        boardEl.appendChild(tile);
    });

    const highest = getHighestTile();
    highestTileEl.textContent = highest;

    if (highest >= TARGET_TILE) {
        sendWin();
    } else if (!canMove()) {
        sendLose();
    }
}

function mergeLine(line) {
    const values = line.filter(value => value !== 0);
    const merged = [];

    for (let i = 0; i < values.length; i++) {
        if (values[i] === values[i + 1]) {
            merged.push(values[i] * 2);
            i++;
        } else {
            merged.push(values[i]);
        }
    }

    while (merged.length < SIZE) {
        merged.push(0);
    }

    return merged;
}

function moveLeft() {
    board = board.map(row => mergeLine(row));
}

function moveRight() {
    board = board.map(row => mergeLine([...row].reverse()).reverse());
}

function moveUp() {
    for (let col = 0; col < SIZE; col++) {
        const column = [];

        for (let row = 0; row < SIZE; row++) {
            column.push(board[row][col]);
        }

        const merged = mergeLine(column);

        for (let row = 0; row < SIZE; row++) {
            board[row][col] = merged[row];
        }
    }
}

function moveDown() {
    for (let col = 0; col < SIZE; col++) {
        const column = [];

        for (let row = 0; row < SIZE; row++) {
            column.push(board[row][col]);
        }

        const merged = mergeLine(column.reverse()).reverse();

        for (let row = 0; row < SIZE; row++) {
            board[row][col] = merged[row];
        }
    }
}

function canMove() {
    if (getEmptyCells().length > 0) return true;

    for (let row = 0; row < SIZE; row++) {
        for (let col = 0; col < SIZE; col++) {
            const value = board[row][col];

            if (row < SIZE - 1 && board[row + 1][col] === value) {
                return true;
            }

            if (col < SIZE - 1 && board[row][col + 1] === value) {
                return true;
            }
        }
    }

    return false;
}

function move(direction) {
    if (finished) return;

    const before = JSON.stringify(board);

    if (direction === "left") moveLeft();
    if (direction === "right") moveRight();
    if (direction === "up") moveUp();
    if (direction === "down") moveDown();

    const after = JSON.stringify(board);

    if (before !== after) {
        addRandomTile();
        renderBoard();
    }
}

function handleKeydown(event) {
    const key = event.key.toLowerCase();

    if (["arrowleft", "arrowright", "arrowup", "arrowdown", "w", "a", "s", "d"].includes(key)) {
        event.preventDefault();
    }

    if (key === "arrowleft" || key === "a") move("left");
    if (key === "arrowright" || key === "d") move("right");
    if (key === "arrowup" || key === "w") move("up");
    if (key === "arrowdown" || key === "s") move("down");
}

document.addEventListener("keydown", handleKeydown);

document.querySelectorAll(".mobile-controls button").forEach(button => {
    button.addEventListener("click", () => {
        move(button.dataset.move);
    });
});

addRandomTile();
addRandomTile();
renderBoard();