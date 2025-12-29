import React, { useState, useEffect } from 'react';
import Home from './components/Home.jsx';
import Game from './components/Game.jsx';
import OnlineGame from './components/OnlineGame.jsx'; // 1. Import the new component

function App() {
  const [view, setView] = useState('home');
  const [difficulty, setDifficulty] = useState('Impossible');
  const [roomId, setRoomId] = useState(null); // 2. Track the Online Room ID
  
  const [scores, setScores] = useState(() => {
    try {
      const saved = localStorage.getItem('ttt-scores');
      return saved ? JSON.parse(saved) : { X: 0, O: 0, Draw: 0 };
    } catch (e) {
      return { X: 0, O: 0, Draw: 0 };
    }
  });

  useEffect(() => {
    localStorage.setItem('ttt-scores', JSON.stringify(scores));
  }, [scores]);

  const updateScores = (winner) => {
    const key = winner === 'Draw' ? 'Draw' : winner;
    setScores(prev => ({ ...prev, [key]: prev[key] + 1 }));
  };

  return (
    <div className="min-h-screen bg-[#0B0E14] overflow-x-hidden">
      {/* 3. Conditional Rendering (The "Router") */}
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