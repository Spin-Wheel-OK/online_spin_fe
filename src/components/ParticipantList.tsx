import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { IParticipant } from '../types';
import { useTranslation } from '../i18n/LanguageContext';

interface ParticipantListProps {
  participants: IParticipant[];
  selectedParticipant: IParticipant | null;
  onSelectParticipant: (participant: IParticipant | null) => void;
}

const ROW_HEIGHT = 56;
const OVERSCAN = 6;

const ParticipantList = ({ participants, selectedParticipant, onSelectParticipant }: ParticipantListProps) => {
  const { t } = useTranslation();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportH, setViewportH] = useState(0);

  useLayoutEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const update = () => setViewportH(el.clientHeight);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const onScroll = () => setScrollTop(el.scrollTop);
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  const total = participants.length;
  const totalH = total * ROW_HEIGHT;
  const startIdx = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN);
  const visibleCount = Math.ceil(viewportH / ROW_HEIGHT) + OVERSCAN * 2;
  const endIdx = Math.min(total, startIdx + visibleCount);
  const slice = participants.slice(startIdx, endIdx);

  return (
    <div className="h-full flex flex-col">
      <h2 className="font-prompt text-lg font-bold text-center mb-2 py-2 px-3 rounded-xl bg-amber-500/90 text-white border border-amber-400 shadow-lg shadow-amber-500/30">
        💦 {t('participants')} ({total})
      </h2>
      <div
        ref={scrollerRef}
        className="flex-1 overflow-y-auto border-gold-glow rounded-lg bg-sky-950/30 backdrop-blur-md p-3"
      >
        {total === 0 ? (
          <div className="text-center text-cyan-200/70 py-8">
            <p className="text-sm font-medium drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]">{t('noParticipantsYet')}</p>
            <p className="text-xs mt-1 text-cyan-300/60 drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]">{t('waitingToJoin')}</p>
          </div>
        ) : (
          <div style={{ height: totalH, position: 'relative' }}>
            {slice.map((participant, i) => {
              const idx = startIdx + i;
              const isSelected = selectedParticipant?.id === participant.id;
              return (
                <div
                  key={participant.id ?? idx}
                  onClick={() => onSelectParticipant(isSelected ? null : participant)}
                  className={`px-3 py-2 rounded cursor-pointer transition-all border ${
                    isSelected
                      ? 'bg-cyan-500/20 border-cyan-400/60'
                      : 'bg-sky-900/30 border-cyan-500/15 hover:border-cyan-400/40'
                  }`}
                  style={{
                    position: 'absolute',
                    top: idx * ROW_HEIGHT,
                    left: 0,
                    right: 0,
                    height: ROW_HEIGHT - 8,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-orbitron text-cyan-300 text-xs font-bold">#{participant.id}</span>
                    <span className="text-white text-sm font-medium truncate">{participant.name}</span>
                  </div>
                  {participant.hasWon && (
                    <span className="text-xs text-emerald-400 ml-4">{t('wonRound', { n: participant.wonRound ?? 0 })}</span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ParticipantList;
