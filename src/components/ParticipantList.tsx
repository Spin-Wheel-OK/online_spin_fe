import { IParticipant } from '../types';
import { useTranslation } from '../i18n/LanguageContext';

interface ParticipantListProps {
  participants: IParticipant[];
  selectedParticipant: IParticipant | null;
  onSelectParticipant: (participant: IParticipant | null) => void;
}

const ParticipantList = ({ participants, selectedParticipant, onSelectParticipant }: ParticipantListProps) => {
  const { t } = useTranslation();

  return (
    <div className="h-full flex flex-col">
      <h2 className="font-prompt text-xl font-semibold text-gold-gradient mb-4 text-center drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
        <span style={{ WebkitTextFillColor: 'initial' }}>💦</span> {t('participants')} ({participants.length})
      </h2>
      <div className="flex-1 overflow-y-auto border-gold-glow rounded-lg bg-sky-950/30 backdrop-blur-md p-3 space-y-2">
        {participants.length === 0 ? (
          <div className="text-center text-cyan-200/70 py-8">
            <p className="text-sm font-medium drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]">{t('noParticipantsYet')}</p>
            <p className="text-xs mt-1 text-cyan-300/60 drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]">{t('waitingToJoin')}</p>
          </div>
        ) : (
          participants.map((participant, index) => (
            <div
              key={participant.id ?? index}
              onClick={() => onSelectParticipant(
                selectedParticipant?.id === participant.id ? null : participant
              )}
              className={`px-3 py-2 rounded cursor-pointer transition-all border ${
                selectedParticipant?.id === participant.id
                  ? 'bg-cyan-500/20 border-cyan-400/60'
                  : 'bg-sky-900/30 border-cyan-500/15 hover:border-cyan-400/40'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="font-orbitron text-cyan-300 text-xs font-bold">#{participant.id}</span>
                <span className="text-white text-sm font-medium truncate">{participant.name}</span>
              </div>
              {participant.hasWon && (
                <span className="text-xs text-emerald-400 ml-4">{t('wonRound', { n: participant.wonRound ?? 0 })}</span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ParticipantList;
