const PASSWORD = "mayflower"; // change if you want

const lockScreen = document.getElementById("lock-screen");
const game = document.getElementById("game");
const passwordInput = document.getElementById("password-input");
const unlockBtn = document.getElementById("unlock-btn");
const lockError = document.getElementById("lock-error");

// 🔓 auto-unlock if already unlocked
if (sessionStorage.getItem("unlocked") === "true") {
  lockScreen.remove();
  game.classList.remove("hidden");
}

unlockBtn.addEventListener("click", unlock);

passwordInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") unlock();
});

function unlock() {
  if (passwordInput.value === PASSWORD) {
    sessionStorage.setItem("unlocked", "true");
    lockScreen.remove();
    game.classList.remove("hidden");
  } else {
    lockError.classList.remove("hidden");
  }
}

// ===== 1. CREATE THE GRID =====
const grid = document.getElementById("grid");

for (let row = 0; row < 6; row++) {
  const rowDiv = document.createElement("div");
  rowDiv.className = "row";

  for (let col = 0; col < 5; col++) {
    const tile = document.createElement("div");
    tile.className = "tile";
    rowDiv.appendChild(tile);
  }

  grid.appendChild(rowDiv);
}

const rows = document.querySelectorAll(".row");

// ===== 2. ELEMENTS =====
const winMessageBox = document.getElementById("win-message");
const playAgainButton = document.getElementById("play-again");
const keyboard = document.getElementById("keyboard");
const endScreen = document.getElementById("end-screen");

// ===== 3. WORD BANK =====
const wordBank = [
  { word: "KNIFE", message: "Throw it out the window or I'll never forgive you.", hint: "Slay the Princess - object" },
  { word: "WITCH", message: "The only mistake I ever made was thinking you would help me. And I'm not going to make the same mistake twice.", hint: "Slay the Princess - princess" },
  { word: "BEAST", message: "I can hear your heart pounding from the bottom of the stairs, fledgling. You're right to be terrified. I'm so much more than you.", hint: "Slay the Princess - princess" },
  { word: "RAZOR", message: "What? Noooooo. No, I wouldn't stab you. I am just a sweet innocent Princess, trapped here for no reason.", hint: "Slay the Princess - princess" },
  { word: "THORN", message: "I'm so tired of the bad blood between us. But it's hard to let go. You've hurt me.", hint: "Slay the Princess - princess" },
  { word: "TOWER", message: "Doubt forces the hand of fealty.", hint: "Slay the Princess - Chapter" },
  { word: "PANIC", message: "Heart. Lungs. Liver. Nerves.", hint: "at the disco" },
  { word: "FRISK", message: "The Human Human, according to papyrus", hint: "Undertale" },
  { word: "SOULS", message: "See that heart? That is your SOUL, the very culmination of your being!", hint: "Undertale" },
  { word: "CHARA", message: "A long time ago, a human fell into the RUINS. Injured by its fall, the human called out for help.", hint: "Undertale" },
  { word: "HAPPY", message: "happy happy happy ~cat dancing~ happy happy happy happy happy.", hint: "xxxxx birthday! xoxo" },
  { word: "HAVOC", message: "don't be trigger happy, it only ends in sadness, trust me.", hint: "trigger happy" },
  { word: "FAITH", message: "A deadly riddle, a deadly defense, a deadly faith, a deadly class trial!", hint: "trigger happy havoc - Makoto line" },
  { word: "ELIZA", message: "HELPLEEEEEEEEEEEEEEEEEESS", hint: "The true main character of hamilton" }
];

let usedWords = JSON.parse(localStorage.getItem("usedWords")) || [];

let availableWords = wordBank.filter(
  entry => !usedWords.includes(entry.word)
);

// 🚫 NO WORDS LEFT
if (availableWords.length === 0) {
  game.classList.add("hidden");
  keyboard.classList.add("hidden");

  endScreen.classList.remove("hidden");
  endScreen.innerHTML = `
    <h2> That’s everything for now! </h2>

    <button id="reset-words">Start Over</button>
  `;

  document.getElementById("reset-words").addEventListener("click", () => {
    localStorage.removeItem("usedWords");
    location.reload();
  });

  throw new Error("No words left");
}

const chosen = availableWords[Math.floor(Math.random() * availableWords.length)];
const secretWord = chosen.word;
const winMessage = chosen.message;
const wordHint = chosen.hint;

// ===== 4. GAME STATE =====
let currentRow = 0;
let currentCol = 0;
let gameOver = false;

const keyElements = {};

