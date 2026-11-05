function startTicTacToe(container, saveScore) {
  let board = Array(9).fill("");
  let currentPlayer = "X";
  let gameActive = true;
  const scores = { X: 0, O: 0 };

  const winningCombinations = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];

  container.replaceChildren();

  const status = document.createElement("h3");
  status.style.color = "#31e8f4";
  status.textContent = "Player X's turn";

  const scoreBoard = document.createElement("div");
  scoreBoard.style.display = "flex";
  scoreBoard.style.justifyContent = "center";
  scoreBoard.style.gap = "25px";

  const scoreX = document.createElement("span");
  const scoreO = document.createElement("span");
  scoreBoard.append(scoreX, scoreO);

  const boardElement = document.createElement("div");
  boardElement.className = "ttt-board";
  boardElement.setAttribute("role", "group");
  boardElement.setAttribute("aria-label", "Tic-tac-toe board");

  const message = document.createElement("p");
  message.style.color = "#63f4aa";
  message.setAttribute("aria-live", "polite");

  const restartButton = document.createElement("button");
  restartButton.className = "btn btn-primary";
  restartButton.type = "button";
  restartButton.textContent = "NEW ROUND";

  container.append(status, scoreBoard, boardElement, message, restartButton);

  function updateScoreBoard() {
    scoreX.textContent = `Player X: ${scores.X}`;
    scoreO.textContent = `Player O: ${scores.O}`;
  }

  function createBoard() {
    boardElement.replaceChildren();
    board.forEach((value, index) => {
      const cell = document.createElement("button");
      cell.className = "ttt-cell";
      cell.type = "button";
      cell.textContent = value;
      cell.disabled = !gameActive || Boolean(value);
      cell.setAttribute(
        "aria-label",
        value ? `Cell ${index + 1}: ${value}` : `Empty cell ${index + 1}`
      );
      cell.addEventListener("click", () => handleMove(index));
      boardElement.appendChild(cell);
    });
  }

  function checkWinner() {
    for (const [first, second, third] of winningCombinations) {
      if (board[first] && board[first] === board[second] && board[first] === board[third]) {
        return board[first];
      }
    }
    return null;
  }

  function handleMove(index) {
    if (!gameActive || board[index]) return;

    board[index] = currentPlayer;
    const winner = checkWinner();

    if (winner) {
      gameActive = false;
      scores[winner]++;
      status.textContent = `Player ${winner} wins!`;
      message.textContent = `Congratulations! Player ${winner} won the round.`;
      if (typeof saveScore === "function") saveScore("tictactoe", scores[winner] * 100);
    } else if (board.every(Boolean)) {
      gameActive = false;
      status.textContent = "It's a draw!";
      message.textContent = "No winner this round. Start a new round to play again.";
    } else {
      currentPlayer = currentPlayer === "X" ? "O" : "X";
      status.textContent = `Player ${currentPlayer}'s turn`;
    }

    createBoard();
    updateScoreBoard();
  }

  function resetRound() {
    board = Array(9).fill("");
    currentPlayer = "X";
    gameActive = true;
    status.textContent = "Player X's turn";
    message.textContent = "";
    createBoard();
  }

  restartButton.addEventListener("click", resetRound);
  updateScoreBoard();
  createBoard();
}
