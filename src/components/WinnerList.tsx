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
      <h2 className="font-prompt text-xl font-semibold text-gold-gradient mb-4 text-center drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
        <span style={{ WebkitTextFillColor: 'initial' }}>🌺</span> {t('winnerList')}
      </h2>
      <div
        ref={listRef}
        className="flex-1 overflow-y-auto border-gold-glow rounded-lg bg-sky-950/30 backdrop-blur-md p-3 space-y-2"
      >
        {reversed.length === 0 ? (
          <div className="text-center text-cyan-200/70 py-8">
            <p className="text-sm font-medium drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]">{t('noWinnersYet')}</p>
            <p className="text-xs mt-1 text-cyan-300/60 drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]">{t('spinToPickWinner')}</p>
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
              <p className="text-yellow-300 text-xs mt-0.5 font-semibold drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">{t('roundLabel', { n: winner.number, prize: winner.prize })}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default WinnerList;
