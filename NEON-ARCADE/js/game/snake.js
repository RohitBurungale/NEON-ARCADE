function startSnakeGame(container, saveScore) {
  const canvas = document.createElement("canvas");
  canvas.width = 400;
  canvas.height = 400;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not supported in this browser.");

  const gridSize = 20;
  const tileCount = canvas.width / gridSize;

  let snake;
  let food;
  let dx;
  let dy;
  let score;
  let gameOver;
  let gameLoop;
  let running = false;

  container.innerHTML = "";

  const scoreDisplay = document.createElement("h3");
  scoreDisplay.style.color = "#00f5ff";

  const message = document.createElement("p");
  message.style.color = "#ff2e93";

  const restartButton = document.createElement("button");
  restartButton.className = "btn btn-primary";
  restartButton.textContent = "RESTART GAME";

  const controls = document.createElement("div");
  controls.className = "mobile-controls";

  controls.innerHTML = `
    <span></span>
    <button data-dir="up">⬆</button>
    <span></span>
    <button data-dir="left">⬅</button>
    <button data-dir="down">⬇</button>
    <button data-dir="right">➡</button>
  `;

  container.appendChild(scoreDisplay);
  container.appendChild(canvas);
  container.appendChild(message);
  container.appendChild(restartButton);
  container.appendChild(controls);

  function resetGame() {
    clearInterval(gameLoop);
    snake = [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 }
    ];

    dx = 1;
    dy = 0;
    score = 0;
    gameOver = false;

    message.textContent = "Use arrow keys to move!";
    scoreDisplay.textContent = "Score: 0";

    createFood();

    running = true;

    gameLoop = setInterval(update, 120);

    draw();
  }

  function createFood() {
    do {
      food = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount)
      };
    } while (
      snake.some(part => part.x === food.x && part.y === food.y)
    );
  }

  function update() {
    if (!running || gameOver) return;

    const head = {
      x: snake[0].x + dx,
      y: snake[0].y + dy
    };

    // Wall collision
    if (
      head.x < 0 ||
      head.y < 0 ||
      head.x >= tileCount ||
      head.y >= tileCount
    ) {
      endGame();
      return;
    }

    const eating = head.x === food.x && head.y === food.y;

    // Self collision
    const bodyToCheck = eating ? snake : snake.slice(0, -1);

    if (
      bodyToCheck.some(part => part.x === head.x && part.y === head.y)
    ) {
      endGame();
      return;
    }

    snake.unshift(head);

    if (eating) {
      score += 10;
      scoreDisplay.textContent = `Score: ${score}`;
      createFood();
    } else {
      snake.pop();
    }

    draw();
  }

  function draw() {
    ctx.fillStyle = "#050a12";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid
    ctx.strokeStyle = "rgba(0,245,255,0.06)";
    ctx.lineWidth = 1;

    for (let i = 0; i <= tileCount; i++) {
      ctx.beginPath();
      ctx.moveTo(i * gridSize, 0);
      ctx.lineTo(i * gridSize, canvas.height);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i * gridSize);
      ctx.lineTo(canvas.width, i * gridSize);
      ctx.stroke();
    }

    // Food
    ctx.fillStyle = "#ff2e93";
    ctx.shadowBlur = 15;
    ctx.shadowColor = "#ff2e93";

    ctx.fillRect(
      food.x * gridSize + 3,
      food.y * gridSize + 3,
      gridSize - 6,
      gridSize - 6
    );

    // Snake
    snake.forEach((part, index) => {
      ctx.fillStyle = index === 0 ? "#ffffff" : "#00f5ff";
      ctx.shadowBlur = index === 0 ? 18 : 10;
      ctx.shadowColor = "#00f5ff";

      ctx.fillRect(
        part.x * gridSize + 2,
        part.y * gridSize + 2,
        gridSize - 4,
        gridSize - 4
      );
    });

    ctx.shadowBlur = 0;
  }

  function endGame() {
    gameOver = true;
    running = false;

    clearInterval(gameLoop);

    message.textContent = `GAME OVER! Final Score: ${score}`;

    if (typeof saveScore === "function") {
      saveScore("snake", score);
    }
  }

  function changeDirection(direction) {
    if (!running || gameOver) return;

    switch (direction) {
      case "up":
        if (dy !== 1) {
          dx = 0;
          dy = -1;
        }
        break;

      case "down":
        if (dy !== -1) {
          dx = 0;
          dy = 1;
        }
        break;

      case "left":
        if (dx !== 1) {
          dx = -1;
          dy = 0;
        }
        break;

      case "right":
        if (dx !== -1) {
          dx = 1;
          dy = 0;
        }
        break;
    }
  }

  function handleKeyDown(event) {
    const directions = {
      ArrowUp: "up",
      ArrowDown: "down",
      ArrowLeft: "left",
      ArrowRight: "right"
    };

    if (running && directions[event.key]) {
      event.preventDefault();
      changeDirection(directions[event.key]);
    }
  }

  document.addEventListener("keydown", handleKeyDown);

  controls.querySelectorAll("button").forEach(button => {
    button.addEventListener("click", () => {
      changeDirection(button.dataset.dir);
    });
  });

  restartButton.addEventListener("click", resetGame);

  resetGame();

  return () => {
    running = false;
    clearInterval(gameLoop);
    document.removeEventListener("keydown", handleKeyDown);
  };
}