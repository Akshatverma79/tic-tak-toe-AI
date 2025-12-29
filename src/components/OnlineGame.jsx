import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { calculateWinner } from '../logic/minimax';

const OnlineGame = ({ roomId, backToHome }) => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [winData, setWinData] = useState(null);
  const [playerSymbol, setPlayerSymbol] = useState(null); 
  const [playersOnline, setPlayersOnline] = useState(0);
  const [gameMessage, setGameMessage] = useState("");
  const [friendDisconnected, setFriendDisconnected] = useState(false);

  const hasJoined = useRef(false);
  const gameStartedWithFriend = useRef(false); // New: Track if 2 players ever joined

  useEffect(() => {
    const setupGame = async () => {
      // 1. Initialize Game Data
      const { data: game } = await supabase.from('games').select('*').eq('id', roomId).single();
      
      if (!game) {
        await supabase.from('games').insert([{ id: roomId, board: Array(9).fill(null), is_x_next: true }]);
      } else {
        setBoard(game.board);
        setIsXNext(game.is_x_next);
        setWinData(game.winner);
      }

      // 2. Presence & Sync
      const channel = supabase.channel(`game_${roomId}`, {
        config: { presence: { key: roomId } }
      });

      channel
        .on('presence', { event: 'sync' }, () => {
          const state = channel.presenceState();
          const presences = Object.values(state).flat();
          const count = presences.length;
          setPlayersOnline(count);

          // Logic Fix: Only trigger disconnect if 2 players were present at some point
          if (count >= 2) {
            gameStartedWithFriend.current = true;
          }

          if (gameStartedWithFriend.current && count < 2 && !winData?.winner) {
            setFriendDisconnected(true);
          }

          // Assign Symbol
          if (!playerSymbol && !hasJoined.current) {
            const role = count === 1 ? 'X' : 'O';
            setPlayerSymbol(role);
            hasJoined.current = true;
          }
        })
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'games', filter: `id=eq.${roomId}` }, 
          (payload) => {
            setBoard(payload.new.board);
            setIsXNext(payload.new.is_x_next);
            setWinData(payload.new.winner);
          }
        )
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            await channel.track({ online_at: new Date().toISOString() });
          }
        });

      return channel;
    };

    const channelPromise = setupGame();

    return () => {
      channelPromise.then(channel => {
        supabase.removeChannel(channel);
        handleDatabaseCleanup();
      });
    };
  }, [roomId]); // Removed playersOnline from dependency to prevent loops

  const handleDatabaseCleanup = async () => {
    // Check actual online count before deleting
    const { data } = await supabase.from('games').select('id').eq('id', roomId);
    if (data && playersOnline <= 1) {
      await supabase.from('games').delete().eq('id', roomId);
    }
  };

  const handleMove = async (i) => {
    if (board[i] || winData?.winner || friendDisconnected) return;
    
    const myTurn = (playerSymbol === 'X' && isXNext) || (playerSymbol === 'O' && !isXNext);
    
    if (!myTurn) {
      setGameMessage("WAIT FOR PEER TURN");
      setTimeout(() => setGameMessage(""), 2000);
      return;
    }

    if (playersOnline < 2) {
      setGameMessage("WAITING FOR FRIEND...");
      return;
    }

    const newBoard = board.slice();
    newBoard[i] = playerSymbol;
    const newWinData = calculateWinner(newBoard);

    await supabase.from('games').update({
      board: newBoard,
      is_x_next: !isXNext,
      winner: newWinData
    }).eq('id', roomId);
  };

  const copyInvite = () => {
    const url = `${window.location.origin}?room=${roomId}`;
    navigator.clipboard.writeText(url);
    alert("Link Copied!");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-white bg-[#0B0E14] relative font-mono">
      
      <AnimatePresence>
        {friendDisconnected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-6 text-center">
            <div className="max-w-xs p-8 border border-red-500/30 bg-slate-900 rounded-[2rem]">
              <h2 className="text-2xl font-black text-red-500 mb-2">LINK SEVERED</h2>
              <p className="text-slate-400 mb-8 text-xs leading-relaxed uppercase tracking-widest">Remote peer has exited the session.</p>
              <button onClick={backToHome} className="w-full bg-red-600 py-4 rounded-xl font-bold uppercase tracking-tighter text-xs">Exit</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="bg-slate-900 text-blue-400 px-4 py-1 rounded-full text-[10px] font-bold border border-blue-500/20">
            SESSION: {roomId}
          </span>
          <button onClick={copyInvite} className="p-1.5 bg-slate-800 rounded-lg border border-slate-700 hover:bg-slate-700">📋</button>
        </div>
        
        <div className="flex items-center justify-center gap-2 mb-6">
           <div className={`h-2 w-2 rounded-full ${playersOnline < 2 ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`} />
           <span className="text-[10px] font-bold tracking-[0.3em] uppercase opacity-60">
             {playersOnline < 2 ? 'Awaiting Peer' : 'Neural Link Active'}
           </span>
        </div>

        <h1 className="text-4xl font-black mb-2 uppercase tracking-tighter">
          {winData?.winner ? (winData.winner === 'Draw' ? "Draw" : `${winData.winner} Wins`) : (isXNext ? "X Turn" : "O Turn")}
        </h1>
        <p className="text-blue-500 text-[10px] font-bold h-4 tracking-widest">{gameMessage}</p>
      </div>

      <div className="grid grid-cols-3 gap-3 p-4 bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] border border-slate-700/50 shadow-2xl">
        {board.map((sq, i) => (
          <button key={i} onClick={() => handleMove(i)} className={`h-24 w-24 rounded-2xl flex items-center justify-center text-4xl font-black bg-slate-950 border transition-all ${winData?.line?.includes(i) ? 'border-blue-500 bg-blue-500/20' : 'border-slate-800 hover:border-blue-500/30'}`}>
            <AnimatePresence>
              {sq && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className={sq === 'X' ? 'text-blue-400' : 'text-purple-400'}>{sq}</motion.span>}
            </AnimatePresence>
          </button>
        ))}
      </div>

      <div className="mt-8 opacity-40 text-[10px] font-bold tracking-widest">
        YOU ARE: PLAYER {playerSymbol || '...'}
      </div>
    </div>
  );
};

export default OnlineGame;