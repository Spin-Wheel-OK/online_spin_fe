import { useState, useRef, useCallback, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

const API_BASE = import.meta.env.VITE_API_BASE as string;
import LuckyWheel from './components/LuckyWheel';
import ParticipantList from './components/ParticipantList';
import WinnerList from './components/WinnerList';
import WinnerModal from './components/WinnerModal';
import SparkleBackground from './components/SparkleBackground';
import LanguageToggle from './components/LanguageToggle';
import { useTranslation } from './i18n/LanguageContext';
import { IParticipant, SpinResult, WinnerDisplay, ServerToClientEvents, ClientToServerEvents } from './types';
import { playCrowd, stopCrowd } from './audio';

// Socket.IO connection (viewer)
const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(API_BASE, {
  autoConnect: false,
});

function App() {
  const { t } = useTranslation();
  const [isSpinning, setIsSpinning] = useState(false);
  const [participants, setParticipants] = useState<IParticipant[]>([]);
  const [selectedParticipant, setSelectedParticipant] = useState<IParticipant | null>(null);
  const [winners, setWinners] = useState<WinnerDisplay[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [currentWinner, setCurrentWinner] = useState<WinnerDisplay | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentRoundLabel, setCurrentRoundLabel] = useState<{ roundNumber: number; prize: string } | null>(null);
  const [wheelSegments, setWheelSegments] = useState<{ id: string; name: string }[] | null>(null);
  const wheelRef = useRef<{ spin: () => void; spinToResult: (spinResult: number, participantCount: number) => void } | null>(null);
  const pendingWinnerRef = useRef<{ winnerData: WinnerDisplay; participantId: string } | null>(null);
  const lastWinnerIdRef = useRef<string | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const [welcomeMuted, setWelcomeMuted] = useState(true);
  const welcomeVideoRef = useRef<HTMLVideoElement | null>(null);
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(max-width: 767px)').matches : false
  );

  const toggleWelcomeMuted = () => {
    setWelcomeMuted((prev) => {
      const next = !prev;
      const v = welcomeVideoRef.current;
      if (v) {
        v.muted = next;
        v.play().catch(() => {});
      }
      return next;
    });
  };

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Connect to Socket.IO
  useEffect(() => {
    socket.connect();

    socket.on('connect', () => {
      setIsConnected(true);
      socket.emit('join-viewer');
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('round-selected', (data) => {
      setCurrentRoundLabel({ roundNumber: data.roundNumber, prize: data.prize });
    });

    socket.on('spin-start', (data) => {
      setIsSpinning(true);
      if (data.wheelSegments) {
        setWheelSegments(data.wheelSegments);
      }
    });

    socket.on('spin-result', (data: SpinResult) => {
      const winnerData: WinnerDisplay = {
        number: data.winner.roundNumber,
        participantId: data.winner.participantId,
        username: data.winner.participantName,
        prize: data.winner.prize,
        reward: `${data.winner.prizeAmount.toLocaleString()} THB`,
      };

      pendingWinnerRef.current = { winnerData, participantId: data.winner.participantId };

      const ws = data.wheelSegments;
      const segCount = ws?.length ?? 8;
      const segAngle = 360 / segCount;
      const idx = data.winnerWheelIndex ?? 0;
      const segCenter = idx * segAngle + segAngle / 2;
      const randomOffset = (Math.random() - 0.5) * segAngle * 0.6;
      const clientSpinResult = ((270 - segCenter + randomOffset) % 360 + 360) % 360;

      wheelRef.current?.spinToResult(clientSpinResult, segCount);
    });

    socket.on('state-update', (data) => {
      setParticipants(data.participants ?? []);
      const mapped: WinnerDisplay[] = (data.winners ?? []).map((w: { roundNumber: number; participantId: string; participantName: string; prize: string; prizeAmount: number }) => ({
        number: w.roundNumber,
        participantId: w.participantId,
        username: w.participantName,
        prize: w.prize,
        reward: `${w.prizeAmount.toLocaleString()} THB`,
      }));
      setWinners(mapped);
      if (!data.participants?.length && !data.winners?.length) {
        setCurrentRoundLabel(null);
      }
    });

    socket.on('dismiss-winner', () => {
      setShowModal(false);
      setCurrentWinner(null);
      stopCrowd(); // หยุดเสียงเชียร์
      const winnerId = lastWinnerIdRef.current;
      if (winnerId) {
        setParticipants((prev) => prev.filter((p) => p.id !== winnerId));
        lastWinnerIdRef.current = null;
      }
      setWheelSegments(null);
    });

    socket.on('error', (message) => {
      console.error('Socket error:', message);
      setIsSpinning(false);
    });

    socket.on('welcome-mode', (data) => {
      setShowWelcome(data.enabled);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('round-selected');
      socket.off('spin-start');
      socket.off('spin-result');
      socket.off('state-update');
      socket.off('dismiss-winner');
      socket.off('error');
      socket.off('welcome-mode');
      socket.disconnect();
    };
  }, []);

  const handleSpinEnd = useCallback(() => {
    setIsSpinning(false);
    const pending = pendingWinnerRef.current;
    if (pending) {
      setCurrentWinner(pending.winnerData);
      setShowModal(true);
      playCrowd(); // เสียงเชียร์ตอนประกาศผู้โชคดี
      lastWinnerIdRef.current = pending.participantId;
      // Immediately add winner to local list (dedup by participantId+number)
      setWinners(prev => {
        const exists = prev.some(w => w.participantId === pending.winnerData.participantId && w.number === pending.winnerData.number);
        return exists ? prev : [...prev, pending.winnerData];
      });
      pendingWinnerRef.current = null;
    }
    socket.emit('spin-ended');
  }, []);

  // Build round label with translation
  const headerTitle = currentRoundLabel
    ? t('roundLabel', { n: currentRoundLabel.roundNumber, prize: currentRoundLabel.prize })
    : t('defaultTitle');

  return (
    <div className="min-h-screen h-screen relative overflow-hidden flex flex-col">
      <SparkleBackground />

      {/* Top-right controls: Language + Connection */}
      <div className="fixed top-2 right-2 z-50 flex items-center gap-2">
        <LanguageToggle />
        <div className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm ${
          isConnected
            ? 'bg-emerald-500/80 text-white border border-emerald-400/40'
            : 'bg-red-500/80 text-white border border-red-400/40'
        }`}>
          {isConnected ? `🟢 ${t('connected')}` : `🔴 ${t('disconnected')}`}
        </div>
      </div>

      {/* Header — compact */}
      <header className="relative z-10 py-1 px-4 flex-shrink-0">
        <div className="flex flex-col justify-center items-center">
          <div className="flex items-center gap-2 bg-black/60 backdrop-blur-sm px-4 py-1.5 rounded-xl border border-orange-400/30">
            <span className="text-lg float-sway" style={{ animationDelay: '0s' }}>💦</span>
            <h1 className="font-prompt text-xl md:text-2xl font-bold text-amber-400 leading-tight"
                style={{ textShadow: '0 0 20px rgba(247,148,29,0.5), 0 1px 4px rgba(0,0,0,0.8)' }}>
              {headerTitle}
            </h1>
            <span className="text-lg float-sway" style={{ animationDelay: '1s' }}>🌺</span>
          </div>
          <p className="text-white text-xs md:text-sm font-prompt font-bold text-center leading-tight mt-1 px-4 py-1 bg-black/50 backdrop-blur-sm rounded-lg border border-orange-400/30" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.9)' }}>{t('blessingMessage')}</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex flex-col lg:flex-row gap-2 px-2 pb-2 min-h-0">
        <div className="lg:w-64 flex-shrink-0 order-2 lg:order-1">
          <div className="h-48 lg:h-full">
            <ParticipantList
              participants={participants}
              selectedParticipant={selectedParticipant}
              onSelectParticipant={setSelectedParticipant}
            />
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center order-1 lg:order-2 min-h-0">
          <div className="relative flex-1 flex items-center justify-center">
            <LuckyWheel
              ref={wheelRef}
              participants={participants.map(p => p.name)}
              participantIds={participants.map(p => p.id ?? '')}
              wheelSegments={wheelSegments}
              onSpinEnd={handleSpinEnd}
              isSpinning={isSpinning}
              setIsSpinning={setIsSpinning}
            />
          </div>
          <div className="mt-1 py-1 px-4 rounded-lg font-prompt text-xs font-semibold text-orange-200/90 flex-shrink-0 bg-black/60 backdrop-blur-sm border border-orange-400/15">
            {isSpinning ? `💦 ${t('spinning')}` : participants.length === 0 ? t('waitingParticipants') : `🪷 ${t('waitingAdmin')}`}
          </div>
        </div>

        <div className="lg:w-64 flex-shrink-0 order-3">
          <div className="h-48 lg:h-full">
            <WinnerList winners={winners} />
          </div>
        </div>
      </main>

      <WinnerModal
        isOpen={showModal}
        winner={currentWinner}
        onClose={() => {}}
      />

      {/* Welcome Mode — fullscreen overlay */}
      {showWelcome && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black">
          <video
            key={isMobile ? 'mobile' : 'pc'}
            ref={welcomeVideoRef}
            src={
              isMobile
                ? 'https://ui-task-files.781243555.com/r2-uploader/2026-04-08/1775630255315_qmwr69_OKVIP_9_16.mp4'
                : 'https://ui-task-files.781243555.com/r2-uploader/2026-04-08/1775629949924_01cveq_OKVIP_16_9.mp4'
            }
            autoPlay
            loop
            muted={welcomeMuted}
            playsInline
            className="w-full h-full object-cover absolute inset-0"
          />
          <button
            onClick={toggleWelcomeMuted}
            className="absolute bottom-6 right-6 z-10 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-sm border border-white/30 text-white w-14 h-14 flex items-center justify-center text-2xl transition"
            aria-label={welcomeMuted ? 'Unmute' : 'Mute'}
          >
            {welcomeMuted ? '🔇' : '🔊'}
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
