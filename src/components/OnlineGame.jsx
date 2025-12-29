import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { calculateWinner } from '../logic/minimax';

const OnlineGame = ({ roomId, backToHome }) => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [winData, setWinData] = useState(null);

  useEffect(() => {
    const fetchGame = async () => {
      const { data } = await supabase.from('games').select('*').eq('id', roomId).single();
      if (data) {
        setBoard(data.board);
        setIsXNext(data.is_x_next);
        setWinData(data.winner);
      } else {
        await supabase.from('games').insert([{ id: roomId, board: Array(9).fill(null), is_x_next: true }]);
      }
    };

    fetchGame();

    const channel = supabase.channel(`game_${roomId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'games', filter: `id=eq.${roomId}` }, 
      (payload) => {
        setBoard(payload.new.board);
        setIsXNext(payload.new.is_x_next);
        setWinData(payload.new.winner);
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [roomId]);

  const handleMove = async (i) => {
    if (board[i] || winData?.winner) return;
    const newBoard = board.slice();
    newBoard[i] = isXNext ? 'X' : 'O';
    const newWinData = calculateWinner(newBoard);

    await supabase.from('games').update({
      board: newBoard,
      is_x_next: !isXNext,
      winner: newWinData
    }).eq('id', roomId);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-white">
      <div className="text-center mb-8">
        <div className="bg-blue-600/20 text-blue-400 px-4 py-1 rounded-full text-xs font-bold mb-4 inline-block">ROOM: {roomId}</div>
        <h1 className="text-3xl font-black">{winData?.winner ? (winData.winner === 'Draw' ? "Draw!" : `Player ${winData.winner} Wins!`) : `Turn: ${isXNext ? 'X' : 'O'}`}</h1>
      </div>

      <div className="grid grid-cols-3 gap-3 p-4 bg-slate-900/40 backdrop-blur-md rounded-[2.5rem] border border-slate-700/50">
        {board.map((sq, i) => (
          <button key={i} onClick={() => handleMove(i)} className={`h-24 w-24 rounded-2xl flex items-center justify-center text-4xl font-black bg-slate-950 border border-slate-800 ${winData?.line?.includes(i) ? 'border-blue-500 bg-blue-500/10' : ''}`}>
            {sq && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className={sq === 'X' ? 'text-blue-400' : 'text-purple-400'}>{sq}</motion.span>}
          </button>
        ))}
      </div>
      <button onClick={backToHome} className="mt-12 text-slate-500 hover:text-white transition-all">Back to Home</button>
    </div>
  );
};

export default OnlineGame;