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
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
    >
      <div className="bg-white p-8 rounded-3xl shadow-2xl text-center max-w-sm w-full mx-4">
        <h2 className="text-2xl font-bold mb-6 text-slate-800">Choose a Suit</h2>
        <div className="grid grid-cols-2 gap-4">
          {SUITS.map((suit) => (
            <button
              key={suit}
              onClick={() => onSelect(suit)}
              className={`
                flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-slate-100
                hover:border-emerald-500 hover:bg-emerald-50 transition-all group
              `}
            >
              <span className={`text-5xl mb-2 ${getSuitColor(suit)} group-hover:scale-110 transition-transform`}>
                {getSuitSymbol(suit)}
              </span>
              <span className="text-sm font-semibold text-slate-600 uppercase tracking-wider">
                {suit}
              </span>
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
