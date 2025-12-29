import React, { useState, useEffect } from 'react';
import Home from './components/Home.jsx';
import Game from './components/Game.jsx';
import OnlineGame from './components/OnlineGame.jsx';

function App() {
  const [view, setView] = useState('home');
  const [difficulty, setDifficulty] = useState('Impossible');
  const [roomId, setRoomId] = useState(null);

  // --- NEW: AUTO-JOIN URL LOGIC ---
  useEffect(() => {
    // Check if URL has ?room=ID
    const params = new URLSearchParams(window.location.search);
    const urlRoomId = params.get('room');

    if (urlRoomId) {
      setRoomId(urlRoomId.toUpperCase());
      setView('Online');
      
      // Clean the URL (remove ?room=ID from address bar)
      window.history.replaceState({}, document.title, "/");
    }
  }, []);

  const [scores, setScores] = useState(() => {
    try {
      const saved = localStorage.getItem('ttt-scores');
      return saved ? JSON.parse(saved) : { X: 0, O: 0, Draw: 0 };
    } catch (e) { return { X: 0, O: 0, Draw: 0 }; }
  });

  const updateScores = (winner) => {
    const key = winner === 'Draw' ? 'Draw' : winner;
    setScores(prev => ({ ...prev, [key]: prev[key] + 1 }));
  };

  return (
    <div className="min-h-screen bg-[#0B0E14] overflow-x-hidden">
      {view === 'home' && (
        <Home 
          setMode={setView} 
          difficulty={difficulty} 
          setDifficulty={setDifficulty} 
          setRoomId={setRoomId} 
        />
      )}

      {view === 'AI' && (
        <Game 
          mode="AI" 
          difficulty={difficulty} 
          backToHome={() => setView('home')} 
          scores={scores} 
          updateScores={updateScores} 
        />
      )}

      {view === 'Friend' && (
        <Game 
          mode="Friend" 
          difficulty={difficulty} 
          backToHome={() => setView('home')} 
          scores={scores} 
          updateScores={updateScores} 
        />
      )}

      {view === 'Online' && (
        <OnlineGame 
          roomId={roomId} 
          backToHome={() => setView('home')} 
        />
      )}
    </div>
  );
}

export default App;