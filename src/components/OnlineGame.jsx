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

          // Handle Disconnection Overlay
          // If we were 2 players and now we are 1, and no one has won yet
          if (hasJoined.current && count < 2 && !winData?.winner) {
            setFriendDisconnected(true);
          }

          // Assign Symbol (X for first, O for second)
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
  }, [roomId, playersOnline]);

  const handleDatabaseCleanup = async () => {
    // If you are the last one leaving, delete the record to keep DB clean
    if (playersOnline <= 1) {
      await supabase.from('games').delete().eq('id', roomId);
    }
  };

  const handleMove = async (i) => {
    if (board[i] || winData?.winner || friendDisconnected) return;
    
    // TURN ENFORCEMENT
    const myTurn = (playerSymbol === 'X' && isXNext) || (playerSymbol === 'O' && !isXNext);
    
    if (!myTurn) {
      setGameMessage("SYSTEM: AUTHENTICATION ERROR. WAIT FOR PEER TURN.");
      setTimeout(() => setGameMessage(""), 2000);
      return;
    }

    if (playersOnline < 2) {
      setGameMessage("SYSTEM: WAITING FOR REMOTE PEER...");
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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-white bg-[#0B0E14] relative">
      
      {/* DISCONNECTION OVERLAY */}
      <AnimatePresence>
        {friendDisconnected && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-6 text-center"
          >
            <div className="max-w-xs">
              <h2 className="text-3xl font-black text-red-500 mb-4 tracking-tighter uppercase">Connection Lost</h2>
              <p className="text-slate-400 mb-8 text-sm leading-relaxed">The remote peer has disconnected from the neural link. Session terminated.</p>
              <button 
                onClick={backToHome}
                className="w-full bg-red-600 py-4 rounded-2xl font-bold uppercase tracking-widest text-xs shadow-lg shadow-red-900/40"
              >
                Return to Base
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="text-center mb-8">
        <div className="flex flex-col items-center gap-2 mb-4">
          <span className="bg-slate-900/50 text-blue-400 px-4 py-1 rounded-full text-[10px] font-bold border border-blue-500/20 tracking-widest">
            ID: {playerSymbol || 'CONNECTING...'}
          </span>
          <div className="flex items-center gap-2">
            <div className={`h-1.5 w-1.5 rounded-full animate-pulse ${playersOnline < 2 ? 'bg-yellow-500' : 'bg-green-500'}`} />
            <span className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">
              {playersOnline < 2 ? 'Searching for Peer' : 'Peer Linked'}
            </span>
          </div>
        </div>

        <h1 className="text-4xl font-black italic tracking-tight mb-2 uppercase">
          {winData?.winner ? (winData.winner === 'Draw' ? "Stalemate" : `Winner: ${winData.winner}`) : 
          (isXNext ? "X Processing" : "O Processing")}
        </h1>
        <p className="text-blue-500 text-[10px] font-bold h-4 tracking-[0.2em]">{gameMessage}</p>
      </div>

      {/* Game Board */}
      <div className="grid grid-cols-3 gap-3 p-4 bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] border border-slate-700/50">
        {board.map((sq, i) => (
          <button key={i} onClick={() => handleMove(i)} className={`h-24 w-24 rounded-2xl flex items-center justify-center text-4xl font-black bg-slate-950 border transition-all ${winData?.line?.includes(i) ? 'border-blue-500 bg-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'border-slate-800 hover:border-slate-600'}`}>
            <AnimatePresence>
              {sq && <motion.span initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }} className={sq === 'X' ? 'text-blue-400' : 'text-purple-400'}>{sq}</motion.span>}
            </AnimatePresence>
          </button>
        ))}
      </div>

      <button onClick={backToHome} className="mt-12 text-slate-600 hover:text-white transition-all uppercase text-[10px] font-bold tracking-[0.4em]">
        Abort Session
      </button>
    </div>
  );
};

export default OnlineGame;