import React, { useState, useEffect } from 'react';
import { calculateWinner, getBestMove } from '../logic/minimax';

const Game = ({ mode, backToHome }) => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [statusMsg, setStatusMsg] = useState("");

  const winner = calculateWinner(board);

  // AI Logic Trigger
  useEffect(() => {
    if (mode === 'AI' && !isXNext && !winner) {
      const timer = setTimeout(() => {
        const move = getBestMove([...board], 'O');
        if (move) makeMove(move.index);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [isXNext, board, mode, winner]);

  const makeMove = (i) => {
    if (board[i] || winner) return;
    const nextBoard = board.slice();
    nextBoard[i] = isXNext ? 'X' : 'O';
    setBoard(nextBoard);
    setIsXNext(!isXNext);
  };

  useEffect(() => {
    if (winner === 'X') {
      setStatusMsg(mode === 'AI' ? "AI: Incredible! You've bested me. I'll definitely win the next one!" : "Player X Wins!");
    } else if (winner === 'O') {
      setStatusMsg(mode === 'AI' ? "AI: As expected, logic prevails. Better luck next time!" : "Player O Wins!");
    } else if (winner === 'Draw') {
      setStatusMsg("AI: A well-fought draw. Stalemated.");
    }
  }, [winner, mode]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-slate-900 text-white">
      <div className="bg-slate-800/80 backdrop-blur-md p-10 rounded-[2.5rem] shadow-2xl border border-slate-700 w-full max-w-md text-center">
        <h2 className="text-xl font-medium text-slate-400 mb-2 uppercase tracking-widest">
          {mode === 'AI' ? 'Agent Match' : 'Friendly Duel'}
        </h2>
        <h1 className="text-3xl font-black mb-8 text-white">
          {winner ? "Game Over" : `Turn: ${isXNext ? 'X' : 'O'}`}
        </h1>
        
        <div className="grid grid-cols-3 gap-4 mb-8">
          {board.map((cell, i) => (
            <button 
              key={i} 
              onClick={() => makeMove(i)} 
              className={`h-24 w-full bg-slate-900/50 rounded-2xl text-4xl font-black transition-all border border-slate-700 hover:scale-105 active:scale-95
                ${cell === 'X' ? 'text-blue-400' : 'text-purple-400'}
                ${!cell && !winner ? 'hover:border-slate-500' : ''}`}
            >
              {cell}
            </button>
          ))}
        </div>

        {statusMsg && (
          <div className="mb-8 p-4 bg-blue-500/10 text-blue-400 rounded-2xl border border-blue-500/20 font-semibold animate-pulse">
            {statusMsg}
          </div>
        )}

        <div className="flex gap-4">
          <button 
            onClick={() => {setBoard(Array(9).fill(null)); setStatusMsg("")}} 
            className="flex-1 bg-blue-600 hover:bg-blue-500 py-4 rounded-2xl font-bold transition-all shadow-lg shadow-blue-900/20"
          >
            Play Again
          </button>
          <button 
            onClick={backToHome} 
            className="flex-1 bg-slate-700 hover:bg-slate-600 py-4 rounded-2xl font-bold transition-all"
          >
            Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default Game;