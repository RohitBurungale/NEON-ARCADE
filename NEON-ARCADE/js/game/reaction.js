function startReactionGame(container, saveScore) {
  let state = "idle";
  let startTime = 0;
  let timeout = null;
  let bestTime = null;

  container.innerHTML = "";

  const title = document.createElement("h3");
  title.textContent = "⚡ Reflex Rush";
  title.style.color = "#00f5ff";

  const instructions = document.createElement("p");
  instructions.textContent =
    "Click START and wait for the box to turn green. Then click as quickly as possible!";
  instructions.style.textAlign = "center";
  instructions.style.color = "#8b96b5";
  instructions.style.margin = "10px 0";

  const reactionBox = document.createElement("div");
  reactionBox.className = "reaction-box";
  reactionBox.textContent = "Press START to Play";

  const result = document.createElement("h3");
  result.style.color = "#39ff88";
  result.style.marginTop = "10px";

  const bestDisplay = document.createElement("p");
  bestDisplay.style.color = "#00f5ff";

  const startButton = document.createElement("button");
  startButton.className = "btn btn-primary";
  startButton.textContent = "START GAME";

  container.appendChild(title);
  container.appendChild(instructions);
  container.appendChild(reactionBox);
  container.appendChild(result);
  container.appendChild(bestDisplay);
  container.appendChild(startButton);

  function updateBestDisplay() {
    bestDisplay.textContent =
      bestTime === null
        ? "Best: Not set yet"
        : `Best Reaction: ${bestTime} ms`;
  }

  function startGame() {
    clearTimeout(timeout);

    state = "waiting";

    reactionBox.className = "reaction-box waiting";
    reactionBox.textContent = "WAIT FOR GREEN...";
    result.textContent = "";

    startButton.disabled = true;
    startButton.textContent = "WAIT...";

    const randomDelay = Math.floor(Math.random() * 3000) + 1500;

    timeout = setTimeout(() => {
      if (state !== "waiting") return;

      state = "ready";
      startTime = performance.now();

      reactionBox.className = "reaction-box ready";
      reactionBox.textContent = "CLICK NOW!";
      startButton.disabled = false;
      startButton.textContent = "TRY AGAIN";
    }, randomDelay);
  }

  function handleReaction() {
    if (state === "waiting") {
      clearTimeout(timeout);

      state = "early";

      reactionBox.className = "reaction-box";
      reactionBox.textContent = "TOO EARLY!";
      result.textContent = "Wait until the box turns green.";
      startButton.disabled = false;
      startButton.textContent = "TRY AGAIN";

      return;
    }

    if (state === "ready") {
      const reactionTime = Math.round(performance.now() - startTime);

      state = "finished";

      reactionBox.className = "reaction-box";
      reactionBox.textContent = `${reactionTime} ms`;

      result.textContent =
        reactionTime < 200
          ? "🔥 Incredible Reflexes!"
          : reactionTime < 300
            ? "⚡ Excellent Reaction!"
            : reactionTime < 450
              ? "👍 Good Job!"
              : "Keep Practicing!";

      if (bestTime === null || reactionTime < bestTime) {
        bestTime = reactionTime;
        saveBestScore(reactionTime);
      }

      updateBestDisplay();

      if (typeof saveScore === "function") {
        // Lower reaction time means a better score.
        const points = Math.max(0, 1000 - reactionTime);
        saveScore("reaction", points);
      }

      startButton.disabled = false;
      startButton.textContent = "PLAY AGAIN";
    }
  }

  function saveBestScore(time) {
    try {
      const oldBest = Number(localStorage.getItem("neonReactionBest"));
      if (!oldBest || time < oldBest) {
        localStorage.setItem("neonReactionBest", String(time));
      }
    } catch (error) {
      if (typeof showToast === "function") {
        showToast("Could not save your best reaction time.");
      }
    }
  }

  reactionBox.addEventListener("click", handleReaction);

  startButton.addEventListener("click", () => {
    if (state === "waiting" || state === "ready") return;
    startGame();
  });

  let savedBest = 0;
  try {
    savedBest = Number(localStorage.getItem("neonReactionBest"));
  } catch (error) {
    if (typeof showToast === "function") {
      showToast("Could not load your best reaction time.");
    }
  }

  if (savedBest > 0) {
    bestTime = savedBest;
  }

  updateBestDisplay();

  return () => {
    clearTimeout(timeout);
    state = "idle";
  };
}