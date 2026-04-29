const SITE_PASSWORD = "080426";

const lockScreen = document.getElementById("lockScreen");
const passwordInput = document.getElementById("passwordInput");
const unlockBtn = document.getElementById("unlockBtn");
const lockError = document.getElementById("lockError");

let oneRollBonus = null;

function getPoolsWithBonus() {
    if (!oneRollBonus) return rarityPools;

    // Tạo bản sao và áp dụng bonus
    let modifiedPools = rarityPools.map(pool => {
        if (pool.level === oneRollBonus.level) {
            const newChance = Math.min(100, Math.round(pool.chance * oneRollBonus.multiplier));
            return { ...pool, chance: newChance };
        }
        return { ...pool };
    });

    // Tính tổng chance sau bonus
    const total = modifiedPools.reduce((sum, p) => sum + p.chance, 0);

    // Nếu tổng > 100%, ta scale tất cả xuống để tổng = 100%
    if (total > 100) {
        const scale = 100 / total;
        modifiedPools = modifiedPools.map(pool => ({
            ...pool,
            chance: Math.round(pool.chance * scale * 100) / 100   // giữ 2 chữ số thập phân
        }));
    }

    return modifiedPools;
}

function consumeRollBonus() {
    oneRollBonus = null;

    if (typeof window.updateGameBonusNotice === "function") {
        window.updateGameBonusNotice(null);
    }
}

window.applyGameReward = function (reward) {
    oneRollBonus = reward;

    if (typeof window.updateGameBonusNotice === "function") {
        window.updateGameBonusNotice(reward);
    }
};

function unlockSite() {
    const value = passwordInput.value.trim();

    if (!/^\d{6}$/.test(value)) {
        lockError.textContent = "Password must be exactly 6 digits.";
        return;
    }

    if (value !== SITE_PASSWORD) {
        lockError.textContent = "Incorrect password. Try again based on the hint.";
        passwordInput.value = "";
        passwordInput.focus();
        return;
    }

    sessionStorage.setItem("loveMessageUnlocked", "true");
    lockScreen.classList.add("unlocked");

    setTimeout(() => {
        lockScreen.style.display = "none";
    }, 450);
}

if (sessionStorage.getItem("loveMessageUnlocked") === "true") {
    lockScreen.style.display = "none";
}

if (unlockBtn) unlockBtn.addEventListener("click", unlockSite);

if (passwordInput) {
    passwordInput.addEventListener("input", () => {
        passwordInput.value = passwordInput.value.replace(/\D/g, "").slice(0, 6);
        lockError.textContent = "";
    });

    passwordInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") unlockSite();
    });
}

