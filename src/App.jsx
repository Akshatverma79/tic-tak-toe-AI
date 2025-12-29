import React, { useState } from 'react';
import Home from './components/Home.jsx';
import Game from './components/Game.jsx';

function App() {
  const [view, setView] = useState('home'); // 'home', 'AI', or 'Friend'

  return (
    <div className="min-h-screen bg-slate-900 overflow-hidden font-sans">
      {view === 'home' ? (
        <Home setMode={(mode) => setView(mode)} />
      ) : (
        <Game mode={view} backToHome={() => setView('home')} />
      )}
    </div>
  );
}

export default App;