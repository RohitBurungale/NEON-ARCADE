const gameCards = Array.from(document.querySelectorAll(".game-card"));
const gameGrid = document.getElementById("gameGrid");
const searchInput = document.getElementById("searchInput");
const filterButtons = Array.from(document.querySelectorAll(".filter"));
const emptyState = document.getElementById("emptyState");
const gameModal = document.getElementById("gameModal");
const gameStage = document.getElementById("gameStage");
const modalTitle = document.getElementById("modalTitle");
const gameInstructions = document.getElementById("gameInstructions");
const closeModalButton = document.getElementById("closeModal");
const scoreDisplay = document.getElementById("scoreDisplay");
const playerNameDisplay = document.getElementById("playerName");
const profileButton = document.getElementById("profileBtn");
const menuToggle = document.getElementById("menuToggle");
const mainNav = document.querySelector(".main-nav");
const randomGameButton = document.getElementById("randomGame");
const soundToggle = document.getElementById("soundToggle");
const toast = document.getElementById("toast");

const gameDetails = {
  snake: {
    title: "Neon Snake",
    category: ["arcade", "action"],
    instructions: "Use the arrow keys or on-screen controls to guide the snake."
  },
  memory: {
    title: "Memory Matrix",
    category: ["puzzle"],
    instructions: "Flip two cards at a time and find all matching pairs."
  },
  tictactoe: {
    title: "Grid Duel",
    category: ["puzzle", "arcade"],
    instructions: "Take turns placing X and O. Get three in a row to win."
  },
  reaction: {
    title: "Reflex Rush",
    category: ["action", "arcade"],
    instructions: "Wait for the box to turn green, then click as quickly as you can."
  }
};

let activeFilter = "all";
let activeGameCleanup = null;
let toastTimeout = null;
let soundEnabled = false;
let audioContext = null;

function showToast(message) {
  if (!toast) return;

  toast.textContent = message;
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.textContent = "";
  }, 3200);
}

function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value === null ? fallback : value;
  } catch (error) {
    showToast("Browser storage is unavailable. Progress may not be saved.");
    return fallback;
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    showToast("Could not save your progress in browser storage.");
    return false;
  }
}

function getScores() {
  const rawScores = readStorage("neonScores", "{}");

  try {
    const scores = JSON.parse(rawScores);
    return scores && typeof scores === "object" && !Array.isArray(scores)
      ? scores
      : {};
  } catch (error) {
    showToast("Saved scores could not be read. Starting with an empty leaderboard.");
    return {};
  }
}

function updateLeaderboard() {
  const leaderList = document.getElementById("leaderList");
  if (!leaderList) return;

  const scores = getScores();
  const entries = Object.entries(gameDetails)
    .map(([id, game]) => ({ id, title: game.title, score: Number(scores[id]) || 0 }))
    .filter(entry => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  leaderList.replaceChildren();

  entries.forEach((entry, index) => {
    const row = document.createElement("div");
    const title = document.createElement("span");
    const score = document.createElement("strong");

    title.textContent = `${index + 1}. ${entry.title}`;
    score.textContent = entry.score.toLocaleString();
    row.append(title, score);
    leaderList.appendChild(row);
  });
}

function saveScore(gameId, score) {
  const numericScore = Number(score);
  if (!gameDetails[gameId] || !Number.isFinite(numericScore) || numericScore < 0) return;

  const scores = getScores();
  const bestScore = Number(scores[gameId]) || 0;
  if (numericScore > bestScore) {
    scores[gameId] = numericScore;
    if (!writeStorage("neonScores", JSON.stringify(scores))) return;
  }

  updateLeaderboard();

  if (scoreDisplay) {
    scoreDisplay.textContent = `Best score: ${Math.max(bestScore, numericScore).toLocaleString()}`;
  }
}

function filterGames() {
  const searchTerm = searchInput ? searchInput.value.trim().toLowerCase() : "";
  let visibleCount = 0;

  gameCards.forEach(card => {
    const gameId = card.dataset.game;
    const game = gameDetails[gameId];
    if (!game) {
      card.hidden = true;
      return;
    }

    const categoryMatches = activeFilter === "all" || game.category.includes(activeFilter);
    const searchMatches = `${game.title} ${card.textContent}`.toLowerCase().includes(searchTerm);
    const isVisible = categoryMatches && searchMatches;

    card.hidden = !isVisible;
    if (isVisible) visibleCount++;
  });

  if (emptyState) emptyState.hidden = visibleCount > 0;
  if (gameGrid) gameGrid.setAttribute("aria-live", "polite");
}

function setFilter(button) {
  activeFilter = button.dataset.filter || "all";
  filterButtons.forEach(filterButton => {
    const isActive = filterButton === button;
    filterButton.classList.toggle("active", isActive);
    filterButton.setAttribute("aria-pressed", String(isActive));
  });
  filterGames();
}

function closeGame() {
  if (!gameModal) return;

  if (typeof activeGameCleanup === "function") {
    activeGameCleanup();
    activeGameCleanup = null;
  }

  gameModal.classList.remove("active");
  gameModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";

  if (gameStage) gameStage.replaceChildren();
  if (scoreDisplay) scoreDisplay.textContent = "";
}

function launchGame(gameId) {
  const game = gameDetails[gameId];
  if (!game || !gameModal || !gameStage || !modalTitle) {
    showToast("This game is not available.");
    return;
  }

  closeGame();
  modalTitle.textContent = game.title;
  if (gameInstructions) gameInstructions.textContent = game.instructions;
  if (scoreDisplay) scoreDisplay.textContent = "";

  gameModal.classList.add("active");
  gameModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";

  const startFunctions = {
    snake: window.startSnakeGame,
    memory: window.startMemoryGame,
    tictactoe: window.startTicTacToe,
    reaction: window.startReactionGame
  };
  const startGame = startFunctions[gameId];

  if (typeof startGame !== "function") {
    gameStage.textContent = "This game could not be loaded.";
    showToast(`${game.title} failed to load. Check the game script path.`);
    return;
  }

  try {
    activeGameCleanup = startGame(gameStage, saveScore) || null;
  } catch (error) {
    console.error(`Could not start ${game.title}:`, error);
    gameStage.textContent = "The game could not be started. Please try again.";
    showToast(`${game.title} encountered an error.`);
  }

  closeModalButton?.focus();
}

filterButtons.forEach(button => {
  button.addEventListener("click", () => setFilter(button));
});

searchInput?.addEventListener("input", filterGames);

gameGrid?.addEventListener("click", event => {
  const playButton = event.target.closest("[data-play]");
  if (playButton) launchGame(playButton.dataset.play);
});

randomGameButton?.addEventListener("click", () => {
  const gameIds = Object.keys(gameDetails);
  const randomIndex = Math.floor(Math.random() * gameIds.length);
  launchGame(gameIds[randomIndex]);
});

document.querySelectorAll("[data-play]").forEach(button => {
  if (!gameGrid?.contains(button)) {
    button.addEventListener("click", () => launchGame(button.dataset.play));
  }
});

closeModalButton?.addEventListener("click", closeGame);

menuToggle?.addEventListener("click", () => {
  const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isExpanded));
  menuToggle.setAttribute("aria-label", isExpanded ? "Open navigation" : "Close navigation");
  document.querySelector(".topbar")?.classList.toggle("menu-open", !isExpanded);
});

