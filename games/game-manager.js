(function () {
    const games = [
        {
            name: "Memory Card",
            description: "Match all pairs to win.",
            url: "games/memory-card/index.html"
        },
        {
            name: "Judy Game",
            description: "Reach the target score to win.",
            url: "games/snake/index.html"
        },
        {
            name: "Hangman",
            description: "Guess the word before making too many mistakes.",
            url: "games/hangman/index.html"
        },
        {
            name: "2048",
            description: "Reach the target tile to win.",
            url: "games/2048/index.html"
        },
        // {
        //     name: "Dino Run",
        //     description: "Survive until the target score.",
        //     url: "games/dino/index.html"
        // },
        {
            name: "Minesweeper",
            description: "Open enough safe cells without hitting a mine.",
            url: "games/minesweeper/index.html"
        },
        // {
        //     name: "Who Wants To Be A Millionaire",
        //     description: "Answer enough questions correctly to win.",
        //     url: "games/millionaire/index.html"
        // },
        // {
        //     name: "Tetris",
        //     description: "Reach the target score to win.",
        //     url: "games/tetris/index.html"
        // }
    ];

    const modal = document.getElementById("gameModal");
    const frame = document.getElementById("gameFrame");
    const title = document.getElementById("gameTitle");
    const desc = document.getElementById("gameDescription");
    const result = document.getElementById("gameResult");
    const closeBtn = document.getElementById("closeGameBtn");
    const playBtn = document.getElementById("playGameBtn");
    const mobileGameBtn = document.querySelector(".mobile-game-btn");

    let gameFinished = false;

    function randomLevel() {
        return Math.floor(Math.random() * 10) + 1;
    }

    function showResult(type, text) {
        result.className = `game-result show ${type}`;
        result.textContent = text;
    }

    function clearResult() {
        result.className = "game-result";
        result.textContent = "";
    }

    function openRandomGame() {
        const game = games[Math.floor(Math.random() * games.length)];

        gameFinished = false;
        clearResult();

        title.textContent = game.name;
        desc.textContent = game.description;
        frame.src = `${game.url}?t=${Date.now()}`;

        modal.classList.add("active");
    }

    function closeGame() {
        frame.src = "";
        modal.classList.remove("active");
        clearResult();
    }

    function handleWin() {
        if (gameFinished) return;
        gameFinished = true;

        const level = randomLevel();
        // Lấy xác suất gốc từ rarityPools
        const pool = rarityPools.find(p => p.level === level);
        const reward = {
            level,
            amount: pool ? pool.chance : 0  // gửi chính xác giá trị % của level
        };

        if (typeof window.applyGameReward === "function") {
            window.applyGameReward(reward);
        }

        showResult("win", `You won! Bonus: Level ${level} chance doubled for your next roll.`);
    }

    function handleLose() {
        if (gameFinished) return;
        gameFinished = true;

        showResult("lose", "You lost. No bonus this time.");
    }

    window.addEventListener("message", function (event) {
        const data = event.data;

        if (!data || typeof data !== "object") return;

        if (data.type === "GAME_WIN") {
            handleWin();
        }

        if (data.type === "GAME_LOSE") {
            handleLose();
        }
    });

    window.updateGameBonusNotice = function (reward) {
        const bonusCard = document.getElementById("bonusCard");
        const bonusValue = document.getElementById("bonusValue");

        if (!bonusCard || !bonusValue) return;

        if (!reward) {
            bonusCard.classList.remove("active");
            bonusValue.textContent = "No active bonus";
            return;
        }

        bonusCard.classList.add("active");
        bonusValue.textContent = `Level ${reward.level} bonus chance doubled → ${reward.amount * 2}%`;
    };

    if (playBtn) playBtn.addEventListener("click", openRandomGame);
    if (mobileGameBtn) mobileGameBtn.addEventListener("click", openRandomGame);
    if (closeBtn) closeBtn.addEventListener("click", closeGame);

    modal.addEventListener("click", function (event) {
        if (event.target === modal) closeGame();
    });
})();
