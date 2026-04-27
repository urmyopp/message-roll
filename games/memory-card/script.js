const images = [
    { id: "img1", src: "../../assets/images/01.jpg" },
    { id: "img2", src: "../../assets/images/02.jpg" },
    { id: "img3", src: "../../assets/images/03.jpg" },
    { id: "img4", src: "../../assets/images/04.jpg" },
    { id: "img5", src: "../../assets/images/05.jpg" },
    { id: "img6", src: "../../assets/images/06.jpg" },
    { id: "img7", src: "../../assets/images/07.jpg" },
    { id: "img8", src: "../../assets/images/08.jpg" }
];

const cards = [...images, ...images].sort(() => Math.random() - 0.5);

const grid = document.getElementById("grid");

let first = null;
let locked = false;
let matched = 0;
let finished = false;

function win() {
    if (finished) return;
    finished = true;
    parent.postMessage({ type: "GAME_WIN" }, "*");
}

cards.forEach(cardData => {
    const button = document.createElement("button");
    button.className = "card";
    button.dataset.id = cardData.id;

    button.innerHTML = `
        <div class="card-inner">
            <!-- Mặt sau (Card Back) -->
            <div class="card-back">
                <img src="../../assets/images/nick.jpg" alt="Nick Wilde">
            </div>
            
            <!-- Mặt trước (Hình ảnh) -->
            <div class="card-front">
                <img src="${cardData.src}" alt="${cardData.id}">
            </div>
        </div>
    `;

    button.addEventListener("click", () => {
        if (
            locked ||
            finished ||
            button.classList.contains("matched") ||
            button === first
        ) return;

        button.classList.add("revealed");

        if (!first) {
            first = button;
            return;
        }

        if (first.dataset.id === button.dataset.id) {
            // Match thành công
            first.classList.add("matched");
            button.classList.add("matched");

            first = null;
            matched += 2;

            if (matched === cards.length) {
                setTimeout(win, 600);   // delay nhẹ trước khi win
            }
        } else {
            locked = true;

            setTimeout(() => {
                first.classList.remove("revealed");
                button.classList.remove("revealed");
                first = null;
                locked = false;
            }, 800);   // tăng thời gian lật về một chút cho đẹp
        }
    });

    grid.appendChild(button);
});