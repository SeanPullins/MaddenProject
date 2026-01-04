import React from 'react';
import { Player } from '../types';
import { getTeamColors } from '../utils/teamColors';
import { X } from 'lucide-react';

interface PlayerCardProps {
  player: Player;
  onClose: () => void;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({ player, onClose }) => {
  const colors = getTeamColors(player.team);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-slate-900 rounded-lg shadow-2xl max-w-md w-full border-2 overflow-hidden"
          style={{ borderColor: colors.secondary }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with team colors */}
          <div
            className="p-6 relative"
            style={{ backgroundColor: colors.primary }}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>

            <div className="flex items-start gap-4">
              <img
                src={player.imageUrl}
                alt={player.name}
                className="w-20 h-20 rounded-full border-2 object-cover"
                style={{ borderColor: colors.secondary }}
              />
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-1">{player.name}</h2>
                <div className="flex items-center gap-2 text-white/90">
                  <span className="font-semibold">{player.position}</span>
                  <span>•</span>
                  <span>{player.team}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {/* OVR Rating */}
            <div className="flex items-center justify-between bg-slate-800 rounded-lg p-4 border border-slate-700">
              <span className="text-slate-400 font-medium">Overall Rating</span>
              <span
                className="text-3xl font-bold px-4 py-2 rounded"
                style={{
                  backgroundColor: colors.primary,
                  color: 'white'
                }}
              >
                {player.ovr}
              </span>
            </div>

            {/* Draft Info */}
            {player.draftRound && (
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
                  <div className="text-slate-400 text-sm mb-1">Draft Round</div>
                  <div className="text-white font-semibold">{player.draftRound}</div>
                </div>
                {player.faYear && (
                  <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
                    <div className="text-slate-400 text-sm mb-1">FA Year</div>
                    <div className="text-white font-semibold">{player.faYear}</div>
                  </div>
                )}
              </div>
            )}

            {/* Depth Order */}
            {player.depthOrder && (
              <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
                <div className="text-slate-400 text-sm mb-1">Depth Chart</div>
                <div className="text-white font-semibold">
                  {player.depthOrder === 1 ? 'Starter' : player.depthOrder === 2 ? 'Backup' : `Depth ${player.depthOrder}`}
                </div>
              </div>
            )}

            {/* Status */}
            {player.status && (
              <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
                <div className="text-slate-400 text-sm mb-1">Status</div>
                <div className="text-white font-semibold capitalize">
                  {player.status.replace('_', ' ').toLowerCase()}
                </div>
              </div>
            )}

            {/* Attributes */}
            {player.attributes && player.attributes.length > 0 && (
              <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                <div className="text-slate-400 text-sm mb-3 font-medium">Attributes</div>
                <div className="grid grid-cols-2 gap-2">
                  {player.attributes.map((attr) => (
                    <div key={attr.name} className="flex justify-between items-center">
                      <span className="text-slate-300 text-sm">{attr.name}</span>
                      <span
                        className="font-bold px-2 py-1 rounded text-sm"
                        style={{
                          backgroundColor: colors.secondary,
                          color: 'white'
                        }}
                      >
                        {attr.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
