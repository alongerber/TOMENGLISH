import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { MascotImage } from '../components/ui/MascotImage';

export function Welcome() {
  const { playerName, setPlayerName } = useGameStore();
  const [name, setName] = useState(playerName);
  const navigate = useNavigate();

  const handleStart = () => {
    if (name.trim()) {
      setPlayerName(name.trim());
      navigate('/home');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #74b9ff 0%, #a8d8ff 30%, #dfe6e9 60%, #ffffff 100%)' }}
    >
      {/* Decorative blobs */}
      <div className="absolute top-[-80px] right-[-60px] w-[300px] h-[300px] rounded-full opacity-25 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #a29bfe, transparent 70%)', filter: 'blur(50px)' }} />
      <div className="absolute bottom-[-100px] left-[-80px] w-[350px] h-[350px] rounded-full opacity-20 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #fdcb6e, transparent 70%)', filter: 'blur(50px)' }} />
      <div className="absolute top-[10%] left-[5%] text-5xl opacity-30 pointer-events-none select-none">☁️</div>
      <div className="absolute top-[15%] right-[10%] text-3xl opacity-20 pointer-events-none select-none">☁️</div>
      <div className="absolute bottom-[25%] left-[15%] text-4xl opacity-15 pointer-events-none select-none">⭐</div>
      <div className="absolute top-[8%] right-[35%] text-2xl opacity-15 pointer-events-none select-none">⭐</div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="p-10 max-w-md w-full text-center relative z-10 rounded-[24px]"
        style={{
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.4)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)',
        }}
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
          className="mb-4 flex justify-center"
        >
          <MascotImage state="idle" size="xl" />
        </motion.div>

        <h1 className="text-3xl font-bold mb-2">
          <span className="bg-gradient-to-l from-[#6C5CE7] to-[#e17055] bg-clip-text text-transparent">
            ✨ מסע הקסם באנגלית ✨
          </span>
        </h1>

        <p className="text-gray-500 mb-8 text-sm">
          משחקים, לומדים, ומצליחים במבחן!
        </p>

        <div className="mb-6">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleStart()}
            placeholder="איך קוראים לך? 😊"
            className="w-full px-5 py-4 rounded-2xl border-2 border-gray-200 focus:border-[#6C5CE7] focus:outline-none text-xl text-center transition-colors"
            style={{ background: 'rgba(255,255,255,0.7)' }}
            autoFocus
            dir="rtl"
          />
        </div>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleStart}
          disabled={!name.trim()}
          className="w-full text-xl py-4 rounded-2xl font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          style={{
            background: name.trim() ? 'linear-gradient(135deg, #f39c12, #fdcb6e)' : '#e0e0e0',
            color: '#2d3436',
            boxShadow: name.trim() ? '0 4px 20px rgba(243, 156, 18, 0.4)' : 'none',
          }}
        >
          🚀 יאללה, מתחילים!
        </motion.button>

        <div className="mt-6 flex justify-center gap-8 text-2xl opacity-30 select-none">
          <span>☁️</span><span>⭐</span><span>☁️</span>
        </div>
      </motion.div>
    </div>
  );
}
