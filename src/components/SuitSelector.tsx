import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Suit } from '../types';
import { getSuitSymbol, getSuitColor, SUITS } from '../constants';

interface SuitSelectorProps {
  onSelect: (suit: Suit) => void;
}

export const SuitSelector: React.FC<SuitSelectorProps> = ({ onSelect }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-950/80 backdrop-blur-md"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-slate-900 border border-white/10 p-10 rounded-[3rem] shadow-2xl text-center max-w-sm w-full mx-4"
      >
        <h2 className="text-3xl font-black mb-8 text-white tracking-tight">Select Wild Suit</h2>
        <div className="grid grid-cols-2 gap-4">
          {SUITS.map((suit) => (
            <button
              key={suit}
              onClick={() => onSelect(suit)}
              className={`
                flex flex-col items-center justify-center p-6 rounded-3xl border-2 border-white/5
                bg-white/5 hover:bg-white/10 hover:border-emerald-500/50 transition-all group relative overflow-hidden
              `}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className={`text-5xl mb-3 ${getSuitColor(suit)} group-hover:scale-125 transition-transform drop-shadow-lg`}>
                {getSuitSymbol(suit)}
              </span>
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest group-hover:text-white transition-colors">
                {suit}
              </span>
            </button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};