const rarityPools = [
    {
        level: 1,
        shortName: "Very Common",
        fullLabel: "A person",
        description: "Light and everyday messages — easy to send, easy to receive, and perfect for quietly showing care.",
        chance: 40,
        messages: [
            "Chỉ muốn nhắc cô rằng hôm nay có một người vẫn đang nhớ cô.",
            "Chúc người đẹp một ngày làm việc thật 'đáng yêu' nhé, nhớ ăn uống đầy đủ nữa.",
            "Nụ cười của cô ngoan xinh yêu lắm, nhớ mỉm cười mỗi ngày nhé. Quên là mình phạt đấy."
        ]
    },
    {
        level: 2,
        shortName: "Common",
        fullLabel: "with",
        description: "Sweet and noticeable messages that already carry a little charm, attention, and quiet fondness.",
        chance: 32,
        messages: [
            "Biết là có người bận nhưng thỉnh thoảng cũng nói nhớ người ta một cái, người ta cũng biết chờ mong đấy.",
            "Cười một cái xem nào. Xinh yêu có thể chụp ảnh gửi mình để tích điểm cho 'hộp quà bí ẩn' nhé.",
            "Có ai nói rằng cô rất đáng yêu chưa? Đúng rồi ấy, vừa đáng yêu lại vừa đáng yêu."
        ]
    },
    {
        level: 3,
        shortName: "Fairly Common",
        fullLabel: "high",
        description: "Messages that feel more personal, like someone is slowly becoming part of your everyday routine.",
        chance: 16,
        messages: [
            "Lúc tắm mình sẽ thường hay mở nhạc để nghe, lúc trước tay sẽ luôn gõ trên thanh tìm kiếm tiktok là từ khóa 'nhạc buồn' quen thuộc. Nhưng giờ chữ 'buồn' biến mất rồi, chắc tại có thêm một 'niềm vui'.",
            "Nếu ngày làm việc hôm nay không nhẹ nhàng với cô này, thì để mình nhẹ nhàng nhé.",
            "Bình thường giờ giấc của mình sẽ không cố định. Từ ngày có một người xuất hiện, giờ thức giấc chính là 'chào buổi sáng', giờ đi ngủ sẽ là 'chúc ngủ ngon'."
        ]
    },
    {
        level: 4,
        shortName: "Occasionally Available",
        fullLabel: "self-esteem",
        description: "Playful messages with teasing energy — light flirting, joking around, and getting comfortable with each other.",
        chance: 11,
        messages: [
            "Mình có nhiều điểm xấu, hay là em đồng ý làm điểm tốt duy nhất của mình nhé?",
            "Nếu cảm thấy cô đơn quá thì có thể nhìn vào gương, trước mặt chính là người mà mình thương.",
            "Có nhiều lúc tôi sẽ hơn thua xem ai là người nhắn tin trước. Nên là nếu thấy tin nhắn tới, tức là tôi nhớ cô này lắm rồi.",
            "QB chắc là cũng cảm thấy HMie rất thiếu đòn, thế mỗi lần gặp nhau lại cho cô này đánh một cái nhé."
        ]
    },
    {
        level: 5,
        shortName: "Hard to Find",
        fullLabel: "will not",
        description: "Gentle but meaningful messages that show patience, care, and a willingness to listen and adjust for each other.",
        chance: 8,
        messages: [
            {
                quote: "Không ai hài lòng về nơi mình đang ở.",
                source: "Hoàng tử bé",
                text: "Mình hy vọng cô này sẽ cảm thấy hài lòng khi ở bên cạnh mình. Còn nếu không hài lòng thì vui lòng gửi phản hồi chi tiết cho người viết nhé."
            },
            "Mình biết cô này là người giỏi gánh vác nhiều thứ, nhưng mà lúc yếu lòng có thể tựa vào vai mình. Như đã nói từ trước, mình là người lưng dài vai rộng.",
            "Có mệt mỏi hay tâm sự gì đấy thì cứ kể mình nghe. Mình là người trung hòa, vui thì mình trêu lại, buồn thì ngồi đấy mình an ủi.",
            "Mình là một người đôi khi hơi cọc tính, nhưng yên tâm, chắc chắn mình sẽ không lớn tiếng với QB.",
            "Nếu có lúc cô này cảm thấy không hài lòng về điểm nào đó của mình, cứ thẳng thắn nói nhé. Mình là trẻ ngoan, biết hư sẽ sửa lỗi."
        ]
    },
    {
        level: 6,
        shortName: "Very Rare",
        fullLabel: "casually",
        description: "Messages that acknowledge feelings are growing — sincere, patient, and no longer just casual interest.",
        chance: 5,
        messages: [
            "Kể cho mình nghe về 3 thứ hoặc 3 chuyện mà QB thích nhất được không?",
            "Giữa một vạn người, thì mình cũng muốn trở thành người mà QB 'thân thuộc'.",
            "Cô sợ câu chuyện này đang hơi quá nhanh, nhưng cảm xúc là thế mà. Chỉ cần cảm xúc này là sự chân thành, thời gian cũng không quan trọng đến thế."
        ]
    },
    {
        level: 7,
        shortName: "Rare",
        fullLabel: "say",
        description: "Messages that begin to hint at serious affection — not a full confession yet, but the feelings are clearly there.",
        chance: 3.5,
        messages: [
            {
                quote: "Có thể có hàng triệu bông hồng trên toàn thế giới, nhưng cậu là bông hồng duy nhất của tớ, bông hồng độc nhất vô nhị.",
                source: "Hoàng tử bé",
                text: "Những bông hồng khác có đẹp đến đâu cũng chỉ để thưởng thức rồi thôi, còn bông hồng mà mình dành trọn tâm tư chăm sóc mới là bông hồng quý giá nhất."
            },
            {
                quote: "Cậu phải mãi mãi có trách nhiệm về những gì cậu đã cảm hoá. Cậu phải có trách nhiệm đối với hoa hồng của cậu.",
                source: "Hoàng tử bé",
                text: "Mình lỡ có tình cảm hơi nhiều với Quí Bình rồi, Quí Bình chịu trách nhiệm đi nhé."
            },
            "Đôi khi cách thể hiện tình cảm của mỗi người mỗi khác nhau, nhưng mà toi nghĩ nếu không cảm nhận được thì tức là không có. Hy vọng cô này cảm nhận được tình cảm mà mình dành cho cổ.",
            "Mình dễ thích một người, nhưng sẽ không thích một lúc nhiều người.",
            "Nếu câu chuyện của chúng ta có một bước chuyển tiếp tích cực, thì QB sẽ là người đầu tiên trong vạn điều đầu tiên.",
            "Tình cảm của LNN dành cho CHM chính là cách mình yêu. Tình cảm của CHM dành cho LNN chính là cách mình thể hiện.",
            "Khi yêu đương với một người, QB sẽ mong muốn một kết quả lâu dài nào cho cả hai?",
        ]
    },
    {
        level: 8,
        shortName: "Valuable",
        fullLabel: "I",
        description: "Messages that explore expectations, values, and the kind of relationship both people may truly want.",
        chance: 2.5,
        messages: [
            "Giữa 'người đối xử tốt với tất cả mọi người' và 'người chỉ tốt với mỗi mình em' thì QB sẽ muốn đối phương là kiểu người nào hơn?",
            "QB sẽ vì chuyện gì mà chia tay? Hãy nêu ra ba trường hợp có thể dẫn đến kết quả đó.",
            "Điều mà QB ghét nhất trong một mối quan hệ yêu đương là gì?",
            "Cô sẽ thích mối quan hệ yêu đương nào hơn? Nồng nhiệt hay là bình yên."
        ]
    },
    {
        level: 9,
        shortName: "Very Valuable",
        fullLabel: "miss",
        description: "Rare messages that lean into attraction, jealousy, tension, and the more sensitive sides of liking someone.",
        chance: 1.5,
        messages: [
            "QB chắc là có ghen với nữ nhân, thế có ghen với nam nhân không nhỉ?",
            "QB thích mình lúc đứng đắn hay là không đứng đắn hơn?",
            "Ngoài ôm ra thì còn những hành động 'thân mật' nào mà cô này thích không?",
            "Có người bảo quá trình đang nhanh quá, nên mình vẫn đợi. Đợi một ngày người ta cảm thấy phù hợp rồi thì mình liền xin danh phận.",
            "Từ lúc quen biết đến hiện tại, có những hành động hay lời nhắn nào của HMie làm QB khó chịu hay không thích không? Cụ thể là?",
            "Trong thang điểm 100, đối với QB thì HMie được bao nhiêu điểm? Hãy giải trình cụ thể cho từng điểm bằng tối thiểu 2 từ."
        ]
    },
    {
        level: 10,
        shortName: "Extremely Rare",
        fullLabel: "you",
        description: "The rarest messages — vulnerable, honest, and meant for moments when both sides are ready to be real.",
        chance: 0.5,
        messages: [
            "Mình đã chuẩn bị sẵn sàng cả rồi, chỉ chờ đến thời điểm thích hợp thì mình muốn gặp em để 'hợp thức hóa' mối quan hệ của tụi mình thôi.",
            "Tự nhiên lại gặp cô này ở thời điểm bản thân chưa có gì trong tay hết, thật sự đáng trách. Xin lỗi yêu dấu của mình nhé.",
            
        ]
    }
];

