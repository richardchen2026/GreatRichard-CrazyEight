import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card } from './components/Card';
import { SuitSelector } from './components/SuitSelector';
import { Suit, Rank, CardData, GameStatus, Turn, GameState } from './types';
import { createDeck, shuffle, getSuitSymbol, getSuitColor } from './constants';
import { Trophy, RotateCcw, Info, ChevronRight, Hand, Layers, Play, BookOpen, ArrowRight, Sparkles } from 'lucide-react';

const INITIAL_HAND_SIZE = 8;

export default function App() {
  const [gameState, setGameState] = useState<GameState>({
    playerHand: [],
    aiHand: [],
    drawPile: [],
    discardPile: [],
    currentTurn: 'PLAYER',
    status: 'COVER',
    wildSuit: null,
    winner: null,
    isFirstGame: true,
    tutorialStep: 0,
  });

  const [message, setMessage] = useState<string>("Welcome to Crazy Eights!");

  const startNewGame = useCallback(() => {
    const deck = shuffle(createDeck());
    const playerHand = deck.splice(0, INITIAL_HAND_SIZE);
    const aiHand = deck.splice(0, INITIAL_HAND_SIZE);
    
    let firstCardIndex = deck.findIndex(c => c.rank !== Rank.EIGHT);
    if (firstCardIndex === -1) firstCardIndex = 0;
    const discardPile = deck.splice(firstCardIndex, 1);
    
    setGameState(prev => ({
      ...prev,
      playerHand,
      aiHand,
      drawPile: deck,
      discardPile,
      currentTurn: 'PLAYER',
      status: 'PLAYING',
      wildSuit: null,
      winner: null,
      tutorialStep: prev.isFirstGame ? 1 : 0,
    }));
    setMessage("Your turn! Match the suit or rank.");
  }, []);

  const topDiscard = gameState.discardPile[gameState.discardPile.length - 1];
  const effectiveSuit = gameState.wildSuit || topDiscard?.suit;

  const isPlayable = (card: CardData) => {
    if (card.rank === Rank.EIGHT) return true;
    return card.suit === effectiveSuit || card.rank === topDiscard.rank;
  };

  const checkWinner = (state: GameState) => {
    if (state.playerHand.length === 0) return 'PLAYER';
    if (state.aiHand.length === 0) return 'AI';
    return null;
  };

  const handlePlayerPlay = (card: CardData) => {
    if (gameState.currentTurn !== 'PLAYER' || gameState.status !== 'PLAYING') return;
    if (!isPlayable(card)) return;

    const newPlayerHand = gameState.playerHand.filter(c => c.id !== card.id);
    const newDiscardPile = [...gameState.discardPile, card];
    
    // Advance tutorial if active
    const nextTutorialStep = gameState.tutorialStep > 0 ? 0 : 0;
    const isFirstGameDone = gameState.tutorialStep > 0 ? false : gameState.isFirstGame;

    if (card.rank === Rank.EIGHT) {
      setGameState(prev => ({
        ...prev,
        playerHand: newPlayerHand,
        discardPile: newDiscardPile,
        status: 'SELECTING_SUIT',
        tutorialStep: 0, // End tutorial on complex move
      }));
      setMessage("Crazy 8! Pick a new suit.");
    } else {
      const newState: GameState = {
        ...gameState,
        playerHand: newPlayerHand,
        discardPile: newDiscardPile,
        currentTurn: 'AI',
        wildSuit: null,
        tutorialStep: 0,
        isFirstGame: false,
      };
      
      const winner = checkWinner(newState);
      if (winner) {
        setGameState({ ...newState, status: 'GAME_OVER', winner });
        setMessage(winner === 'PLAYER' ? "You Win! 🎉" : "AI Wins! 🤖");
      } else {
        setGameState(newState);
        setMessage("AI is thinking...");
      }
    }
  };

  const handleSuitSelect = (suit: Suit) => {
    const newState: GameState = {
      ...gameState,
      status: 'PLAYING',
      currentTurn: 'AI',
      wildSuit: suit,
      tutorialStep: 0,
      isFirstGame: false,
    };
    
    const winner = checkWinner(newState);
    if (winner) {
      setGameState({ ...newState, status: 'GAME_OVER', winner });
    } else {
      setGameState(newState);
      setMessage(`Suit changed to ${suit}. AI's turn.`);
    }
  };

  const drawCard = (turn: Turn) => {
    if (gameState.drawPile.length === 0) {
      setMessage("Draw pile empty! Skipping turn.");
      setGameState(prev => ({ ...prev, currentTurn: turn === 'PLAYER' ? 'AI' : 'PLAYER' }));
      return;
    }

    const newDrawPile = [...gameState.drawPile];
    const card = newDrawPile.pop()!;
    
    if (turn === 'PLAYER') {
      const newHand = [...gameState.playerHand, card];
      setGameState(prev => ({
        ...prev,
        playerHand: newHand,
        drawPile: newDrawPile,
        currentTurn: 'AI',
        tutorialStep: 0,
        isFirstGame: false,
      }));
      setMessage("You drew a card. AI's turn.");
    } else {
      const newHand = [...gameState.aiHand, card];
      setGameState(prev => ({
        ...prev,
        aiHand: newHand,
        drawPile: newDrawPile,
        currentTurn: 'PLAYER'
      }));
      setMessage("AI drew a card. Your turn.");
    }
  };

  useEffect(() => {
    if (gameState.currentTurn === 'AI' && gameState.status === 'PLAYING') {
      const timer = setTimeout(() => {
        const playableCards = gameState.aiHand.filter(isPlayable);
        
        if (playableCards.length > 0) {
          const nonEight = playableCards.find(c => c.rank !== Rank.EIGHT);
          const cardToPlay = nonEight || playableCards[0];
          
          const newAiHand = gameState.aiHand.filter(c => c.id !== cardToPlay.id);
          const newDiscardPile = [...gameState.discardPile, cardToPlay];
          
          let nextWildSuit: Suit | null = null;
          if (cardToPlay.rank === Rank.EIGHT) {
            const suitCounts = newAiHand.reduce((acc, c) => {
              acc[c.suit] = (acc[c.suit] || 0) + 1;
              return acc;
            }, {} as Record<Suit, number>);
            nextWildSuit = (Object.keys(suitCounts) as Suit[]).sort((a, b) => suitCounts[b] - suitCounts[a])[0] || Suit.SPADES;
          }

          const newState: GameState = {
            ...gameState,
            aiHand: newAiHand,
            discardPile: newDiscardPile,
            currentTurn: 'PLAYER',
            wildSuit: nextWildSuit,
          };

          const winner = checkWinner(newState);
          if (winner) {
            setGameState({ ...newState, status: 'GAME_OVER', winner });
            setMessage("AI Wins! 🤖 Better luck next time.");
          } else {
            setGameState(newState);
            setMessage(nextWildSuit ? `AI played an 8 and chose ${nextWildSuit}!` : "AI played. Your turn!");
          }
        } else {
          drawCard('AI');
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [gameState.currentTurn, gameState.status]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500/30 overflow-hidden flex flex-col relative">
      {/* Global Background Image */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img 
          src="https://picsum.photos/seed/poker/1920/1080?blur=10" 
          className="w-full h-full object-cover opacity-20"
          alt="background"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-950/40 to-slate-950" />
      </div>

      {/* Overlays: Cover & Instructions */}
      <AnimatePresence>
        {gameState.status === 'COVER' && (
          <motion.div
            key="cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-slate-950 p-8"
          >
            {/* Fancy Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <img 
                src="https://picsum.photos/seed/cards/1920/1080?blur=8" 
                className="absolute inset-0 w-full h-full object-cover opacity-30 scale-110"
                alt="background"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-transparent to-slate-950" />
              
              {/* Floating Cards Decor */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ 
                    y: [0, -20, 0],
                    rotate: [i * 10, i * 10 + 5, i * 10],
                    x: [0, 10, 0]
                  }}
                  transition={{ 
                    duration: 4 + i, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                  className="absolute opacity-20 hidden lg:block"
                  style={{
                    left: `${15 + i * 15}%`,
                    top: `${20 + (i % 3) * 20}%`,
                  }}
                >
                  <div className="w-24 h-36 bg-white/10 border border-white/20 rounded-xl backdrop-blur-sm" />
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
              className="relative z-10 text-center"
            >
              <motion.div 
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 5, repeat: Infinity }}
                className="w-28 h-28 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-[2.5rem] flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.3)] mx-auto mb-10"
              >
                <Layers className="text-white w-14 h-14" />
              </motion.div>
              
              <h1 className="text-7xl sm:text-9xl font-black tracking-tighter mb-4 text-white drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]">
                CRAZY <span className="text-emerald-500">EIGHTS</span>
              </h1>
              
              <div className="flex items-center justify-center gap-4 mb-12">
                <div className="h-px w-12 bg-white/20" />
                <p className="text-emerald-400 uppercase tracking-[0.5em] font-black text-xs sm:text-sm">
                  GreatRichard Premium Edition
                </p>
                <div className="h-px w-12 bg-white/20" />
              </div>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <button
                  onClick={() => setGameState(prev => ({ ...prev, status: 'INSTRUCTIONS' }))}
                  className="group relative px-14 py-6 bg-white text-slate-950 rounded-2xl font-black text-2xl shadow-[0_20px_40px_rgba(0,0,0,0.3)] transition-all hover:scale-105 active:scale-95 flex items-center gap-4 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-emerald-500 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  <span className="relative z-10 flex items-center gap-4 group-hover:text-white transition-colors">
                    <Play className="w-7 h-7 fill-current" />
                    PLAY GAME
                  </span>
                </button>
                
                <button
                  onClick={() => setGameState(prev => ({ ...prev, status: 'INSTRUCTIONS' }))}
                  className="px-10 py-6 bg-slate-800/50 backdrop-blur-md border border-white/10 text-white rounded-2xl font-bold text-xl hover:bg-slate-800 transition-all flex items-center gap-3"
                >
                  <BookOpen className="w-6 h-6" />
                  RULES
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {gameState.status === 'INSTRUCTIONS' && (
          <motion.div
            key="instructions"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/95 backdrop-blur-2xl p-6"
          >
            <div className="max-w-2xl w-full bg-slate-900 border border-white/10 p-10 sm:p-14 rounded-[3.5rem] shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <BookOpen className="w-32 h-32" />
              </div>
              
              <div className="flex items-center gap-5 mb-10">
                <div className="w-14 h-14 bg-emerald-500/20 rounded-2xl flex items-center justify-center">
                  <BookOpen className="text-emerald-400 w-7 h-7" />
                </div>
                <h2 className="text-4xl font-black text-white">How to Play</h2>
              </div>

              <div className="grid gap-8 mb-14">
                {[
                  { icon: <Sparkles className="w-6 h-6" />, title: "The Objective", desc: "Empty your hand before the AI does. You start with 8 cards." },
                  { icon: <Layers className="w-6 h-6" />, title: "The Match", desc: "Play a card that matches the top discard's Suit (♥♦♣♠) or Rank (A-K)." },
                  { icon: <Info className="w-6 h-6" />, title: "The Wild 8", desc: "8s are special! Play them anytime to change the current suit to whatever you want." },
                  { icon: <ChevronRight className="w-6 h-6" />, title: "The Draw", desc: "Stuck? Tap the draw pile to get a new card. Your turn will end after drawing." }
                ].map((item, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    key={i} 
                    className="flex gap-5 group"
                  >
                    <div className="mt-1 text-emerald-400 group-hover:scale-110 transition-transform">{item.icon}</div>
                    <div>
                      <h3 className="font-black text-white text-lg mb-1">{item.title}</h3>
                      <p className="text-slate-400 text-base leading-relaxed">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <button
                onClick={startNewGame}
                className="w-full py-6 bg-emerald-500 hover:bg-emerald-400 text-white rounded-2xl font-black text-xl shadow-[0_15px_30px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center gap-4 group"
              >
                I'M READY
                <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="p-4 flex justify-between items-center border-b border-white/10 bg-slate-950/80 backdrop-blur-xl z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Layers className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Crazy Eights</h1>
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">GreatRichard Edition</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-full border border-white/5">
            <Info className="w-4 h-4 text-slate-400" />
            <span className="text-xs text-slate-300">Match Suit or Rank. 8 is Wild!</span>
          </div>
          <button 
            onClick={() => setGameState(prev => ({ ...prev, status: 'COVER' }))}
            className="p-2 hover:bg-white/5 rounded-full transition-colors group"
            title="Back to Menu"
          >
            <RotateCcw className="w-5 h-5 text-slate-400 group-hover:text-emerald-400 transition-colors" />
          </button>
        </div>
      </header>

      {/* Main Game Area */}
      <main className="flex-1 relative flex flex-col items-center justify-between p-4 sm:p-8 z-10">
        {/* Tutorial Overlay */}
        <AnimatePresence>
          {gameState.tutorialStep === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none w-full max-w-xs text-center"
            >
              <div className="bg-emerald-500 text-white p-6 rounded-3xl shadow-2xl border-4 border-white/20 relative">
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-emerald-500 rotate-45" />
                <p className="font-black text-lg mb-2">QUICK GUIDE!</p>
                <p className="text-sm font-medium opacity-90">
                  Look at the <span className="underline decoration-2">Discard Pile</span>. 
                  Play a card from your hand that matches its <span className="font-bold">Suit</span> or <span className="font-bold">Rank</span>.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* AI Hand */}
        <div className="w-full flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 text-slate-500 uppercase text-[10px] font-bold tracking-widest">
            <Hand className="w-3 h-3" /> AI Opponent ({gameState.aiHand.length})
          </div>
          <div className="flex -space-x-12 sm:-space-x-16 hover:space-x-2 transition-all duration-500">
            {gameState.aiHand.map((card, i) => (
              <Card key={card.id} card={card} isFaceUp={false} className="shadow-2xl" />
            ))}
          </div>
        </div>

        {/* Center: Draw & Discard Piles */}
        <div className="flex items-center gap-8 sm:gap-16 my-8">
          {/* Draw Pile */}
          <div className="flex flex-col items-center gap-2 relative">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Draw ({gameState.drawPile.length})</span>
            <div 
              onClick={() => gameState.currentTurn === 'PLAYER' && gameState.status === 'PLAYING' && drawCard('PLAYER')}
              className={`
                relative w-24 h-36 sm:w-28 sm:h-40 rounded-xl border-2 border-indigo-900 bg-indigo-700 shadow-xl
                ${gameState.currentTurn === 'PLAYER' && gameState.status === 'PLAYING' ? 'cursor-pointer hover:scale-105 ring-2 ring-emerald-400 ring-offset-4 ring-offset-slate-900' : 'opacity-50'}
                transition-all active:scale-95
              `}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-white/10 rounded-full flex items-center justify-center">
                  <ChevronRight className="w-6 h-6 text-white/20" />
                </div>
              </div>
            </div>
            
            {/* Tutorial Hint for Draw */}
            {gameState.tutorialStep === 1 && gameState.playerHand.filter(isPlayable).length === 0 && (
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity }}
                className="absolute -bottom-12 left-1/2 -translate-x-1/2 bg-indigo-500 text-white px-3 py-1 rounded-lg text-[10px] font-black whitespace-nowrap z-50"
              >
                NO MATCH? DRAW! 👆
              </motion.div>
            )}
          </div>

          {/* Discard Pile */}
          <div className="flex flex-col items-center gap-2 relative">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Discard</span>
            <div className="relative w-24 h-36 sm:w-28 sm:h-40">
              <AnimatePresence mode="popLayout">
                {gameState.discardPile.slice(-2).map((card, i) => (
                  <Card 
                    key={card.id} 
                    card={card} 
                    className="absolute inset-0 shadow-2xl" 
                    style={{ 
                      zIndex: i,
                    }} 
                  />
                ))}
              </AnimatePresence>
              {gameState.wildSuit && (
                <div className="absolute -top-4 -right-4 z-[60] bg-white text-slate-900 w-10 h-10 rounded-full flex items-center justify-center shadow-xl border-2 border-emerald-500 animate-bounce">
                  <span className={`text-2xl ${getSuitColor(gameState.wildSuit)}`}>
                    {getSuitSymbol(gameState.wildSuit)}
                  </span>
                </div>
              )}
            </div>
            
            {/* Tutorial Highlight for Discard */}
            {gameState.tutorialStep === 1 && (
              <div className="absolute inset-0 -m-4 border-4 border-emerald-500 rounded-3xl animate-pulse pointer-events-none" />
            )}
          </div>
        </div>

        {/* Player Hand */}
        <div className="w-full flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 text-slate-500 uppercase text-[10px] font-bold tracking-widest">
            <Hand className="w-3 h-3" /> Your Hand ({gameState.playerHand.length})
          </div>
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4 max-w-4xl relative">
            {gameState.playerHand.map((card) => {
              const playable = gameState.currentTurn === 'PLAYER' && gameState.status === 'PLAYING' && isPlayable(card);
              return (
                <div key={card.id} className="relative">
                  <Card 
                    card={card} 
                    isPlayable={playable}
                    onClick={() => handlePlayerPlay(card)}
                    className={gameState.tutorialStep === 1 && playable ? "ring-4 ring-emerald-500 ring-offset-4 ring-offset-slate-900" : ""}
                  />
                  {gameState.tutorialStep === 1 && playable && (
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-4 -right-4 bg-emerald-500 text-white w-8 h-8 rounded-full flex items-center justify-center z-50 shadow-lg border-2 border-white"
                    >
                      <Sparkles className="w-4 h-4" />
                    </motion.div>
                  )}
                </div>
              );
            })}
            
            {/* Tutorial Hint for Hand */}
            {gameState.tutorialStep === 1 && gameState.playerHand.filter(isPlayable).length > 0 && (
              <motion.div 
                animate={{ y: [0, 10, 0] }}
                transition={{ repeat: Infinity }}
                className="absolute -top-12 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap z-50 shadow-xl"
              >
                TAP A HIGHLIGHTED CARD! 👇
              </motion.div>
            )}
          </div>
        </div>
      </main>

      {/* Status Bar */}
      <footer className="p-4 bg-slate-950/80 backdrop-blur-xl border-t border-white/10 flex justify-center items-center z-10">
        <div className="flex items-center gap-4">
          <div className={`
            px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2
            ${gameState.currentTurn === 'PLAYER' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-indigo-500/10 text-indigo-400'}
          `}>
            <div className={`w-2 h-2 rounded-full animate-pulse ${gameState.currentTurn === 'PLAYER' ? 'bg-emerald-500' : 'bg-indigo-500'}`} />
            {message}
          </div>
        </div>
      </footer>

      {/* Overlays */}
      <AnimatePresence>
        {gameState.status === 'SELECTING_SUIT' && (
          <SuitSelector onSelect={handleSuitSelect} />
        )}
        
        {gameState.status === 'GAME_OVER' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/95 backdrop-blur-xl p-4"
          >
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
              <img 
                src={gameState.winner === 'PLAYER' 
                  ? "https://picsum.photos/seed/victory/1920/1080?blur=5" 
                  : "https://picsum.photos/seed/defeat/1920/1080?blur=5"} 
                className="w-full h-full object-cover"
                alt="result background"
                referrerPolicy="no-referrer"
              />
            </div>

            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-slate-900 border border-white/10 p-12 rounded-[3.5rem] shadow-2xl text-center max-w-md w-full relative z-10"
            >
              <motion.div 
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: gameState.winner === 'PLAYER' ? [0, 10, -10, 0] : 0
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className={`w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-8 ${gameState.winner === 'PLAYER' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}
              >
                <Trophy className="w-12 h-12" />
              </motion.div>
              
              <h2 className="text-5xl font-black text-white mb-4 tracking-tighter">
                {gameState.winner === 'PLAYER' ? 'VICTORY!' : 'GAME OVER'}
              </h2>
              
              <p className="text-slate-400 mb-10 text-lg font-medium leading-relaxed">
                {gameState.winner === 'PLAYER' 
                  ? 'Incredible play! You dominated the table and cleared your hand like a pro.' 
                  : 'The AI got lucky this time. Every defeat is just a setup for a legendary comeback!'}
              </p>
              
              <button
                onClick={startNewGame}
                className={`w-full py-5 rounded-2xl font-black text-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-2xl flex items-center justify-center gap-3 ${gameState.winner === 'PLAYER' ? 'bg-emerald-500 hover:bg-emerald-400 text-white' : 'bg-white text-slate-950 hover:bg-slate-100'}`}
              >
                <RotateCcw className="w-6 h-6" />
                REMATCH NOW
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
