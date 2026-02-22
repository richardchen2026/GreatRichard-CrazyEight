import React from 'react';
import { motion } from 'motion/react';
import { CardData, Suit, Turn } from '../types';
import { getSuitSymbol, getSuitColor, SUITS } from '../constants';
import { Layers } from 'lucide-react';

interface CardProps {
  card: CardData;
  isFaceUp?: boolean;
  onClick?: () => void;
  isPlayable?: boolean;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ 
  card, 
  isFaceUp = true, 
  onClick, 
  isPlayable = false,
  className = ""
}) => {
  const getCardBg = (suit: Suit) => {
    switch (suit) {
      case Suit.HEARTS: return 'bg-rose-50';
      case Suit.DIAMONDS: return 'bg-orange-50';
      case Suit.CLUBS: return 'bg-slate-50';
      case Suit.SPADES: return 'bg-indigo-50';
    }
  };

  return (
    <motion.div
      layout
      initial={{ scale: 0.8, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      whileHover={isPlayable ? { y: -20, scale: 1.05, rotateY: 5 } : {}}
      onClick={isPlayable ? onClick : undefined}
      className={`
        relative w-24 h-36 sm:w-28 sm:h-40 rounded-2xl shadow-xl border-2 
        ${isFaceUp ? `${getCardBg(card.suit)} border-white/50` : 'bg-gradient-to-br from-indigo-600 via-purple-700 to-slate-900 border-white/20'}
        ${isPlayable ? 'cursor-pointer ring-4 ring-emerald-400 ring-offset-4 ring-offset-slate-900 shadow-[0_0_30px_rgba(16,185,129,0.4)]' : ''}
        transition-all duration-300 flex flex-col justify-between p-3 select-none overflow-hidden
        ${className}
      `}
    >
      {isFaceUp ? (
        <>
          {/* Subtle Pattern */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none flex items-center justify-center overflow-hidden">
            <div className="text-[10rem] font-black rotate-12">{getSuitSymbol(card.suit)}</div>
          </div>

          <div className={`text-xl font-black leading-none flex flex-col items-start ${getSuitColor(card.suit)}`}>
            <span>{card.rank}</span>
            <span className="text-base mt-0.5">{getSuitSymbol(card.suit)}</span>
          </div>
          
          <div className={`text-5xl self-center drop-shadow-md ${getSuitColor(card.suit)}`}>
            {getSuitSymbol(card.suit)}
          </div>
          
          <div className={`text-xl font-black leading-none flex flex-col items-end rotate-180 ${getSuitColor(card.suit)}`}>
            <span>{card.rank}</span>
            <span className="text-base mt-0.5">{getSuitSymbol(card.suit)}</span>
          </div>
        </>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center relative">
          {/* Card Back Design */}
          <div className="absolute inset-0 opacity-20">
            <div className="grid grid-cols-4 gap-2 p-2">
              {[...Array(16)].map((_, i) => (
                <div key={i} className="text-white text-[8px] opacity-50">{getSuitSymbol(SUITS[i % 4])}</div>
              ))}
            </div>
          </div>
          <div className="w-14 h-14 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20 flex items-center justify-center shadow-inner">
            <Layers className="text-white/40 w-8 h-8" />
          </div>
          <div className="mt-2 text-[8px] font-black text-white/30 tracking-[0.2em] uppercase">GreatRichard</div>
        </div>
      )}
    </motion.div>
  );
};
