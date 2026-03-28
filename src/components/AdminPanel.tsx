import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import axios from 'axios';
import { ISession, IRound, IParticipant, IWinner, WinnerDisplay, AdminState, ServerToClientEvents, ClientToServerEvents } from '../types';
import WinnerModal from './WinnerModal';
import LanguageToggle from './LanguageToggle';
import { useTranslation } from '../i18n/LanguageContext';

const API_BASE = import.meta.env.VITE_API_BASE as string;
const api = axios.create({ baseURL: API_BASE });
const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(API_BASE, { autoConnect: false });

const AdminPanel = () => {
  const { t } = useTranslation();
  const [isConnected, setIsConnected] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const statusRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Session state
  const [sessions, setSessions] = useState<ISession[]>([]);
  const [activeSession, setActiveSession] = useState<ISession | null>(null);
  const [showSessionForm, setShowSessionForm] = useState(false);
  const [editingSession, setEditingSession] = useState<ISession | null>(null);
  const [sessionName, setSessionName] = useState('');

  // Data state (scoped to activeSession)
  const [rounds, setRounds] = useState<IRound[]>([]);
  const [participants, setParticipants] = useState<IParticipant[]>([]);
  const [winners, setWinners] = useState<IWinner[]>([]);
  const [currentRound, setCurrentRound] = useState(1);
  const [participantText, setParticipantText] = useState('');
  const [isSpinning, setIsSpinning] = useState(false);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [currentWinnerDisplay, setCurrentWinnerDisplay] = useState<WinnerDisplay | null>(null);
  const pendingWinnerRef = useRef<{ winner: IWinner; remainingSpins: number } | null>(null);
  const lastWinnerIdRef = useRef<string | null>(null);

  // Round CRUD state
  const [showRoundForm, setShowRoundForm] = useState(false);
  const [editingRound, setEditingRound] = useState<IRound | null>(null);
  const [roundForm, setRoundForm] = useState({ roundNumber: 0, prize: '', prizeAmount: 0, totalSpins: 1 });

  const showStatus = (msg: string) => {
    setStatusMsg(msg);
    if (statusRef.current) clearTimeout(statusRef.current);
    statusRef.current = setTimeout(() => setStatusMsg(''), 4000);
  };

  const loadSessions = async () => {
    try {
      const { data } = await api.get<ISession[]>('/api/sessions');
      setSessions(data);
      return data;
    } catch {
      return [];
    }
  };

  const loadAdminState = async (sessionId: string) => {
    try {
      const { data } = await api.get<AdminState>(`/api/sessions/${sessionId}/admin-state`);
      setRounds(data.rounds);
      setParticipants(data.participants);
      setWinners(data.winners);

      // Auto-select: highest round number that still has spins left (e.g. #6 before #1)
      const availableRound = [...data.rounds]
        .sort((a, b) => b.roundNumber - a.roundNumber)
        .find(r => r.remainingSpins > 0);

      if (availableRound) {
        setCurrentRound(availableRound.roundNumber);
        socket.emit('select-round', { roundNumber: availableRound.roundNumber, prize: availableRound.prize, prizeAmount: availableRound.prizeAmount });
      } else {
        // All rounds done — just pick the last one
        const lastRound = data.rounds[data.rounds.length - 1];
        setCurrentRound(lastRound?.roundNumber ?? 1);
      }
    } catch (err) {
      console.error('Failed to load admin state:', err);
    }
  };

  useEffect(() => {
    socket.connect();
    socket.on('connect', () => {
      setIsConnected(true);
      socket.emit('join-admin');
      loadSessions();
    });
    socket.on('disconnect', () => setIsConnected(false));
    socket.on('spin-result', (data) => {
      pendingWinnerRef.current = { winner: data.winner, remainingSpins: data.remainingSpins };
      showStatus(`🎰 ${t('spinning')}`);
    });
    socket.on('spin-ended', () => {
      const pending = pendingWinnerRef.current;
      if (pending) {
        showStatus(`✅ ${t('msgWinner', { name: pending.winner.participantName, prize: pending.winner.prize })}`);
        lastWinnerIdRef.current = pending.winner.participantId;
        setWinners((prev) => {
          const isDup = prev.some(w =>
            w.participantId === pending.winner.participantId &&
            w.roundNumber === pending.winner.roundNumber &&
            w.prize === pending.winner.prize
          );
          return isDup ? prev : [...prev, pending.winner];
        });
        setRounds((prev) => {
          const updated = prev.map((r) =>
            r.roundNumber === pending.winner.roundNumber ? { ...r, remainingSpins: pending.remainingSpins } : r
          );
          // Auto-select next round if current round has no spins left
          // Go DOWN: #6→#5→#4→#3→#2→#1 (highest remaining first)
          if (pending.remainingSpins <= 0) {
            const nextRound = updated
              .filter(r => r.remainingSpins > 0)
              .sort((a, b) => b.roundNumber - a.roundNumber)[0];
            if (nextRound) {
              setCurrentRound(nextRound.roundNumber);
              socket.emit('select-round', { roundNumber: nextRound.roundNumber, prize: nextRound.prize, prizeAmount: nextRound.prizeAmount });
            }
          }
          return updated;
        });
        setCurrentWinnerDisplay({
          number: pending.winner.roundNumber,
          participantId: pending.winner.participantId,
          username: pending.winner.participantName,
          prize: pending.winner.prize,
          reward: `${pending.winner.prizeAmount.toLocaleString()} THB`,
        });
        setShowWinnerModal(true);
        pendingWinnerRef.current = null;
      }
      setIsSpinning(false);
    });
    socket.on('error', (message) => {
      setIsSpinning(false);
      showStatus(`❌ ${t('msgError')}: ${message}`);
    });
    socket.on('dismiss-winner', () => {
      setShowWinnerModal(false);
      setCurrentWinnerDisplay(null);
      const winnerId = lastWinnerIdRef.current;
      if (winnerId) {
        setParticipants((prev) => prev.filter((p) => p.id !== winnerId));
        lastWinnerIdRef.current = null;
      }
    });
    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('spin-result');
      socket.off('spin-ended');
      socket.off('dismiss-winner');
      socket.off('error');
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    setIsSpinning(false);
    pendingWinnerRef.current = null;
    setShowWinnerModal(false);
    setCurrentWinnerDisplay(null);

    if (activeSession) {
      loadAdminState(activeSession._id);
      socket.emit('select-session', { sessionId: activeSession._id });
    } else {
      setRounds([]); setParticipants([]); setWinners([]);
      socket.emit('select-session', { sessionId: null });
    }
  }, [activeSession]);

  // ─── SESSION HANDLERS ───────────────────────────────────────

  const handleCreateSession = async () => {
    if (!sessionName.trim()) { showStatus(`❌ ${t('msgEnterSessionName')}`); return; }
    setIsLoading(true);
    try {
      const { data } = await api.post<ISession>('/api/sessions', { name: sessionName.trim() });
      const updated = await loadSessions();
      setActiveSession(updated.find(s => s._id === data._id) ?? data);
      setSessionName('');
      setShowSessionForm(false);
      showStatus(`✅ ${t('msgSessionCreated', { name: data.name })}`);
    } catch { showStatus(`❌ ${t('msgFailedCreateSession')}`); }
    finally { setIsLoading(false); }
  };

  const handleUpdateSession = async () => {
    if (!editingSession || !sessionName.trim()) return;
    setIsLoading(true);
    try {
      await api.put(`/api/sessions/${editingSession._id}`, { name: sessionName.trim() });
      const updated = await loadSessions();
      if (activeSession?._id === editingSession._id) {
        setActiveSession(updated.find(s => s._id === editingSession._id) ?? null);
      }
      setEditingSession(null);
      setSessionName('');
      setShowSessionForm(false);
      showStatus(`✅ ${t('msgSessionUpdated')}`);
    } catch { showStatus(`❌ ${t('msgFailedUpdateSession')}`); }
    finally { setIsLoading(false); }
  };

  const handleDeleteSession = async (session: ISession) => {
    if (!confirm(t('deleteSessionConfirm', { n: session.sessionNumber, name: session.name }))) return;
    setIsLoading(true);
    try {
      await api.delete(`/api/sessions/${session._id}`);
      if (activeSession?._id === session._id) setActiveSession(null);
      await loadSessions();
      showStatus(`✅ ${t('msgSessionDeleted', { name: session.name })}`);
    } catch { showStatus(`❌ ${t('msgFailedDeleteSession')}`); }
    finally { setIsLoading(false); }
  };

  const handleResetSession = async () => {
    if (!activeSession) { showStatus(`❌ ${t('selectSessionFirst')}`); return; }
    if (!confirm(t('resetSessionConfirm', { n: activeSession.sessionNumber, name: activeSession.name }))) return;
    setIsLoading(true);
    try {
      await api.post(`/api/sessions/${activeSession._id}/reset`);
      await loadAdminState(activeSession._id);
      setParticipantText('');
      showStatus(`✅ ${t('msgResetSuccess')}`);
    } catch { showStatus(`❌ ${t('msgFailedReset')}`); }
    finally { setIsLoading(false); }
  };

  // ─── PARTICIPANT HANDLERS ────────────────────────────────────

  const handleUploadParticipants = async () => {
    if (!activeSession) { showStatus(`❌ ${t('selectSessionFirst')}`); return; }
    const names = participantText.split('\n').map(n => n.trim()).filter(n => n.length > 0);
    if (names.length === 0) { showStatus(`❌ ${t('enterAtLeastOne')}`); return; }
    setIsLoading(true);
    try {
      const participantObjs: IParticipant[] = names.map((name, i) => ({ id: `p-${i + 1}`, name, hasWon: false }));
      await api.post(`/api/sessions/${activeSession._id}/participants`, participantObjs);
      setParticipants(participantObjs);
      showStatus(`✅ ${t('msgUploaded', { n: names.length })}`);
    } catch { showStatus(`❌ ${t('msgFailedUpload')}`); }
    finally { setIsLoading(false); }
  };

  // ─── SPIN HANDLER ────────────────────────────────────────────

  const handleSpin = async () => {
    if (!activeSession || isSpinning) return;
    const round = rounds.find(r => r.roundNumber === currentRound);
    if (!round) { showStatus(`❌ ${t('msgRoundNotFound')}`); return; }
    if (round.remainingSpins <= 0) { showStatus(`❌ ${t('msgNoRemainingSpins')}`); return; }
    if (participants.length === 0) { showStatus(`❌ ${t('msgNoParticipants')}`); return; }
    setIsSpinning(true);
    showStatus(`🎰 ${t('msgSpinning', { n: currentRound })}`);
    try {
      await api.post(`/api/sessions/${activeSession._id}/spin`, { roundNumber: currentRound });
    } catch (err: unknown) {
      setIsSpinning(false);
      const msg = axios.isAxiosError(err) ? (err.response?.data?.error ?? t('msgSpinFailed')) : t('msgNetworkError');
      showStatus(`❌ ${msg}`);
    }
  };

  // ─── ROUND HANDLERS ──────────────────────────────────────────

  const handleOpenCreateRound = () => {
    // Auto-fill next round number
    const maxRound = rounds.length > 0 ? Math.max(...rounds.map(r => r.roundNumber)) : 0;
    setEditingRound(null);
    setRoundForm({ roundNumber: maxRound + 1, prize: '', prizeAmount: 0, totalSpins: 1 });
    setShowRoundForm(true);
  };

  const handleOpenEditRound = (r: IRound) => {
    setEditingRound(r);
    setRoundForm({ roundNumber: r.roundNumber, prize: r.prize, prizeAmount: r.prizeAmount, totalSpins: r.totalSpins });
    setShowRoundForm(true);
  };

  const handleSaveRound = async () => {
    if (!activeSession) return;
    if (!roundForm.prize || roundForm.prizeAmount <= 0 || roundForm.totalSpins <= 0) {
      showStatus(`❌ ${t('fillAllFields')}`); return;
    }
    setIsLoading(true);
    try {
      if (editingRound) {
        await api.put(`/api/sessions/${activeSession._id}/rounds/${editingRound.roundNumber}`, roundForm);
        showStatus(`✅ ${t('msgRoundUpdated', { n: editingRound.roundNumber })}`);
      } else {
        await api.post(`/api/sessions/${activeSession._id}/rounds`, roundForm);
        showStatus(`✅ ${t('msgRoundCreated')}`);
      }
      setShowRoundForm(false);
      await loadAdminState(activeSession._id);
    } catch { showStatus(`❌ ${t('msgFailedSaveRound')}`); }
    finally { setIsLoading(false); }
  };

  const handleDeleteRound = async (roundNumber: number) => {
    if (!activeSession) return;
    if (!confirm(t('deleteRoundConfirm', { n: roundNumber }))) return;
    setIsLoading(true);
    try {
      await api.delete(`/api/sessions/${activeSession._id}/rounds/${roundNumber}`);
      showStatus(`✅ ${t('msgRoundDeleted', { n: roundNumber })}`);
      await loadAdminState(activeSession._id);
    } catch { showStatus(`❌ ${t('msgFailedDeleteRound')}`); }
    finally { setIsLoading(false); }
  };

  const selectedRound = rounds.find(r => r.roundNumber === currentRound);

  return (
    <div className="min-h-screen bg-black text-white p-6">

      {/* ─── SESSION DIALOG ─────────────────────────────────────── */}
      {showSessionForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-gray-900 border border-yellow-500/40 rounded-xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="font-cinzel text-lg font-bold text-yellow-400 mb-4">
              {editingSession ? `✏️ ${t('editSessionTitle', { n: editingSession.sessionNumber })}` : `➕ ${t('newSessionTitle')}`}
            </h3>
            <input
              autoFocus
              type="text"
              value={sessionName}
              onChange={e => setSessionName(e.target.value)}
              placeholder={t('sessionNamePlaceholder')}
              className="w-full bg-black/60 border border-yellow-500/30 rounded px-3 py-2 text-white text-sm mb-4 focus:outline-none focus:border-yellow-500"
              onKeyDown={e => e.key === 'Enter' && (editingSession ? handleUpdateSession() : handleCreateSession())}
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => { setShowSessionForm(false); setEditingSession(null); setSessionName(''); }}
                className="px-4 py-2 rounded text-sm bg-gray-700 hover:bg-gray-600 text-white"
              >{t('cancel')}</button>
              <button
                onClick={editingSession ? handleUpdateSession : handleCreateSession}
                disabled={isLoading}
                className="px-4 py-2 rounded text-sm bg-yellow-500 hover:bg-yellow-400 text-black font-bold disabled:opacity-50"
              >{editingSession ? t('save') : t('create')}</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <h1 className="font-cinzel text-3xl font-bold text-yellow-400 mr-2">🎛️ {t('adminPanel')}</h1>

        {/* Select dropdown */}
        <select
          value={activeSession?._id ?? ''}
          onChange={e => setActiveSession(sessions.find(x => x._id === e.target.value) ?? null)}
          className="flex-1 min-w-[180px] bg-gray-900 border border-yellow-500/40 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-500"
        >
          <option value="">{t('selectSession')}</option>
          {sessions.map(s => (
            <option key={s._id} value={s._id}>{t('sessionLabel', { n: s.sessionNumber, name: s.name })}</option>
          ))}
        </select>

        {activeSession && (
          <button
            onClick={() => { setEditingSession(activeSession); setSessionName(activeSession.name); setShowSessionForm(true); }}
            className="px-3 py-2 rounded-lg text-sm bg-blue-700 hover:bg-blue-600 text-white transition-colors"
            title={t('edit')}
          >✏️</button>
        )}

        {activeSession && (
          <button
            onClick={() => handleDeleteSession(activeSession)}
            disabled={isLoading}
            className="px-3 py-2 rounded-lg text-sm bg-red-800 hover:bg-red-700 text-white transition-colors disabled:opacity-50"
            title={t('delete')}
          >🗑️</button>
        )}

        <button
          onClick={() => { setEditingSession(null); setSessionName(''); setShowSessionForm(true); }}
          className="px-4 py-2 rounded-lg text-sm font-semibold bg-green-700 hover:bg-green-600 text-white transition-colors whitespace-nowrap"
        >{t('newSession')}</button>

        <button
          onClick={handleResetSession}
          disabled={isLoading || !activeSession}
          className="px-4 py-2 rounded-lg text-sm font-semibold bg-red-900/60 hover:bg-red-800/60 border border-red-500/50 text-red-300 transition-colors disabled:opacity-40 whitespace-nowrap"
        >{t('reset')}</button>

        <div className="ml-auto flex items-center gap-3">
          <LanguageToggle />
          <a href="/" className="text-sm text-yellow-400 hover:underline">← {t('viewWheel')}</a>
          <div className={`px-3 py-1 rounded-full text-xs font-semibold ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}>
            {isConnected ? `🟢 ${t('connected')}` : `🔴 ${t('disconnected')}`}
          </div>
        </div>
      </div>

      {/* Status */}
      {statusMsg && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-yellow-900/50 border border-yellow-500/50 text-yellow-200 text-sm">
          {statusMsg}
        </div>
      )}

      {/* ─── MAIN CONTENT (only when session selected) ────────── */}
      {!activeSession ? (
        <div className="text-center text-gray-500 py-16 text-lg">{t('selectOrCreateSession')}</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Participant Input */}
          <div className="bg-gray-900 rounded-xl p-5 border border-yellow-500/30">
            <h2 className="font-cinzel text-xl font-semibold text-yellow-400 mb-3">📋 {t('participantListAdmin')}</h2>
            <p className="text-gray-400 text-sm mb-2">{t('oneNamePerLine')}</p>
            <textarea
              value={participantText}
              onChange={e => setParticipantText(e.target.value)}
              className="w-full h-48 bg-black/60 border border-yellow-500/30 rounded-lg p-3 text-white text-sm resize-none focus:outline-none focus:border-yellow-500"
              placeholder={t('participantPlaceholder')}
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-gray-400 text-xs">{t('currentlyActive', { n: participants.length })}</span>
              <button
                onClick={handleUploadParticipants}
                disabled={isLoading}
                className="px-4 py-2 rounded-lg font-semibold text-sm bg-yellow-500 hover:bg-yellow-400 text-black transition-colors disabled:opacity-50"
              >{t('upload')}</button>
            </div>
            {participants.length > 0 && (
              <div className="mt-3 max-h-32 overflow-y-auto space-y-1">
                {participants.map((p, i) => (
                  <div key={p.id || i} className="text-sm text-gray-300 px-2 py-1 bg-black/30 rounded flex items-center gap-2">
                    <span className="text-yellow-500 text-xs font-orbitron">#{p.id}</span>
                    {p.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Round Control */}
          <div className="bg-gray-900 rounded-xl p-5 border border-yellow-500/30">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-cinzel text-xl font-semibold text-yellow-400">🎯 {t('roundControl')}</h2>
              <button
                onClick={handleOpenCreateRound}
                className="px-3 py-1 rounded text-xs font-semibold bg-green-700 hover:bg-green-600 text-white transition-colors"
              >{t('addRound')}</button>
            </div>

            {showRoundForm && (
              <div className="mb-4 bg-black/60 border border-yellow-500/30 rounded-lg p-4 space-y-3">
                <h3 className="text-yellow-400 font-semibold text-sm">
                  {editingRound ? t('editRoundTitle', { n: editingRound.roundNumber }) : t('newRound')}
                </h3>
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className="text-gray-400 text-xs block mb-1">#{t('round')}</label>
                    <input type="number" value={roundForm.roundNumber} onChange={e => setRoundForm(f => ({ ...f, roundNumber: Number(e.target.value) }))}
                      className="w-full bg-black/60 border border-yellow-500/30 rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-yellow-500"
                      min={1} disabled={!!editingRound} />
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs block mb-1">{t('prizeLabel')}</label>
                    <input type="text" value={roundForm.prize} onChange={e => setRoundForm(f => ({ ...f, prize: e.target.value }))}
                      className="w-full bg-black/60 border border-yellow-500/30 rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-yellow-500"
                      placeholder={t('prizeLabelPlaceholder')} />
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs block mb-1">{t('amountTHB')}</label>
                    <input type="number" value={roundForm.prizeAmount} onChange={e => setRoundForm(f => ({ ...f, prizeAmount: Number(e.target.value) }))}
                      className="w-full bg-black/60 border border-yellow-500/30 rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-yellow-500" min={1} />
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs block mb-1">{t('totalSpins')}</label>
                    <input type="number" value={roundForm.totalSpins} onChange={e => setRoundForm(f => ({ ...f, totalSpins: Number(e.target.value) }))}
                      className="w-full bg-black/60 border border-yellow-500/30 rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-yellow-500" min={1} />
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <button onClick={() => setShowRoundForm(false)} className="px-3 py-1 rounded text-xs bg-gray-700 hover:bg-gray-600 text-white">{t('cancel')}</button>
                  <button onClick={handleSaveRound} disabled={isLoading}
                    className="px-3 py-1 rounded text-xs bg-yellow-500 hover:bg-yellow-400 text-black font-semibold disabled:opacity-50">
                    {editingRound ? t('save') : t('create')}
                  </button>
                </div>
              </div>
            )}

            <div className="overflow-x-auto mb-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-400 border-b border-yellow-500/20">
                    <th className="text-left py-1 pr-3">{t('round')}</th>
                    <th className="text-left py-1 pr-3">{t('prize')}</th>
                    <th className="text-center py-1 pr-3">{t('spinsLeft')}</th>
                    <th className="text-center py-1">{t('select')}</th>
                    <th className="text-center py-1">{t('actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {rounds.map(r => (
                    <tr key={r.roundNumber} className={`border-b border-yellow-500/10 transition-colors ${currentRound === r.roundNumber ? 'bg-yellow-500/10' : 'hover:bg-white/5'}`}>
                      <td className="py-1.5 pr-3 font-orbitron text-yellow-400">#{r.roundNumber}</td>
                      <td className="py-1.5 pr-3 text-white">{r.prize}</td>
                      <td className="py-1.5 pr-3 text-center">
                        <span className={`font-orbitron ${r.remainingSpins === 0 ? 'text-gray-500' : 'text-green-400'}`}>
                          {r.remainingSpins}/{r.totalSpins}
                        </span>
                      </td>
                      <td className="py-1.5 text-center">
                        <button
                          onClick={() => {
                            setCurrentRound(r.roundNumber);
                            socket.emit('select-round', { roundNumber: r.roundNumber, prize: r.prize, prizeAmount: r.prizeAmount });
                          }}
                          disabled={r.remainingSpins === 0}
                          className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                            currentRound === r.roundNumber ? 'bg-yellow-500 text-black'
                            : r.remainingSpins === 0 ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                            : 'bg-gray-700 hover:bg-gray-600 text-white'}`}
                        >{currentRound === r.roundNumber ? t('selected') : t('select')}</button>
                      </td>
                      <td className="py-1.5 text-center">
                        <div className="flex gap-1 justify-center">
                          <button onClick={() => handleOpenEditRound(r)} className="px-2 py-1 rounded text-xs bg-blue-700 hover:bg-blue-600 text-white">{t('edit')}</button>
                          <button onClick={() => handleDeleteRound(r.roundNumber)} disabled={isLoading}
                            className="px-2 py-1 rounded text-xs bg-red-800 hover:bg-red-700 text-white disabled:opacity-50">{t('delete')}</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {selectedRound && (
              <div className="bg-black/40 rounded-lg p-4 mb-4">
                <div className="text-gray-400 text-sm mb-1">{t('selectedRound')}</div>
                <div className="text-yellow-400 font-cinzel font-bold text-lg">{t('roundInfo', { n: selectedRound.roundNumber, prize: selectedRound.prize })}</div>
                <div className="text-gray-400 text-sm mt-1">{t('remainingSpins', { n: selectedRound.remainingSpins })}</div>
              </div>
            )}

            <button
              onClick={handleSpin}
              disabled={isSpinning || participants.length === 0 || !selectedRound || selectedRound.remainingSpins === 0}
              className={`w-full py-4 rounded-xl font-cinzel text-xl font-bold transition-all duration-300 ${
                isSpinning || participants.length === 0 || !selectedRound || selectedRound.remainingSpins === 0
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black'}`}
            >
              {isSpinning ? `🎰 ${t('spinning')}`
                : participants.length === 0 ? t('noParticipants')
                : !selectedRound || selectedRound.remainingSpins === 0 ? t('noSpinsLeft')
                : `🎰 ${t('spinRound', { n: currentRound })}`}
            </button>
          </div>

          {/* Winners Log */}
          <div className="lg:col-span-2 bg-gray-900 rounded-xl p-5 border border-yellow-500/30">
            <h2 className="font-cinzel text-xl font-semibold text-yellow-400 mb-3">🏆 {t('winnersLog')}</h2>
            {winners.length === 0 ? (
              <div className="text-gray-400 text-sm text-center py-4">{t('noWinnersYetAdmin')}</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-400 border-b border-yellow-500/20">
                      <th className="text-left py-1 pr-4">{t('round')}</th>
                      <th className="text-left py-1 pr-4">{t('name')}</th>
                      <th className="text-left py-1 pr-4">{t('prize')}</th>
                      <th className="text-left py-1">{t('time')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...winners].reverse().map((w, i) => (
                      <tr key={`${w.participantId}-${w.roundNumber}-${i}`} className={`border-b border-yellow-500/10 ${i === 0 ? 'bg-yellow-500/10' : ''}`}>
                        <td className="py-1.5 pr-4 font-orbitron text-yellow-400">#{w.roundNumber}</td>
                        <td className="py-1.5 pr-4 text-white">{w.participantId} {w.participantName}</td>
                        <td className="py-1.5 pr-4 text-green-400 font-orbitron">{w.prize}</td>
                        <td className="py-1.5 text-gray-400">{w.timestamp ? new Date(w.timestamp).toLocaleTimeString() : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
      <WinnerModal
        isOpen={showWinnerModal}
        winner={currentWinnerDisplay}
        showContinue
        onClose={() => {
          socket.emit('dismiss-winner');
        }}
      />
    </div>
  );
};

export default AdminPanel;