// ===== 5. INPUT HANDLER =====
function handleInput(key) {
  if (gameOver) return;

  if (key.length === 1 && key.match(/[A-Z]/)) {
    if (currentCol < 5) {
      rows[currentRow].children[currentCol].textContent = key;
      currentCol++;
    }
  }

  if (key === "BACKSPACE" || key === "BACK") {
    if (currentCol > 0) {
      currentCol--;
      rows[currentRow].children[currentCol].textContent = "";
    }
  }

  if (key === "ENTER") {
    if (currentCol === 5) {
      checkRow();
      if (!gameOver && currentRow < 5) {
        currentRow++;
        currentCol = 0;
      }
    }
  }
}

document.addEventListener("keydown", (event) => {
  handleInput(event.key.toUpperCase());
});

// ===== 6. CHECK GUESS =====
function checkRow() {
  const tiles = rows[currentRow].children;
  let guessedWord = "";

  for (let i = 0; i < 5; i++) {
    const letter = tiles[i].textContent;
    guessedWord += letter;

    let status = "";

    if (letter === secretWord[i]) {
      status = "correct";
    } else if (secretWord.includes(letter)) {
      status = "present";
    } else {
      status = "absent";
    }

    tiles[i].classList.add(status);
    updateKeyColor(letter, status);
  }

  // ✅ WIN
  if (guessedWord === secretWord) {
    gameOver = true;

    usedWords.push(secretWord);
    localStorage.setItem("usedWords", JSON.stringify(usedWords));

    const tries = currentRow + 1;

    winMessageBox.innerHTML = `
      <strong>${winMessage}</strong><br>
      You solved it in ${tries} ${tries === 1 ? "try" : "tries"}.
    `;

    winMessageBox.classList.remove("hidden");

    launchConfetti();

    keyboard.classList.add("fade-out");
    setTimeout(() => keyboard.classList.add("hidden"), 500);

    playAgainButton.textContent = "Play again";
    playAgainButton.classList.remove("hidden");
    return;
  }

  // ❌ LOSS (used all rows)
  if (currentRow === 5) {
    gameOver = true;

    winMessageBox.innerHTML = `
      <strong>Not this time.</strong><br>
      Want to try again with the same word?
    `;
    winMessageBox.classList.remove("hidden");

    playAgainButton.textContent = "Try again";
    playAgainButton.classList.remove("hidden");
  }
}


// ===== 7. KEY COLORS =====
function updateKeyColor(letter, status) {
  const key = keyElements[letter];
  if (!key) return;

  if (status === "correct") {
    key.className = "key correct";
  } else if (status === "present" && !key.classList.contains("correct")) {
    key.classList.add("present");
  } else if (!key.classList.contains("correct") && !key.classList.contains("present")) {
    key.classList.add("absent");
  }
}

// ===== 8. HINT =====
const hintBtn = document.getElementById("hint-btn");
const hintText = document.getElementById("hint-text");

hintBtn.addEventListener("click", () => {
  hintText.textContent = `Hint: ${wordHint}`;
  hintText.classList.remove("hidden");
  hintBtn.classList.add("hidden");
});

// ===== 9. CONFETTI =====
function launchConfetti() {
  const colors = ["#9b6cff", "#6fd3ff", "#4da6ff", "#7a5cff"];
  for (let i = 0; i < 80; i++) {
    const confetti = document.createElement("div");
    confetti.className = "confetti";
    confetti.style.left = Math.random() * 100 + "vw";
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.animationDuration = 4 + Math.random() * 3 + "s";
    document.body.appendChild(confetti);
    setTimeout(() => confetti.remove(), 8000);
  }
}

// ===== 10. ON-SCREEN KEYBOARD =====
const keys = [
  ["Q","W","E","R","T","Y","U","I","O","P"],
  ["A","S","D","F","G","H","J","K","L"],
  ["ENTER","Z","X","C","V","B","N","M","BACK"]
];

keys.forEach(row => {
  const rowDiv = document.createElement("div");
  rowDiv.className = "key-row";

  row.forEach(key => {
    const button = document.createElement("button");
    button.textContent = key === "BACK" ? "⌫" : key;
    button.className = "key";

    if (key === "ENTER" || key === "BACK") button.classList.add("wide");
    button.addEventListener("click", () => handleInput(key));
    rowDiv.appendChild(button);

    if (key.length === 1) keyElements[key] = button;
  });

  keyboard.appendChild(rowDiv);
});

// ===== 11. PLAY AGAIN =====
playAgainButton.addEventListener("click", () => {
  location.reload();
});

