const QUESTIONS = [
    {
        question: "Who composed the famous piece 'Symphony No. 5'?",
        answer: "LUDWIG VAN BEETHOVEN"
    },
    {
        question: "What is the term for a piece of music with a 4/4 time signature?",
        answer: "COMMON TIME"
    },
    {
        question: "Which musical instrument has 88 keys?",
        answer: "PIANO"
    },
    {
        question: "What is the term for the speed of a piece of music?",
        answer: "TEMPO"
    },
    {
        question: "Who is known as the 'King of Pop'?",
        answer: "MICHAEL JACKSON"
    },
    {
        question: "What is the term for a group of three notes played together?",
        answer: "CHORD"
    },
    {
        question: "What is the name of the musical scale with seven notes, starting from C?",
        answer: "MAJOR SCALE"
    },
    {
        question: "Which instrument is often associated with jazz music and has six strings?",
        answer: "GUITAR"
    },
    {
        question: "What is the term for a gradual increase in volume?",
        answer: "CRESCENDO"
    },
    {
        question: "Who composed 'The Four Seasons'?",
        answer: "ANTONIO VIVALDI"
    },
    {
        question: "What is the term for a musical note that is held longer than its usual duration?",
        answer: "FERMATA"
    },
    {
        question: "What is the name of the musical symbol for silence?",
        answer: "REST"
    },
    {
        question: "Which famous composer wrote 'The Magic Flute'?",
        answer: "WOLFGANG AMADEUS MOZART"
    },
    {
        question: "What is the term for the main melody of a piece of music?",
        answer: "THEME"
    },
    {
        question: "What is the term for a musical interval of two notes that are a perfect fifth apart?",
        answer: "FIFTH"
    },
    {
        question: "What is the standard tuning for a guitar's strings?",
        answer: "EADGBE"
    },
    {
        question: "Which composer is famous for composing 'Für Elise'?",
        answer: "LUDWIG VAN BEETHOVEN"
    },
    {
        question: "What is the term for a rapid alteration between two notes?",
        answer: "TRILL"
    },
    {
        question: "What is the term for a piece of music written for an orchestra to play at the beginning of a concert?",
        answer: "OVERTURE"
    },
    {
        question: "What is the term for the distance between two notes on a piano that are adjacent?",
        answer: "HALF STEP"
    }
];

const MAX_MISTAKES = 6;

const questionEl = document.getElementById("question");
const wordBox = document.getElementById("wordBox");
const mistakesEl = document.getElementById("mistakes");
const correctCountEl = document.getElementById("correctCount");
const lettersEl = document.getElementById("letters");

const selected = QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)];
const answer = selected.answer.toUpperCase();

let guessedLetters = new Set();
let mistakes = 0;
let finished = false;

function sendWin() {
    if (finished) return;
    finished = true;
    parent.postMessage({ type: "GAME_WIN" }, "*");
    disableAllButtons();
}

function sendLose() {
    if (finished) return;
    finished = true;
    parent.postMessage({ type: "GAME_LOSE" }, "*");
    revealAnswer();
    disableAllButtons();
}

function isLetter(char) {
    return /^[A-Z]$/.test(char);
}

function getUniqueAnswerLetters() {
    return [...new Set(answer.split("").filter(isLetter))];
}

function getCorrectGuessedCount() {
    return getUniqueAnswerLetters().filter(letter => guessedLetters.has(letter)).length;
}

function renderWord() {
    const display = answer
        .split("")
        .map(char => {
            if (!isLetter(char)) return char;
            return guessedLetters.has(char) ? char : "_";
        })
        .join("");

    wordBox.textContent = display;
}

function revealAnswer() {
    wordBox.textContent = answer;
}

function renderStatus() {
    mistakesEl.textContent = mistakes;
    correctCountEl.textContent = getCorrectGuessedCount();
}

function checkWin() {
    const allLettersGuessed = getUniqueAnswerLetters()
        .every(letter => guessedLetters.has(letter));

    if (allLettersGuessed) {
        sendWin();
    }
}

function disableAllButtons() {
    document.querySelectorAll(".letters button").forEach(button => {
        button.disabled = true;
    });
}

function handleGuess(letter, button) {
    if (finished || guessedLetters.has(letter)) return;

    guessedLetters.add(letter);
    button.disabled = true;

    if (answer.includes(letter)) {
        button.classList.add("correct");
    } else {
        button.classList.add("wrong");
        mistakes += 1;
    }

    renderWord();
    renderStatus();

    if (mistakes >= MAX_MISTAKES) {
        sendLose();
        return;
    }

    checkWin();
}

function createKeyboard() {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

    alphabet.forEach(letter => {
        const button = document.createElement("button");
        button.textContent = letter;

        button.addEventListener("click", () => {
            handleGuess(letter, button);
        });

        lettersEl.appendChild(button);
    });
}

function handlePhysicalKeyboard(event) {
    const letter = event.key.toUpperCase();

    if (!isLetter(letter) || letter.length !== 1) return;

    const button = [...document.querySelectorAll(".letters button")]
        .find(btn => btn.textContent === letter);

    if (button && !button.disabled) {
        handleGuess(letter, button);
    }
}

questionEl.textContent = selected.question;

createKeyboard();
renderWord();
renderStatus();

document.addEventListener("keydown", handlePhysicalKeyboard);