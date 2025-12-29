export function calculateWinner(squares) {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], line: [a, b, c] };
    }
  }
  return squares.includes(null) ? null : { winner: "Draw", line: [] };
}

export function getAIMove(board, difficulty) {
  const availableMoves = board.map((val, idx) => (val === null ? idx : null)).filter((val) => val !== null);

  if (difficulty === 'Easy') {
    return availableMoves[Math.floor(Math.random() * availableMoves.length)];
  }

  if (difficulty === 'Medium') {
    // 50% chance to play perfect, 50% chance to play random
    if (Math.random() > 0.5) {
        const best = getBestMove(board, 'O');
        return best.index;
    }
    return availableMoves[Math.floor(Math.random() * availableMoves.length)];
  }

  // Impossible Mode (Full Minimax)
  const bestMove = getBestMove(board, 'O');
  return bestMove.index;
}

function getBestMove(board, player) {
  const result = calculateWinner(board);
  
  // Use .winner because calculateWinner now returns an object
  if (result?.winner === 'O') return { score: 10 };
  if (result?.winner === 'X') return { score: -10 };
  if (result?.winner === 'Draw') return { score: 0 };

  const moves = [];
  for (let i = 0; i < 9; i++) {
    if (board[i] === null) {
      const move = { index: i };
      board[i] = player;
      const moveResult = getBestMove(board, player === 'O' ? 'X' : 'O');
      move.score = moveResult.score;
      board[i] = null;
      moves.push(move);
    }
  }

  let bestMove;
  if (player === 'O') {
    let bestScore = -Infinity;
    for (let i = 0; i < moves.length; i++) {
      if (moves[i].score > bestScore) {
        bestScore = moves[i].score;
        bestMove = i;
      }
    }
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < moves.length; i++) {
      if (moves[i].score < bestScore) {
        bestScore = moves[i].score;
        bestMove = i;
      }
    }
  }
  return moves[bestMove];
}