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

  // --- NEW: COPY LINK LOGIC ---
  const copyInvite = () => {
    // Generates a URL like: https://your-site.vercel.app?room=ABCDE
    const url = `${window.location.origin}?room=${roomId}`;
    navigator.clipboard.writeText(url);
    alert("Invite Link Copied! Send it to your friend.");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-white font-sans bg-[#0B0E14]">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
            <span className="bg-blue-600/20 text-blue-400 px-4 py-1 rounded-full text-[10px] font-bold border border-blue-500/20 tracking-widest">
                ROOM: {roomId}
            </span>
            {/* Copy Button */}
            <button 
                onClick={copyInvite} 
                className="p-1.5 bg-slate-800 rounded-lg border border-slate-700 hover:bg-slate-700 transition-all text-xs"
                title="Copy Invite Link"
            >
                📋
            </button>
        </div>
        
        <h1 className="text-3xl font-black italic tracking-tight uppercase">
            {winData?.winner ? (winData.winner === 'Draw' ? "Stalemate" : `${winData.winner} Wins`) : `Turn: ${isXNext ? 'X' : 'O'}`}
        </h1>
      </div>

      <div className="grid grid-cols-3 gap-3 p-4 bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] border border-slate-700/50 shadow-2xl">
        {board.map((sq, i) => {
          const isWinning = winData?.line?.includes(i);
          return (
            <button 
              key={i} 
              onClick={() => handleMove(i)} 
              className={`h-24 w-24 rounded-2xl flex items-center justify-center text-4xl font-black bg-slate-950/80 border transition-all 
                ${isWinning ? 'border-blue-500 bg-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'border-slate-800 hover:border-slate-600'}`}
            >
              <AnimatePresence>
                {sq && (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className={sq === 'X' ? 'text-blue-400' : 'text-purple-400'}>
                    {sq}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          )
        })}
      </div>

      <button onClick={backToHome} className="mt-12 text-slate-600 hover:text-white transition-all uppercase text-[10px] font-bold tracking-[0.3em]">
        Exit Session
      </button>
    </div>
  );
};

export default OnlineGame;