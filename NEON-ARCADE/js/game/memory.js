function startMemoryGame(container, saveScore) {
  const symbols = ["🚀", "🎮", "👾", "⚡", "🌟", "🔥", "💎", "🎯"];
  let cards = [];
  let flippedCards = [];
  let matchedPairs = 0;
  let moves = 0;
  let locked = false;
  let finished = false;
  let mismatchTimeout = null;

  container.replaceChildren();

  const info = document.createElement("div");
  info.className = "memory-info";
  info.style.display = "flex";
  info.style.justifyContent = "space-between";
  info.style.gap = "20px";
  info.style.color = "#31e8f4";

  const movesDisplay = document.createElement("strong");
  const pairsDisplay = document.createElement("strong");
  info.append(movesDisplay, pairsDisplay);

  const grid = document.createElement("div");
  grid.className = "memory-grid";
  grid.setAttribute("aria-label", "Memory card game");

  const message = document.createElement("p");
  message.style.color = "#63f4aa";
  message.style.textAlign = "center";

  const restartButton = document.createElement("button");
  restartButton.className = "btn btn-primary";
  restartButton.type = "button";
  restartButton.textContent = "RESTART GAME";

  container.append(info, grid, message, restartButton);

  function shuffle(items) {
    const shuffled = [...items];
    for (let index = shuffled.length - 1; index > 0; index--) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
    }
    return shuffled;
  }

  function updateInfo() {
    movesDisplay.textContent = `Moves: ${moves}`;
    pairsDisplay.textContent = `Pairs: ${matchedPairs}/${symbols.length}`;
  }

  function createGame() {
    clearTimeout(mismatchTimeout);
    cards = shuffle([...symbols, ...symbols]);
    flippedCards = [];
    matchedPairs = 0;
    moves = 0;
    locked = false;
    finished = false;
    message.textContent = "Find all matching pairs!";
    grid.replaceChildren();

    cards.forEach((symbol, index) => {
      const card = document.createElement("button");
      card.className = "memory-card";
      card.type = "button";
      card.textContent = "?";
      card.dataset.symbol = symbol;
      card.dataset.index = String(index);
      card.setAttribute("aria-label", `Hidden card ${index + 1}`);
      card.addEventListener("click", () => flipCard(card));
      grid.appendChild(card);
    });

    updateInfo();
  }

  function flipCard(card) {
    if (locked || finished || card.classList.contains("matched") || flippedCards.includes(card)) {
      return;
    }

    card.textContent = card.dataset.symbol;
    card.setAttribute("aria-label", `Card ${Number(card.dataset.index) + 1}: ${card.dataset.symbol}`);
    flippedCards.push(card);

    if (flippedCards.length === 2) {
      moves++;
      updateInfo();
      checkMatch();
    }
  }

  function checkMatch() {
    const [first, second] = flippedCards;
    if (first.dataset.symbol === second.dataset.symbol) {
      first.classList.add("matched");
      second.classList.add("matched");
      first.disabled = true;
      second.disabled = true;
      flippedCards = [];
      matchedPairs++;
      updateInfo();

      if (matchedPairs === symbols.length) finishGame();
      return;
    }

    locked = true;
    mismatchTimeout = setTimeout(() => {
      [first, second].forEach(card => {
        card.textContent = "?";
        card.setAttribute("aria-label", `Hidden card ${Number(card.dataset.index) + 1}`);
      });
      flippedCards = [];
      locked = false;
      mismatchTimeout = null;
    }, 800);
  }

  function finishGame() {
    finished = true;
    const score = Math.max(10, 1000 - moves * 20);
    message.textContent = `You won in ${moves} moves! Score: ${score}`;
    if (typeof saveScore === "function") saveScore("memory", score);
  }

  restartButton.addEventListener("click", createGame);
  createGame();

  return () => clearTimeout(mismatchTimeout);
}
