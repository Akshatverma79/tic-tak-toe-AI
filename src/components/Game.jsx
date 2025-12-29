import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { calculateWinner, getAIMove } from '../logic/minimax';

const Game = ({ mode, difficulty, backToHome, scores, updateScores }) => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [aiThinking, setAiThinking] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  const winData = calculateWinner(board);
  const gameEnded = !!winData?.winner;

  // AI Turn Logic
  useEffect(() => {
    if (mode === 'AI' && !isXNext && !gameEnded) {
      setAiThinking(true);
      const timer = setTimeout(() => {
        const move = getAIMove([...board], difficulty);
        if (move !== undefined) makeMove(move);
        setAiThinking(false);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [isXNext, board, mode, gameEnded, difficulty]);

  const makeMove = (i) => {
    if (board[i] || gameEnded) return;
    const nextBoard = board.slice();
    nextBoard[i] = isXNext ? 'X' : 'O';
    setBoard(nextBoard);
    setIsXNext(!isXNext);
  };

  // Handle Game End
  useEffect(() => {
    if (winData?.winner) {
      updateScores(winData.winner);
      const winner = winData.winner;
      
      if (winner === 'X' && mode === 'AI') {
        setStatusMsg("AI: Incredible! You've bested me. I'll definitely win the next one!");
      } else if (winner === 'O' && mode === 'AI') {
        setStatusMsg("AI: Logic prevails. Better luck next time!");
      } else if (winner === 'Draw') {
        setStatusMsg("AI: A perfect stalemate. We are matched.");
      } else {
        setStatusMsg(winner === 'Draw' ? "It's a Draw!" : `Player ${winner} Wins!`);
      }
    }
  }, [gameEnded]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-white relative">
      
      {/* Score Display */}
      <div className="flex gap-12 mb-10 text-center uppercase tracking-widest font-bold text-[10px]">
        <div><p className="text-blue-400 mb-1">USER (X)</p><p className="text-3xl font-black">{scores.X}</p></div>
        <div><p className="text-slate-500 mb-1">DRAWS</p><p className="text-3xl font-black">{scores.Draw}</p></div>
        <div><p className="text-purple-400 mb-1">{mode === 'AI' ? 'AGENT (O)' : 'FRIEND (O)'}</p><p className="text-3xl font-black">{scores.O}</p></div>
      </div>

      {/* Grid Container */}
      <div className="relative">
        <AnimatePresence>
          {aiThinking && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="absolute -top-10 left-0 right-0 text-center text-[10px] text-blue-500 font-bold tracking-[0.4em]"
            >
              AGENT ANALYZING...
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-3 gap-3 p-4 bg-slate-900/40 backdrop-blur-md rounded-[2.5rem] border border-slate-700/50 shadow-2xl">
          {board.map((square, i) => {
            const isWinningSquare = winData?.line?.includes(i);
            return (
              <button 
                key={i} onClick={() => makeMove(i)} 
                className={`relative h-24 w-24 rounded-2xl flex items-center justify-center text-4xl font-black transition-all border
                  ${isWinningSquare 
                    ? 'bg-blue-600/30 border-blue-400 shadow-[0_0_25px_rgba(59,130,246,0.4)] z-10 scale-105' 
                    : 'bg-slate-950/80 border-slate-800/50 hover:bg-slate-800 hover:border-blue-500/30'}`}
              >
                <AnimatePresence>
                  {square && (
                    <motion.span 
                      initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }}
                      className={square === 'X' ? 'text-blue-400' : 'text-purple-400'}
                    >
                      {square}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            )
          })}
        </div>
      </div>

      {/* Message Popup */}
      <AnimatePresence>
        {statusMsg && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="mt-8 p-4 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-2xl text-xs font-bold text-center max-w-xs"
          >
            {statusMsg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-10 flex gap-4 w-full max-w-xs">
        <button onClick={() => {setBoard(Array(9).fill(null)); setStatusMsg("")}} className="flex-1 bg-blue-600 hover:bg-blue-500 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all shadow-lg shadow-blue-900/40">New Game</button>
        <button onClick={backToHome} className="flex-1 bg-slate-800 hover:bg-slate-700 py-4 rounded-2xl font-bold border border-slate-700 text-xs uppercase tracking-widest transition-all">Home</button>
      </div>
    </div>
  );
};

export default Game;