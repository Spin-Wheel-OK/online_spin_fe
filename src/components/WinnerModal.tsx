import { WinnerDisplay } from '../types';

interface WinnerModalProps {
  isOpen: boolean;
  winner: WinnerDisplay | null;
  onClose: () => void;
}

const WinnerModal = ({ isOpen, winner, onClose }: WinnerModalProps) => {
  if (!isOpen || !winner) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 bg-gradient-to-b from-yellow-900/90 to-black/90 border border-yellow-500/60 rounded-2xl p-8 max-w-md w-full mx-4 text-center shadow-2xl">
        {/* Trophy */}
        <div className="text-6xl mb-4">🏆</div>

        <h2 className="font-cinzel text-3xl font-bold text-yellow-400 mb-2">
          We Have a Winner!
        </h2>

        <p className="text-white text-xl font-semibold mb-6">
          {winner.username}
        </p>

        <div className="bg-black/40 rounded-xl p-4 mb-6 space-y-2 text-left">
          <div className="flex justify-between">
            <span className="text-gray-400 text-sm">Round</span>
            <span className="text-yellow-400 font-orbitron font-bold">#{winner.number}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400 text-sm">Prize</span>
            <span className="text-yellow-400 font-orbitron font-bold">{winner.prize}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400 text-sm">Amount</span>
            <span className="text-green-400 font-orbitron font-bold">{winner.reward}</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 px-8 rounded-xl font-cinzel text-lg font-bold bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black transition-all duration-300"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default WinnerModal;