mainNav?.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => {
    menuToggle?.setAttribute("aria-expanded", "false");
    menuToggle?.setAttribute("aria-label", "Open navigation");
    document.querySelector(".topbar")?.classList.remove("menu-open");
  });
});

gameModal?.addEventListener("click", event => {
  if (event.target === gameModal) closeGame();
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape" && gameModal?.classList.contains("active")) {
    closeGame();
  }
});

profileButton?.addEventListener("click", () => {
  const currentName = playerNameDisplay?.textContent || "Player";
  const enteredName = window.prompt("Choose your player name:", currentName);
  if (enteredName === null) return;

  const playerName = enteredName.trim().slice(0, 20) || "Player";
  if (playerNameDisplay) playerNameDisplay.textContent = playerName;
  const avatar = profileButton.querySelector(".avatar");
  if (avatar) avatar.textContent = playerName.charAt(0).toUpperCase();
  writeStorage("neonPlayerName", playerName);
});

function playClickSound() {
  if (!soundEnabled || !window.AudioContext && !window.webkitAudioContext) return;

  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    audioContext = audioContext || new AudioContextClass();
    if (audioContext.state === "suspended") audioContext.resume();

    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = 660;
    gain.gain.setValueAtTime(0.035, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.08);
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.08);
  } catch (error) {
    soundEnabled = false;
    soundToggle?.setAttribute("aria-pressed", "false");
    showToast("Sound is unavailable in this browser.");
  }
}

soundToggle?.addEventListener("click", () => {
  soundEnabled = !soundEnabled;
  soundToggle.setAttribute("aria-pressed", String(soundEnabled));
  soundToggle.setAttribute("aria-label", soundEnabled ? "Turn sound effects off" : "Turn sound effects on");
  showToast(soundEnabled ? "Sound effects on." : "Sound effects off.");
});

document.addEventListener("click", event => {
  if (soundEnabled && event.target instanceof Element && event.target.closest("button")) {
    playClickSound();
  }
});

const savedPlayerName = readStorage("neonPlayerName", "Player");
if (playerNameDisplay) playerNameDisplay.textContent = savedPlayerName;
const avatar = profileButton?.querySelector(".avatar");
if (avatar) avatar.textContent = (savedPlayerName.charAt(0) || "P").toUpperCase();

const gameCount = document.getElementById("gameCount");
if (gameCount) gameCount.textContent = String(gameCards.length).padStart(2, "0");

const year = document.getElementById("year");
if (year) year.textContent = String(new Date().getFullYear());

filterButtons.forEach(button => {
  button.setAttribute("aria-pressed", String(button.classList.contains("active")));
});
filterGames();
updateLeaderboard();
