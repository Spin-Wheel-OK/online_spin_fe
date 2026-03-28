import { useEffect, useRef, useMemo } from 'react';
import { WinnerDisplay } from '../types';
import { useTranslation } from '../i18n/LanguageContext';

interface WinnerListProps {
  winners: WinnerDisplay[];
}

const WinnerList = ({ winners }: WinnerListProps) => {
  const { t } = useTranslation();
  const listRef = useRef<HTMLDivElement>(null);

  // Reverse: newest first
  const reversed = useMemo(() => [...winners].reverse(), [winners]);

  // Scroll to top (newest) when list changes
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = 0;
    }
  }, [winners]);

  return (
    <div className="h-full flex flex-col">
      <h2 className="font-prompt text-xl font-semibold text-gold-gradient mb-4 text-center">
        🌺 {t('winnerList')}
      </h2>
      <div
        ref={listRef}
        className="flex-1 overflow-y-auto border-gold-glow rounded-lg bg-sky-950/50 p-3 space-y-2"
      >
        {reversed.length === 0 ? (
          <div className="text-center text-cyan-300/40 py-8">
            <p className="text-sm">{t('noWinnersYet')}</p>
            <p className="text-xs mt-1">{t('spinToPickWinner')}</p>
          </div>
        ) : (
          reversed.map((winner, index) => (
            <div
              key={`${winner.participantId}-${winner.number}-${index}`}
              className={`px-3 py-2 rounded bg-sky-900/40 border border-cyan-500/25 ${
                index === 0 ? 'highlight-animate' : ''
              }`}
            >
              <p className="text-white text-sm font-medium">
                <span className="font-orbitron text-cyan-300 font-bold">#{winner.participantId}</span>
                {' '}{t('winner')}: {winner.username}
              </p>
              <p className="text-cyan-400/50 text-xs mt-0.5">{t('round')} {winner.number}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default WinnerList;
