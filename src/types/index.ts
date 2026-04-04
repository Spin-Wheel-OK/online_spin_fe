// Types for Spin Wheel Frontend

export interface ISession {
  _id: string;
  sessionNumber: number;
  name: string;
  createdAt?: string;
}

export interface IRound {
  roundNumber: number;
  prize: string;
  prizeAmount: number;
  totalWinners: number;
  totalSpins: number;
  remainingSpins: number;
}

export interface IParticipant {
  id?: string;
  name: string;
  hasWon: boolean;
  wonRound?: number;
  wonPrize?: string;
}

export interface IWinner {
  roundNumber: number;
  participantId: string;
  participantName: string;
  prize: string;
  prizeAmount: number;
  spinResult: number;
  timestamp: Date;
}

export interface SpinRequest {
  roundNumber: number;
}

export interface SpinResult {
  winner: IWinner;
  remainingParticipants: number;
  remainingSpins: number;
  wheelSegments: { id: string; name: string }[];
  winnerWheelIndex: number;
}

export interface AdminState {
  rounds: IRound[];
  participants: IParticipant[];
  winners: IWinner[];
  currentRound: number;
}

// Socket.IO event types
export interface ClientToServerEvents {
  'join-admin': () => void;
  'join-viewer': () => void;
  'spin-wheel': (data: SpinRequest) => void;
  'update-participants': (participants: IParticipant[]) => void;
  'update-rounds': (rounds: IRound[]) => void;
  'select-round': (data: { roundNumber: number; prize: string; prizeAmount: number }) => void;
  'select-session': (data: { sessionId: string | null }) => void;
  'spin-ended': () => void;
  'dismiss-winner': () => void;
  'welcome-mode': (data: { enabled: boolean }) => void;
}

export interface ServerToClientEvents {
  'spin-start': (data: { roundNumber: number; wheelSegments?: { id: string; name: string }[] }) => void;
  'spin-result': (data: SpinResult) => void;
  'state-update': (data: AdminState) => void;
  'round-selected': (data: { roundNumber: number; prize: string; prizeAmount: number }) => void;
  'spin-ended': () => void;
  'dismiss-winner': () => void;
  'error': (message: string) => void;
  'welcome-mode': (data: { enabled: boolean }) => void;
}

// Winner display type
export interface WinnerDisplay {
  number: number;
  participantId: string;
  username: string;
  prize: string;
  reward: string;
}