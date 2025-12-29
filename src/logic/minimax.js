export function calculateWinner(squares) {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return squares.includes(null) ? null : "Draw";
}

export function getBestMove(board, player) {
  const winner = calculateWinner(board);
  if (winner === 'O') return { score: 10 };
  if (winner === 'X') return { score: -10 };
  if (winner === 'Draw') return { score: 0 };

  const moves = [];
  for (let i = 0; i < 9; i++) {
    if (board[i] === null) {
      const move = { index: i };
      board[i] = player;
      const result = getBestMove(board, player === 'O' ? 'X' : 'O');
      move.score = result.score;
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