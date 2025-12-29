import React from 'react';
import { motion } from 'framer-motion';

const Home = ({ setMode, difficulty, setDifficulty, setRoomId }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.8, staggerChildren: 0.15 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  const handleOnlineJoin = () => {
    const id = prompt("Enter Room ID to Join, or leave blank to Create a new one:");
    if (id === "") {
        // Generate a random 5-character ID for a new room
        const newId = Math.random().toString(36).substring(2, 7).toUpperCase();
        setRoomId(newId);
        setMode('Online');
    } else if (id) {
        setRoomId(id.toUpperCase());
        setMode('Online');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#0B0E14]">
      <div className="absolute inset-0 bg-grid-pattern animate-pan-slow opacity-40"></div>
      
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="relative z-10 w-full max-w-4xl bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-[2.5rem] p-8 md:p-12 shadow-2xl">
        <motion.div variants={itemVariants} className="text-center mb-12">
          <h1 className="text-5xl md:text-7xl font-black mb-4 text-white tracking-tight">
            NEURAL <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">TAC-TOE</span>
          </h1>
          <p className="text-slate-400 text-lg">Choose your engagement protocol.</p>
        </motion.div>

        <motion.div variants={itemVariants} className="mb-12 flex flex-col items-center">
          <div className="inline-flex bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800/80 shadow-inner">
            {['Easy', 'Medium', 'Impossible'].map((lvl) => (
              <button key={lvl} onClick={() => setDifficulty(lvl)} className={`relative px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${difficulty === lvl ? 'text-white' : 'text-slate-500'}`}>
                {difficulty === lvl && <motion.div layoutId="activeDiffBg" className="absolute inset-0 bg-blue-600 rounded-xl -z-10" />}
                {lvl}
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <DashboardCard title="Neural Link" subtitle="vs AI Agent" icon="🤖" accentColor="blue" onClick={() => setMode('AI')} />
          <DashboardCard title="Local Peer" subtitle="vs Friend" icon="👥" accentColor="purple" onClick={() => setMode('Friend')} />
          <DashboardCard title="Global Link" subtitle="Online Multiplayer" icon="🌐" accentColor="cyan" onClick={handleOnlineJoin} />
        </motion.div>
      </motion.div>
    </div>
  );
};

const DashboardCard = ({ title, subtitle, icon, onClick, accentColor }) => (
  <button onClick={onClick} className={`group p-6 bg-slate-800/30 rounded-3xl border border-slate-700/50 transition-all hover:-translate-y-1 hover:bg-slate-800`}>
    <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{icon}</div>
    <h3 className="text-xl font-bold text-white">{title}</h3>
    <p className={`text-sm font-medium text-blue-400`}>{subtitle}</p>
  </button>
);

export default Home;