const openBtn = document.getElementById("openBtn");
const hideBtn = document.getElementById("hideBtn");
const mobileRollBtn = document.querySelector(".mobile-roll-btn");
const mobileHideBtn = document.querySelector(".mobile-hide-btn");
const messageText = document.getElementById("messageText");
const quoteBox = document.getElementById("quoteBox");
const quoteText = document.getElementById("quoteText");
const quoteSource = document.getElementById("quoteSource");
const messageCount = document.getElementById("messageCount");
const placeholder = document.getElementById("placeholder");
const messageBox = document.getElementById("messageBox");
const burst = document.getElementById("burst");
const hearts = document.getElementById("hearts");
const rouletteTrack = document.getElementById("rouletteTrack");
const rouletteViewport = document.getElementById("rouletteViewport");
const rouletteStatus = document.getElementById("rouletteStatus");
const rarityName = document.getElementById("rarityName");
const rarityDesc = document.getElementById("rarityDesc");
const resultBadge = document.getElementById("resultBadge");
const rarityLegend = document.getElementById("rarityLegend");

let isRolling = false;
let rollTimeout = null;

const totalMessages = rarityPools.reduce((sum, pool) => sum + pool.messages.length, 0);
messageCount.textContent = `${totalMessages} messages in the pool`;

function randomFrom(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function weightedPick(pools) {
    const totalChance = pools.reduce((sum, pool) => sum + pool.chance, 0);
    let random = Math.random() * totalChance;

    for (const pool of pools) {
        random -= pool.chance;
        if (random <= 0) return pool;
    }

    return pools[pools.length - 1];
}

function createLegend() {
    rarityLegend.innerHTML = "";

    rarityPools.forEach(pool => {
        const item = document.createElement("div");
        item.className = "legend-item";

        item.innerHTML = `
            <div class="legend-left">
                <div class="legend-dot dot-${pool.level}"></div>
                <div class="legend-main">
                    <div class="legend-title">${pool.shortName}</div>
                    <div class="legend-level">Lv.${pool.level}</div>
                </div>
            </div>
            <div class="legend-meta">
                <div class="legend-count">${pool.messages.length} msg</div>
                <div class="legend-chance">${pool.chance}%</div>
            </div>
        `;

        rarityLegend.appendChild(item);
    });
}

function createFloatingHearts() {
    const total = 16;

    for (let i = 0; i < total; i++) {
        const heart = document.createElement("div");
        heart.className = "floating-heart";
        heart.textContent = i % 4 === 0 ? "♡" : "♥";
        heart.style.left = `${Math.random() * 100}%`;
        heart.style.fontSize = `${12 + Math.random() * 18}px`;
        heart.style.animationDuration = `${8 + Math.random() * 10}s`;
        heart.style.animationDelay = `${Math.random() * 8}s`;
        heart.style.opacity = `${0.18 + Math.random() * 0.35}`;
        hearts.appendChild(heart);
    }
}

function createCard(pool) {
    const item = document.createElement("div");
    item.className = `gacha-item rarity-${pool.level}`;

    item.innerHTML = `
    <div class="gacha-tier">${pool.fullLabel}</div>
    <div class="gacha-name">${pool.shortName}</div>
    <div class="gacha-mini">Chance: ${pool.chance}%</div>
  `;

    return item;
}

function buildRoulette(targetPool) {
    rouletteTrack.innerHTML = "";

    const totalCards = 44;
    const targetIndex = 34;

    for (let i = 0; i < totalCards; i++) {
        if (i === targetIndex) {
            rouletteTrack.appendChild(createCard(targetPool));
        } else {
            const randomPool = weightedPick(rarityPools);
            rouletteTrack.appendChild(createCard(randomPool));
        }
    }

    return targetIndex;
}

function startRoll() {
    if (isRolling) return;

    isRolling = true;
    if (openBtn) openBtn.disabled = true;
    if (hideBtn) hideBtn.disabled = true;
    if (mobileRollBtn) mobileRollBtn.disabled = true;
    if (mobileHideBtn) mobileHideBtn.disabled = true;

    placeholder.classList.add("active");
    messageBox.classList.remove("active", "show-message");

    rouletteStatus.textContent = "Rolling the love... the winning rarity is about to appear 🌟";

    const effectivePools = getPoolsWithBonus();
    const targetPool = weightedPick(effectivePools);
    const originalPool = rarityPools.find(pool => pool.level === targetPool.level);
    const targetMessage = randomFrom(originalPool.messages);
    const targetIndex = buildRoulette(targetPool);

    rouletteTrack.style.transition = "none";
    rouletteTrack.style.transform = "translateX(0px)";
    void rouletteTrack.offsetWidth;

    const firstCard = rouletteTrack.querySelector(".gacha-item");
    if (!firstCard) return;

    const cardWidth = firstCard.offsetWidth;
    const trackStyle = getComputedStyle(rouletteTrack);
    const gap = parseFloat(trackStyle.columnGap || trackStyle.gap || "16");
    const step = cardWidth + gap;

    const viewportWidth = rouletteViewport.offsetWidth;
    const landingX = (viewportWidth / 2) - (targetIndex * step + cardWidth / 2) - 16;

    setTimeout(() => {
        rouletteTrack.style.transition = "transform 4.8s cubic-bezier(0.08, 0.82, 0.16, 1)";
        rouletteTrack.style.transform = `translateX(${landingX}px)`;
    }, 60);

    clearTimeout(rollTimeout);
    rollTimeout = setTimeout(() => {
        revealResult(originalPool, targetMessage);
        consumeRollBonus();
    }, 5200);
}

function revealResult(pool, message) {
    isRolling = false;
    if (openBtn) openBtn.disabled = false;
    if (hideBtn) hideBtn.disabled = false;
    if (mobileRollBtn) mobileRollBtn.disabled = false;
    if (mobileHideBtn) mobileHideBtn.disabled = false;

    rouletteStatus.textContent = `You rolled: ${pool.fullLabel} · ${pool.shortName} · ${pool.chance}%`;

    resultBadge.className = `result-badge rarity-${pool.level}`;
    resultBadge.textContent = `${pool.fullLabel} · ${pool.shortName}`;

    rarityName.textContent = `${pool.shortName}`;
    rarityDesc.textContent = `${pool.description} Chance: ${pool.chance}%`;
    
    const messageData = typeof message === "string"
        ? { text: message }
        : message;

    if (messageData.quote) {
        quoteBox.hidden = false;
        quoteText.textContent = `“${messageData.quote}”`;
        quoteSource.textContent = messageData.source ? `— ${messageData.source}` : "";
    } else {
        quoteBox.hidden = true;
        quoteText.textContent = "";
        quoteSource.textContent = "";
    }

    messageText.textContent = messageData.text;

    placeholder.classList.remove("active");
    messageBox.classList.add("active");
    messageBox.classList.remove("show-message");
    void messageBox.offsetWidth;
    messageBox.classList.add("show-message");

    createBurst(pool.level);

    if (window.innerWidth <= 980) {
        setTimeout(() => {
            const messageCard = document.getElementById("messageCard");
            if (messageCard) {
                messageCard.scrollIntoView({
                    behavior: "smooth",
                    block: "nearest"
                });
            }
        }, 120);
    }
}

function hideMessage() {
    if (isRolling) return;

    placeholder.classList.add("active");
    messageBox.classList.remove("active", "show-message");
    rouletteStatus.textContent = "Ready to roll and receive a sweet message ✨";
}

function createBurst(level) {
    burst.innerHTML = "";

    const total = 14;
    const icons = level >= 9
        ? ["✦", "💎", "✨", "✦"]
        : level >= 7
            ? ["💙", "✦", "♥", "✨"]
            : ["♥", "♡", "💙", "✦"];

    for (let i = 0; i < total; i++) {
        const piece = document.createElement("div");
        piece.className = "burst-heart";
        piece.textContent = icons[i % icons.length];

        const angle = (Math.PI * 2 * i) / total;
        const distance = 70 + Math.random() * 70;
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;

        piece.style.setProperty("--x", `${x}px`);
        piece.style.setProperty("--y", `${y}px`);
        piece.style.fontSize = `${16 + Math.random() * 12}px`;

        const colors = {
            1: "#6fa8ff",
            2: "#4daaf2",
            3: "#53b7b5",
            4: "#58bc66",
            5: "#aebf49",
            6: "#f4b648",
            7: "#f28c48",
            8: "#eb5f88",
            9: "#9f66ea",
            10: "#ffb347"
        };

        piece.style.color = colors[level] || "#6fa8ff";
        burst.appendChild(piece);
    }

    setTimeout(() => {
        burst.innerHTML = "";
    }, 1000);
}

if (openBtn) openBtn.addEventListener("click", startRoll);
if (hideBtn) hideBtn.addEventListener("click", hideMessage);
if (mobileRollBtn) mobileRollBtn.addEventListener("click", startRoll);
if (mobileHideBtn) mobileHideBtn.addEventListener("click", hideMessage);

createFloatingHearts();
createLegend();