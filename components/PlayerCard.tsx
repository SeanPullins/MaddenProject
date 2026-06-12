import React from 'react';
import { Player } from '../types';
import { getTeamColors } from '../utils/teamColors';
import { X } from 'lucide-react';
import type { LivePlayerInfo } from '../hooks/useLivePlayerData';

interface PlayerCardProps {
  player: Player;
  live?: LivePlayerInfo;
  onClose: () => void;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({ player, live, onClose }) => {
  const colors = getTeamColors(player.team);

  const formattedLiveStatus = live?.status
    ? live.status.replaceAll('_', ' ').toLowerCase()
    : null;

  const formattedPractice = live?.practiceParticipation
    ? live.practiceParticipation.replaceAll('_', ' ').toLowerCase()
    : null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 z-40" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div
          className="bg-slate-900 rounded-lg shadow-2xl max-w-md w-full border-2 overflow-hidden max-h-[90vh] overflow-y-auto"
          style={{ borderColor: colors.secondary }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with team colors */}
          <div className="p-6 relative" style={{ backgroundColor: colors.primary }}>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
              aria-label="Close player card"
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
                  color: 'white',
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

            {/* Madden Depth Order */}
            {player.depthOrder && (
              <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
                <div className="text-slate-400 text-sm mb-1">Madden Depth Chart</div>
                <div className="text-white font-semibold">
                  {player.depthOrder === 1
                    ? 'Starter'
                    : player.depthOrder === 2
                      ? 'Backup'
                      : `Depth ${player.depthOrder}`}
                </div>
              </div>
            )}

            {/* Madden Status */}
            {player.status && (
              <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
                <div className="text-slate-400 text-sm mb-1">Madden Status</div>
                <div className="text-white font-semibold capitalize">
                  {player.status.replace('_', ' ').toLowerCase()}
                </div>
              </div>
            )}

            {/* Live NFL Info */}
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <div className="flex items-center justify-between mb-3">
                <div className="text-slate-400 text-sm font-medium">Live NFL Info</div>
                <div className="text-xs text-slate-500">{live?.source || 'No live match'}</div>
              </div>

              {live?.matched ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="text-slate-500">Current Team</div>
                      <div className="text-white font-semibold">{live.team || '—'}</div>
                    </div>

                    <div>
                      <div className="text-slate-500">NFL Status</div>
                      <div className="text-white font-semibold capitalize">
                        {formattedLiveStatus || '—'}
                      </div>
                    </div>

                    <div>
                      <div className="text-slate-500">Injury</div>
                      <div className="text-white font-semibold">
                        {live.injuryStatus || 'None listed'}
                      </div>
                    </div>

                    <div>
                      <div className="text-slate-500">Practice</div>
                      <div className="text-white font-semibold capitalize">
                        {formattedPractice || '—'}
                      </div>
                    </div>

                    <div>
                      <div className="text-slate-500">Sleeper Depth</div>
                      <div className="text-white font-semibold">
                        {live.depthChartOrder ? `#${live.depthChartOrder}` : '—'}
                      </div>
                    </div>

                    <div>
                      <div className="text-slate-500">Depth Position</div>
                      <div className="text-white font-semibold">
                        {live.depthChartPosition || '—'}
                      </div>
                    </div>

                    <div>
                      <div className="text-slate-500">Age</div>
                      <div className="text-white font-semibold">{live.age || '—'}</div>
                    </div>

                    <div>
                      <div className="text-slate-500">College</div>
                      <div className="text-white font-semibold">{live.college || '—'}</div>
                    </div>

                    <div>
                      <div className="text-slate-500">Height</div>
                      <div className="text-white font-semibold">{live.height || '—'}</div>
                    </div>

                    <div>
                      <div className="text-slate-500">Weight</div>
                      <div className="text-white font-semibold">
                        {live.weight ? `${live.weight} lbs` : '—'}
                      </div>
                    </div>

                    <div>
                      <div className="text-slate-500">Years Exp.</div>
                      <div className="text-white font-semibold">
                        {live.yearsExp ?? '—'}
                      </div>
                    </div>

                    <div>
                      <div className="text-slate-500">ESPN ID</div>
                      <div className="text-white font-semibold">{live.espnId || '—'}</div>
                    </div>
                  </div>

                  {live.updatedAt && (
                    <div className="text-xs text-slate-500 pt-2 border-t border-slate-700">
                      Updated: {new Date(live.updatedAt).toLocaleString()}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-slate-400 text-sm">
                  No live data match found yet for this player.
                </div>
              )}
            </div>

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
                          color: 'white',
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
