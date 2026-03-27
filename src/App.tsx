import { useState, useRef, useCallback, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import axios from 'axios';

const API_BASE = 'http://172.16.3.248:3000';
const api = axios.create({ baseURL: API_BASE });
import LuckyWheel from './components/LuckyWheel';
import ParticipantList from './components/ParticipantList';
import WinnerList from './components/WinnerList';
import WinnerModal from './components/WinnerModal';
import SparkleBackground from './components/SparkleBackground';
import { IParticipant, SpinResult, WinnerDisplay, ServerToClientEvents, ClientToServerEvents } from './types';

// Socket.IO connection (viewer)
const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(API_BASE, {
  autoConnect: false,
});

function App() {
  const [isSpinning, setIsSpinning] = useState(false);
  const [participants, setParticipants] = useState<IParticipant[]>([]);
  const [selectedParticipant, setSelectedParticipant] = useState<IParticipant | null>(null);
  const [winners, setWinners] = useState<WinnerDisplay[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [currentWinner, setCurrentWinner] = useState<WinnerDisplay | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const wheelRef = useRef<{ spin: () => void; spinToResult: (spinResult: number, participantCount: number) => void } | null>(null);
  // Keep a ref to participants count for use inside socket callbacks
  const participantCountRef = useRef(0);

  useEffect(() => {
    participantCountRef.current = participants.length;
  }, [participants]);

  // Load participants from API
  const loadParticipants = async () => {
    try {
      const { data } = await api.get<IParticipant[]>('/api/participants');
      setParticipants(data);
    } catch (err) {
      console.error('Failed to load participants:', err);
    }
  };

  // Load winners from API
  const loadWinners = async () => {
    try {
      const { data } = await api.get<{ roundNumber: number; participantName: string; prize: string; prizeAmount: number }[]>('/api/winners');
      const mapped: WinnerDisplay[] = data.map((w) => ({
        number: w.roundNumber,
        username: w.participantName,
        prize: w.prize,
        reward: `${w.prizeAmount.toLocaleString()} THB`,
      }));
      setWinners(mapped);
    } catch (err) {
      console.error('Failed to load winners:', err);
    }
  };

  // Connect to Socket.IO
  useEffect(() => {
    socket.connect();

    socket.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to server');
      socket.emit('join-viewer');
      loadParticipants();
      loadWinners();
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Disconnected from server');
    });

    socket.on('spin-start', (data) => {
      setIsSpinning(true);
      console.log('Spin started for round:', data.roundNumber);
    });

    socket.on('spin-result', (data: SpinResult) => {
      const winnerData: WinnerDisplay = {
        number: data.winner.roundNumber,
        username: data.winner.participantName,
        prize: data.winner.prize,
        reward: `${data.winner.prizeAmount.toLocaleString()} THB`,
      };

      setWinners((prev) => [...prev, winnerData]);
      setCurrentWinner(winnerData);
      setParticipants((prev) => prev.filter((p) => p.id !== data.winner.participantId));

      // Trigger wheel spin directly via ref (avoids stale-state race condition)
      wheelRef.current?.spinToResult(data.winner.spinResult, participantCountRef.current);
    });

    socket.on('state-update', (data) => {
      setParticipants(data.participants);
    });

    socket.on('error', (message) => {
      console.error('Socket error:', message);
      setIsSpinning(false);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleSpinEnd = useCallback(() => {
    setIsSpinning(false);
    setShowModal(true);
  }, []);

  const closeModal = () => {
    setShowModal(false);
    setCurrentWinner(null);
  };

  return (
    <div className="min-h-screen h-screen relative overflow-hidden flex flex-col">
      {/* Sparkle Background */}
      <SparkleBackground />

      {/* Connection Status */}
      <div className="fixed top-2 right-2 z-50">
        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
          isConnected ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
        </div>
      </div>

      {/* Header */}
      <header className="relative z-10 py-4 px-4 flex-shrink-0">
        <div className="flex justify-center items-center">
          <h1 className="font-cinzel text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 drop-shadow-lg">
            🎰 Lucky Wheel Reward 🎰
          </h1>
        </div>
      </header>

      {/* Main Content - Full Screen */}
      <main className="relative z-10 flex-1 flex flex-col lg:flex-row gap-4 px-4 pb-4 min-h-0">

        {/* Left Panel - Participant List */}
        <div className="lg:w-64 flex-shrink-0 order-2 lg:order-1">
          <div className="h-48 lg:h-full">
            <ParticipantList
              participants={participants}
              selectedParticipant={selectedParticipant}
              onSelectParticipant={setSelectedParticipant}
            />
          </div>
        </div>

        {/* Center - Wheel Section */}
        <div className="flex-1 flex flex-col items-center justify-center order-1 lg:order-2 min-h-0">
          <div className="relative flex-1 flex items-center justify-center">
            <LuckyWheel
              ref={wheelRef}
              participants={participants.map(p => p.name)}
              onSpinEnd={handleSpinEnd}
              isSpinning={isSpinning}
              setIsSpinning={setIsSpinning}
            />
          </div>

          {/* Viewer label */}
          <div className="mt-4 py-2 px-8 rounded-xl font-cinzel text-base font-semibold text-yellow-400/70 flex-shrink-0">
            {isSpinning ? '🎰 Spinning...' : participants.length === 0 ? 'Waiting for participants...' : 'Waiting for Admin to spin...'}
          </div>
        </div>

        {/* Right Panel - Winner List */}
        <div className="lg:w-64 flex-shrink-0 order-3">
          <div className="h-48 lg:h-full">
            <WinnerList winners={winners} />
          </div>
        </div>
      </main>

      {/* Winner Modal */}
      <WinnerModal
        isOpen={showModal}
        winner={currentWinner}
        onClose={closeModal}
      />
    </div>
  );
}

export default App;
