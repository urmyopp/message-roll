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

    function randomMultiplier() {
        return Math.floor(Math.random() * 9) + 2; // random từ 2 đến 10
    }

    function handleWin() {
        if (gameFinished) return;
        gameFinished = true;

        const level = Math.floor(Math.random() * 10) + 1;        // random level 1-10
        const multiplier = Math.floor(Math.random() * 9) + 2;     // random x2 đến x10

        const pool = rarityPools.find(p => p.level === level);
        const originalChance = pool ? pool.chance : 5;

        // Tính bonusChance nhưng không cho vượt quá 100%
        let bonusChance = Math.round(originalChance * multiplier * 100) / 100;
        if (bonusChance > 100) {
            bonusChance = 100;
        }

        const reward = {
            level: level,
            multiplier: multiplier,
            originalChance: originalChance,
            bonusChance: bonusChance
        };

        if (typeof window.applyGameReward === "function") {
            window.applyGameReward(reward);
        }

        showResult("win", `You won! Bonus: Level ${level} ×${multiplier} (${originalChance}% → ${bonusChance}%)`);
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
        
        const isCapped = reward.bonusChance >= 100;
        
        bonusValue.innerHTML = `
            Level <strong>${reward.level}</strong> ×<strong>${reward.multiplier}</strong><br>
            <small>${reward.originalChance}% → <strong>${reward.bonusChance}%</strong>
            ${isCapped ? ' <span style="color:#d32f2f;">(capped at 100%)</span>' : ''}
            </small>
        `;
    };

    if (playBtn) playBtn.addEventListener("click", openRandomGame);
    if (mobileGameBtn) mobileGameBtn.addEventListener("click", openRandomGame);
    if (closeBtn) closeBtn.addEventListener("click", closeGame);

    modal.addEventListener("click", function (event) {
        if (event.target === modal) closeGame();
    });
})();