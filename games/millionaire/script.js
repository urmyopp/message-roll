let finished = false;
let currentQuestion = 0;
let currentPrize = 0;
let gameQuestions = [];

const totalQuestionToWin = 10;

const prizeLadder = [
    100000,
    200000,
    300000,
    500000,
    1000000,
    2000000,
    3000000,
    5000000,
    10000000,
    20000000
];

const questions = [
    {
        question: "What is the capital of Kazakhstan?",
        answers: ["Astana", "Almaty", "Tashkent", "Bishkek"],
        correct: 0
    },
    {
        question: "Who invented the theory of general relativity?",
        answers: ["Isaac Newton", "Albert Einstein", "Galileo Galilei", "Nikola Tesla"],
        correct: 1
    },
    {
        question: "What is the chemical symbol for the element Gold?",
        answers: ["Ag", "Au", "Pb", "Fe"],
        correct: 1
    },
    {
        question: "What is the longest river in the world?",
        answers: ["Amazon River", "Nile River", "Yangtze River", "Ganges River"],
        correct: 1
    },
    {
        question: "Which famous scientist developed the first successful polio vaccine?",
        answers: ["Louis Pasteur", "Edward Jenner", "Jonas Salk", "Alexander Fleming"],
        correct: 2
    },
    {
        question: "What is the value of Pi to 5 decimal places?",
        answers: ["3.14159", "3.14567", "3.14153", "3.14268"],
        correct: 0
    },
    {
        question: "Which element has the highest atomic number in the periodic table?",
        answers: ["Uranium", "Oganesson", "Plutonium", "Einsteinium"],
        correct: 1
    },
    {
        question: "Who was the first woman to win a Nobel Prize?",
        answers: ["Marie Curie", "Rosalind Franklin", "Dorothy Hodgkin", "Ada Lovelace"],
        correct: 0
    },
    {
        question: "What is the capital of Australia?",
        answers: ["Sydney", "Melbourne", "Canberra", "Brisbane"],
        correct: 2
    },
    {
        question: "What is the chemical formula for methane?",
        answers: ["CH3", "CH4", "C2H6", "C3H8"],
        correct: 1
    },
    {
        question: "Which country was the first to send a human into space?",
        answers: ["USA", "Russia", "China", "India"],
        correct: 1
    },
    {
        question: "What is the term for a cell's power plant?",
        answers: ["Nucleus", "Mitochondria", "Endoplasmic Reticulum", "Golgi Apparatus"],
        correct: 1
    },
    {
        question: "In which country is the city of Timbuktu located?",
        answers: ["Egypt", "Mali", "Ethiopia", "Nigeria"],
        correct: 1
    },
    {
        question: "What is the second largest planet in our solar system?",
        answers: ["Jupiter", "Saturn", "Uranus", "Neptune"],
        correct: 1
    },
    {
        question: "Which mathematical constant represents the ratio of a circle's circumference to its diameter?",
        answers: ["Euler's Number", "Pi", "Golden Ratio", "Avogadro's Number"],
        correct: 1
    },
    {
        question: "What is the name of the deepest part of the ocean?",
        answers: ["Mariana Trench", "Challenger Deep", "Puerto Rico Trench", "Tonga Trench"],
        correct: 1
    },
    {
        question: "What year did the Titanic sink?",
        answers: ["1912", "1898", "1902", "1921"],
        correct: 0
    },
    {
        question: "What is the capital city of Japan?",
        answers: ["Tokyo", "Osaka", "Kyoto", "Hiroshima"],
        correct: 0
    },
    {
        question: "Which of the following is a type of electromagnetic radiation?",
        answers: ["X-rays", "Sound Waves", "Air", "Water Waves"],
        correct: 0
    },
    {
        question: "Which famous author wrote 'War and Peace'?",
        answers: ["Leo Tolstoy", "Fyodor Dostoevsky", "Charles Dickens", "Herman Melville"],
        correct: 0
    },
    {
        question: "Which Nobel Prize did Albert Einstein win?",
        answers: ["Physics", "Chemistry", "Peace", "Literature"],
        correct: 0
    },
    {
        question: "What is the name of the galaxy in which Earth is located?",
        answers: ["Andromeda", "Milky Way", "Sombrero", "Whirlpool"],
        correct: 1
    },
    {
        question: "Which metal is liquid at room temperature?",
        answers: ["Iron", "Mercury", "Lead", "Copper"],
        correct: 1
    }
];

function formatMoney(amount) {
    return amount.toLocaleString('vi-VN') + " VND";
}

function shuffleArray(array) {
    return array.sort(function () {
        return Math.random() - 0.5;
    });
}

function startGame() {
    finished = false;
    currentQuestion = 0;
    currentPrize = 0;

    gameQuestions = shuffleArray([...questions]).slice(0, totalQuestionToWin);

    showQuestion();
}

function updatePrizeBox() {
    document.getElementById('current-prize').textContent = formatMoney(currentPrize);
}

function showQuestion() {
    if (currentQuestion >= totalQuestionToWin) {
        sendWin();
        return;
    }

    const q = gameQuestions[currentQuestion];

    document.getElementById('question-num').textContent = currentQuestion + 1;
    document.getElementById('question').textContent = q.question;
    document.getElementById('status').innerHTML = "";

    const answersDiv = document.getElementById('answers');
    answersDiv.innerHTML = "";

    q.answers.forEach(function (answer, idx) {
        const btn = document.createElement('button');
        btn.textContent = `${String.fromCharCode(65 + idx)}. ${answer}`;
        btn.onclick = function () {
            checkAnswer(idx);
        };

        answersDiv.appendChild(btn);
    });

    updatePrizeBox();
}

function checkAnswer(selected) {
    if (finished) return;

    const q = gameQuestions[currentQuestion];
    const buttons = document.querySelectorAll('.answers button');

    buttons.forEach(btn => btn.disabled = true);

    if (selected === q.correct) {
        buttons[selected].classList.add('correct');
        currentPrize = prizeLadder[currentQuestion];

        setTimeout(() => {
            currentQuestion++;
            showQuestion();
        }, 1000);
    } else {
        buttons[selected].classList.add('wrong');
        buttons[q.correct].classList.add('correct');

        setTimeout(() => {
            sendLose();
        }, 900);
    }
}

function sendWin() {
    if (finished) return;

    finished = true;
    parent.postMessage({ type: "GAME_WIN", prize: currentPrize }, "*");
    // revealBoard(true, currentPrize);
}

function sendLose() {
    if (finished) return;

    finished = true;
    parent.postMessage({ type: "GAME_LOSE", prize: currentPrize }, "*");
    // revealBoard(false, currentPrize);
}

function revealBoard(win, finalPrize) {
    const statusDiv = document.getElementById('status');

    if (win) {
        statusDiv.innerHTML = `
            <span style="color:#22c55e;">CONGRATULATIONS!</span><br>
            You won <strong>${formatMoney(finalPrize)}</strong>!
        `;
    } else {
        statusDiv.innerHTML = `
            <span style="color:#ef4444;">Game Over</span><br>
            You won <strong>${formatMoney(finalPrize)}</strong>
        `;
    }
}

startGame();