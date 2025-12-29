import React from 'react';

const Home = ({ setMode }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white text-center px-4">
      <div className="mb-10">
        <h1 className="text-6xl font-extrabold mb-4 bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-transparent">
          Tic-Tac-Toe AI
        </h1>
        <div className="h-1 w-24 bg-blue-500 mx-auto rounded-full"></div>
      </div>
      
      <p className="text-slate-400 mb-12 text-lg max-w-md">
        Test your skills against our competitive AI agent or challenge a friend locally.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-3xl">
        <button 
          onClick={() => setMode('AI')}
          className="group relative p-10 bg-slate-800/50 border border-slate-700 rounded-3xl hover:border-blue-500 hover:bg-slate-800 transition-all shadow-xl"
        >
          <div className="text-5xl mb-6 group-hover:scale-110 transition-transform">🤖</div>
          <h3 className="text-2xl font-bold mb-2">vs AI Agent</h3>
          <p className="text-sm text-slate-500">Competitive Minimax Algorithm</p>
          <div className="absolute top-4 right-4 text-xs font-bold text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">PRO MODE</div>
        </button>

        <button 
          onClick={() => setMode('Friend')}
          className="group p-10 bg-slate-800/50 border border-slate-700 rounded-3xl hover:border-purple-500 hover:bg-slate-800 transition-all shadow-xl"
        >
          <div className="text-5xl mb-6 group-hover:scale-110 transition-transform">👥</div>
          <h3 className="text-2xl font-bold mb-2">vs Friend</h3>
          <p className="text-sm text-slate-500">Local Multiplayer</p>
        </button>
      </div>

      <footer className="absolute bottom-8 text-slate-600 text-sm">
        Powered by Minimax Intelligence
      </footer>
    </div>
  );
};

export default Home;