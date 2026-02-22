export enum Suit {
  HEARTS = 'HEARTS',
  DIAMONDS = 'DIAMONDS',
  CLUBS = 'CLUBS',
  SPADES = 'SPADES',
}

export enum Rank {
  ACE = 'A',
  TWO = '2',
  THREE = '3',
  FOUR = '4',
  FIVE = '5',
  SIX = '6',
  SEVEN = '7',
  EIGHT = '8',
  NINE = '9',
  TEN = '10',
  JACK = 'J',
  QUEEN = 'Q',
  KING = 'K',
}

export interface CardData {
  id: string;
  suit: Suit;
  rank: Rank;
}

export type GameStatus = 'COVER' | 'INSTRUCTIONS' | 'WAITING' | 'PLAYING' | 'SELECTING_SUIT' | 'GAME_OVER';
export type Turn = 'PLAYER' | 'AI';

export interface GameState {
  playerHand: CardData[];
  aiHand: CardData[];
  drawPile: CardData[];
  discardPile: CardData[];
  currentTurn: Turn;
  status: GameStatus;
  wildSuit: Suit | null;
  winner: Turn | null;
  isFirstGame: boolean;
  tutorialStep: number;
}
