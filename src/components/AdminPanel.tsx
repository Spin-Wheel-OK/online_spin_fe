import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import axios from 'axios';
import { IRound, IParticipant, IWinner, AdminState, ServerToClientEvents, ClientToServerEvents } from '../types';

const API_BASE = 'http://172.16.3.248:3000';

const api = axios.create({ baseURL: API_BASE });

const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(API_BASE, {
  autoConnect: false,
});

const AdminPanel = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [rounds, setRounds] = useState<IRound[]>([]);
  const [participants, setParticipants] = useState<IParticipant[]>([]);
  const [winners, setWinners] = useState<IWinner[]>([]);
  const [currentRound, setCurrentRound] = useState(1);
  const [participantText, setParticipantText] = useState('');
  const [isSpinning, setIsSpinning] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const statusRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showStatus = (msg: string) => {
    setStatusMsg(msg);
    if (statusRef.current) clearTimeout(statusRef.current);
    statusRef.current = setTimeout(() => setStatusMsg(''), 4000);
  };

  const loadAdminState = async () => {
    try {
      const { data } = await api.get<AdminState>('/api/admin-state');
      setRounds(data.rounds);
      setParticipants(data.participants);
      setWinners(data.winners);
      setCurrentRound(data.currentRound || 1);
    } catch (err) {
      console.error('Failed to load admin state:', err);
    }
  };

  useEffect(() => {
    socket.connect();

    socket.on('connect', () => {
      setIsConnected(true);
      socket.emit('join-admin');
      loadAdminState();
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('spin-result', (data) => {
      setIsSpinning(false);
      showStatus(`✅ Winner: ${data.winner.participantName} — ${data.winner.prize}`);
      setParticipants((prev) => prev.filter((p) => p.id !== data.winner.participantId));
      setWinners((prev) => [...prev, data.winner]);
      // Update remaining spins
      setRounds((prev) =>
        prev.map((r) =>
          r.roundNumber === data.winner.roundNumber
            ? { ...r, remainingSpins: data.remainingSpins }
            : r
        )
      );
    });

    socket.on('error', (message) => {
      setIsSpinning(false);
      showStatus(`❌ Error: ${message}`);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleUploadParticipants = async () => {
    const names = participantText
      .split('\n')
      .map((n) => n.trim())
      .filter((n) => n.length > 0);

    if (names.length === 0) {
      showStatus('❌ Please enter at least one participant name.');
      return;
    }

    setIsLoading(true);
    try {
      const participantObjs: IParticipant[] = names.map((name, i) => ({
        id: `p-${Date.now()}-${i}`,
        name,
        hasWon: false,
      }));

      await api.post('/api/participants', participantObjs);
      setParticipants(participantObjs);
      showStatus(`✅ Uploaded ${names.length} participants.`);
    } catch {
      showStatus('❌ Failed to upload participants.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpin = async () => {
    if (isSpinning) return;

    const round = rounds.find((r) => r.roundNumber === currentRound);
    if (!round) {
      showStatus('❌ Round not found.');
      return;
    }
    if (round.remainingSpins <= 0) {
      showStatus('❌ No remaining spins for this round.');
      return;
    }
    if (participants.length === 0) {
      showStatus('❌ No participants available.');
      return;
    }

    setIsSpinning(true);
    showStatus(`🎰 Spinning round ${currentRound}...`);

    try {
      await api.post('/api/spin', { roundNumber: currentRound });
      // Result handled via socket spin-result event
    } catch (err: unknown) {
      setIsSpinning(false);
      const msg = axios.isAxiosError(err) ? (err.response?.data?.error ?? 'Spin failed') : 'Network error during spin.';
      showStatus(`❌ ${msg}`);
    }
  };

  const handleReset = async () => {
    if (!confirm('Reset ALL data? This cannot be undone.')) return;
    setIsLoading(true);
    try {
      await api.post('/api/reset');
      await loadAdminState();
      setParticipantText('');
      setWinners([]);
      showStatus('✅ Data reset successfully.');
    } catch {
      showStatus('❌ Reset failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedRound = rounds.find((r) => r.roundNumber === currentRound);

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-cinzel text-3xl font-bold text-yellow-400">
          🎛️ Admin Panel
        </h1>
        <div className="flex items-center gap-3">
          <a href="/" className="text-sm text-yellow-400 hover:underline">← View Wheel</a>
          <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
            isConnected ? 'bg-green-500' : 'bg-red-500'
          }`}>
            {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
          </div>
        </div>
      </div>

      {/* Status message */}
      {statusMsg && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-yellow-900/50 border border-yellow-500/50 text-yellow-200 text-sm">
          {statusMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Left: Participant Input */}
        <div className="bg-gray-900 rounded-xl p-5 border border-yellow-500/30">
          <h2 className="font-cinzel text-xl font-semibold text-yellow-400 mb-3">
            📋 Participant List
          </h2>
          <p className="text-gray-400 text-sm mb-2">One name per line. Uploading will replace the current list.</p>
          <textarea
            value={participantText}
            onChange={(e) => setParticipantText(e.target.value)}
            className="w-full h-48 bg-black/60 border border-yellow-500/30 rounded-lg p-3 text-white text-sm resize-none focus:outline-none focus:border-yellow-500"
            placeholder="Alice&#10;Bob&#10;Charlie&#10;..."
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-gray-400 text-xs">
              Currently active: {participants.length} participants
            </span>
            <button
              onClick={handleUploadParticipants}
              disabled={isLoading}
              className="px-4 py-2 rounded-lg font-semibold text-sm bg-yellow-500 hover:bg-yellow-400 text-black transition-colors disabled:opacity-50"
            >
              Upload
            </button>
          </div>

          {/* Active participants preview */}
          {participants.length > 0 && (
            <div className="mt-3 max-h-32 overflow-y-auto space-y-1">
              {participants.map((p, i) => (
                <div key={p.id || i} className="text-sm text-gray-300 px-2 py-1 bg-black/30 rounded flex items-center gap-2">
                  <span className="text-yellow-500 text-xs font-orbitron">#{i + 1}</span>
                  {p.name}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Round Selection & Spin Control */}
        <div className="bg-gray-900 rounded-xl p-5 border border-yellow-500/30">
          <h2 className="font-cinzel text-xl font-semibold text-yellow-400 mb-3">
            🎯 Round Control
          </h2>

          {/* Round table */}
          <div className="overflow-x-auto mb-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 border-b border-yellow-500/20">
                  <th className="text-left py-1 pr-3">Round</th>
                  <th className="text-left py-1 pr-3">Prize</th>
                  <th className="text-center py-1 pr-3">Spins left</th>
                  <th className="text-center py-1">Select</th>
                </tr>
              </thead>
              <tbody>
                {rounds.map((r) => (
                  <tr
                    key={r.roundNumber}
                    className={`border-b border-yellow-500/10 transition-colors ${
                      currentRound === r.roundNumber ? 'bg-yellow-500/10' : 'hover:bg-white/5'
                    }`}
                  >
                    <td className="py-1.5 pr-3 font-orbitron text-yellow-400">#{r.roundNumber}</td>
                    <td className="py-1.5 pr-3 text-white">{r.prize}</td>
                    <td className="py-1.5 pr-3 text-center">
                      <span className={`font-orbitron ${r.remainingSpins === 0 ? 'text-gray-500' : 'text-green-400'}`}>
                        {r.remainingSpins}/{r.totalSpins}
                      </span>
                    </td>
                    <td className="py-1.5 text-center">
                      <button
                        onClick={() => setCurrentRound(r.roundNumber)}
                        disabled={r.remainingSpins === 0}
                        className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                          currentRound === r.roundNumber
                            ? 'bg-yellow-500 text-black'
                            : r.remainingSpins === 0
                            ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                            : 'bg-gray-700 hover:bg-gray-600 text-white'
                        }`}
                      >
                        {currentRound === r.roundNumber ? 'Selected' : 'Select'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Spin button */}
          {selectedRound && (
            <div className="bg-black/40 rounded-lg p-4 mb-4">
              <div className="text-gray-400 text-sm mb-1">Selected Round:</div>
              <div className="text-yellow-400 font-cinzel font-bold text-lg">
                Round {selectedRound.roundNumber} — {selectedRound.prize}
              </div>
              <div className="text-gray-400 text-sm mt-1">
                Remaining spins: {selectedRound.remainingSpins}
              </div>
            </div>
          )}

          <button
            onClick={handleSpin}
            disabled={isSpinning || participants.length === 0 || !selectedRound || selectedRound.remainingSpins === 0}
            className={`w-full py-4 rounded-xl font-cinzel text-xl font-bold transition-all duration-300 ${
              isSpinning || participants.length === 0 || !selectedRound || selectedRound.remainingSpins === 0
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black'
            }`}
          >
            {isSpinning
              ? '🎰 Spinning...'
              : participants.length === 0
              ? 'No Participants'
              : !selectedRound || selectedRound.remainingSpins === 0
              ? 'No Spins Left'
              : `🎰 Spin Round ${currentRound}`}
          </button>
        </div>

        {/* Winners Log */}
        <div className="lg:col-span-2 bg-gray-900 rounded-xl p-5 border border-yellow-500/30">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-cinzel text-xl font-semibold text-yellow-400">
              🏆 Winners Log
            </h2>
            <button
              onClick={handleReset}
              disabled={isLoading}
              className="px-3 py-1 rounded text-xs font-semibold bg-red-900/50 hover:bg-red-800/50 border border-red-500/50 text-red-300 transition-colors disabled:opacity-50"
            >
              Reset All
            </button>
          </div>

          {winners.length === 0 ? (
            <div className="text-gray-400 text-sm text-center py-4">No winners yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-400 border-b border-yellow-500/20">
                    <th className="text-left py-1 pr-4">Round</th>
                    <th className="text-left py-1 pr-4">Name</th>
                    <th className="text-left py-1 pr-4">Prize</th>
                    <th className="text-left py-1">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {winners.map((w, i) => (
                    <tr key={i} className="border-b border-yellow-500/10">
                      <td className="py-1.5 pr-4 font-orbitron text-yellow-400">#{w.roundNumber}</td>
                      <td className="py-1.5 pr-4 text-white">{w.participantName}</td>
                      <td className="py-1.5 pr-4 text-green-400 font-orbitron">{w.prize}</td>
                      <td className="py-1.5 text-gray-400">
                        {w.timestamp ? new Date(w.timestamp).toLocaleTimeString() : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
