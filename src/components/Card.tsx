import React from 'react';
import { motion } from 'motion/react';
import { CardData, Suit } from '../types';
import { getSuitSymbol, getSuitColor } from '../constants';

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
  return (
    <motion.div
      layout
      initial={{ scale: 0.8, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      whileHover={isPlayable ? { y: -20, scale: 1.05 } : {}}
      onClick={isPlayable ? onClick : undefined}
      className={`
        relative w-24 h-36 sm:w-28 sm:h-40 rounded-xl shadow-lg border-2 
        ${isFaceUp ? 'bg-white border-slate-200' : 'bg-indigo-700 border-indigo-900'}
        ${isPlayable ? 'cursor-pointer ring-2 ring-emerald-400 ring-offset-2' : ''}
        transition-shadow duration-200 flex flex-col justify-between p-2 select-none
        ${className}
      `}
    >
      {isFaceUp ? (
        <>
          <div className={`text-lg font-bold leading-none ${getSuitColor(card.suit)}`}>
            {card.rank}
            <div className="text-sm">{getSuitSymbol(card.suit)}</div>
          </div>
          
          <div className={`text-4xl self-center ${getSuitColor(card.suit)}`}>
            {getSuitSymbol(card.suit)}
          </div>
          
          <div className={`text-lg font-bold leading-none self-end rotate-180 ${getSuitColor(card.suit)}`}>
            {card.rank}
            <div className="text-sm">{getSuitSymbol(card.suit)}</div>
          </div>
        </>
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-white/20 rounded-full flex items-center justify-center">
            <div className="w-6 h-6 bg-white/10 rounded-full" />
          </div>
        </div>
      )}
    </motion.div>
  );
};
