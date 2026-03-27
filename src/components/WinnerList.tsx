import { useEffect, useRef } from 'react';
import { WinnerDisplay } from '../types';

interface WinnerListProps {
  winners: WinnerDisplay[];
}

const WinnerList = ({ winners }: WinnerListProps) => {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom when new winner is added
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [winners]);

  return (
    <div className="h-full flex flex-col">
      <h2 className="font-cinzel text-xl font-semibold text-gold-gradient mb-4 text-center">
        Winner List
      </h2>
      <div 
        ref={listRef}
        className="flex-1 overflow-y-auto border-gold-glow rounded-lg bg-black/40 p-3 space-y-2"
      >
        {winners.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <p className="text-sm">No winners yet</p>
            <p className="text-xs mt-1">Spin the wheel to pick a winner!</p>
          </div>
        ) : (
          winners.map((winner, index) => (
            <div
              key={index}
              className={`px-3 py-2 rounded bg-black/30 border border-yellow-500/30 ${
                index === winners.length - 1 ? 'highlight-animate' : ''
              }`}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="font-orbitron text-yellow-400 text-sm font-bold">#{winner.number}</span>
                  <span className="text-white text-sm font-medium">{winner.username}</span>
                </div>
                <span className="text-yellow-400 font-orbitron text-sm font-bold">{winner.prize}</span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-gray-400 text-xs">Round #{winner.number}</span>
                <span className="text-green-400 text-xs">{winner.reward}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default WinnerList;