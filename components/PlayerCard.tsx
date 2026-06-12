import React from 'react';
import { Player } from '../types';
import { getTeamColors } from '../utils/teamColors';
import { X, Activity, AlertTriangle, MapPin, Shield, UserRound, TrendingUp } from 'lucide-react';
import type { LivePlayerInfo } from '../hooks/useLivePlayerData';

interface PlayerCardProps {
  player: Player;
  live?: LivePlayerInfo;
  onClose: () => void;
}

const titleCase = (value?: string | null) => {
  if (!value) return null;

  return value
    .replaceAll('_', ' ')
    .replaceAll('-', ' ')
    .toLowerCase()
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const formatValue = (value?: string | number | null) => {
  if (value === null || value === undefined || value === '') return '—';
  return value;
};

const getAvailabilityBadge = (live?: LivePlayerInfo) => {
  const status = live?.status?.toLowerCase() || '';
  const injury = live?.injuryStatus?.toLowerCase() || '';
  const practice = live?.practiceParticipation?.toLowerCase() || '';

  if (!live?.matched) {
    return {
      label: 'No Match',
      className: 'bg-slate-700 text-slate-200 border-slate-600',
    };
  }

  if (injury && injury !== 'healthy') {
    return {
      label: titleCase(live.injuryStatus) || 'Injured',
      className: 'bg-red-500/15 text-red-300 border-red-500/30',
    };
  }

  if (status.includes('injured') || status.includes('ir') || status.includes('pup')) {
    return {
      label: titleCase(live.status) || 'Unavailable',
      className: 'bg-red-500/15 text-red-300 border-red-500/30',
    };
  }

  if (practice.includes('limited')) {
    return {
      label: 'Limited Practice',
      className: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30',
    };
  }

  if (status.includes('active')) {
    return {
      label: 'Active',
      className: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    };
  }

  if (status) {
    return {
      label: titleCase(live.status) || 'Listed',
      className: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
    };
  }

  return {
    label: 'Rostered',
    className: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  };
};

const getPlayerSituationSummary = (player: Player, live?: LivePlayerInfo) => {
  if (!live?.matched) {
    return `${player.name} is listed in your Madden database as a ${player.position} for ${player.team}, but no current live NFL match was found from the live data source yet.`;
  }

  const liveTeam = live.team || player.team;
  const livePosition = live.position || player.position;
  const status = titleCase(live.status) || 'Rostered';
  const injury = live.injuryStatus ? titleCase(live.injuryStatus) : null;
  const practice = live.practiceParticipation ? titleCase(live.practiceParticipation) : null;
  const depth = live.depthChartOrder ? `No. ${live.depthChartOrder}` : null;
  const depthPosition = live.depthChartPosition || livePosition;
  const college = live.college ? ` out of ${live.college}` : '';
  const years =
    live.yearsExp !== null && live.yearsExp !== undefined
      ? `${live.yearsExp} year${live.yearsExp === 1 ? '' : 's'} of NFL experience`
      : null;

  const teamMismatch =
    live.team && live.team !== player.team
      ? ` His live team is currently ${live.team}, while your Madden file still has him on ${player.team}.`
      : '';

  const depthSentence = depth
    ? ` He is currently listed around ${depth} on the ${depthPosition} depth chart.`
    : '';

  const injurySentence = injury
    ? ` His current injury designation is ${injury}.`
    : practice
      ? ` His latest practice status is ${practice}.`
      : '';

  const profileSentence = years
    ? ` He is a ${livePosition}${college} with ${years}.`
    : ` He is a ${livePosition}${college}.`;

  return `${player.name} is currently tied to ${liveTeam} as a ${livePosition}. His live roster status is ${status}.${teamMismatch}${depthSentence} ${profileSentence}${injurySentence}`.replace(
    /\s+/g,
    ' '
  );
};

export const PlayerCard: React.FC<PlayerCardProps> = ({ player, live, onClose }) => {
  const colors = getTeamColors(player.team);
  const badge = getAvailabilityBadge(live);
  const situationSummary = getPlayerSituationSummary(player, live);

  const liveTeam = live?.team || player.team;
  const teamMismatch = Boolean(live?.team && live.team !== player.team);

  const formattedLiveStatus = titleCase(live?.status);
  const formattedPractice = titleCase(live?.practiceParticipation);
  const formattedInjury = titleCase(live?.injuryStatus);

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 z-40" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div
          className="bg-slate-900 rounded-lg shadow-2xl max-w-lg w-full border-2 overflow-hidden max-h-[90vh] overflow-y-auto"
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
                className="w-20 h-20 rounded-full border-2 object-cover bg-slate-800"
                style={{ borderColor: colors.secondary }}
              />

              <div className="flex-1 pr-8">
                <h2 className="text-2xl font-bold text-white mb-1">{player.name}</h2>

                <div className="flex flex-wrap items-center gap-2 text-white/90">
                  <span className="font-semibold">{player.position}</span>
                  <span>•</span>
                  <span>{player.team}</span>

                  {teamMismatch && (
                    <>
                      <span>•</span>
                      <span className="text-yellow-200">Live: {liveTeam}</span>
                    </>
                  )}
                </div>

                <div className="mt-3">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${badge.className}`}>
                    <Activity size={13} />
                    {badge.label}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {/* Current Situation Summary */}
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <div className="flex items-center gap-2 mb-2">
                <MapPin size={18} className="text-brand-400" />
                <div className="text-white font-semibold">Current Situation</div>
              </div>

              <p className="text-slate-300 text-sm leading-relaxed">
                {situationSummary}
              </p>

              {teamMismatch && (
                <div className="mt-3 flex items-start gap-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20 p-3">
                  <AlertTriangle size={16} className="text-yellow-300 mt-0.5 shrink-0" />
                  <div className="text-yellow-100 text-xs leading-relaxed">
                    Your Madden roster has him on <strong>{player.team}</strong>, but the live data source lists him with <strong>{live?.team}</strong>. This may mean your Madden file needs a roster update.
                  </div>
                </div>
              )}
            </div>

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

            {/* Snapshot */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
                <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                  <Shield size={15} />
                  Madden Team
                </div>
                <div className="text-white font-semibold">{player.team}</div>
              </div>

              <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
                <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                  <MapPin size={15} />
                  Live Team
                </div>
                <div className={`font-semibold ${teamMismatch ? 'text-yellow-300' : 'text-white'}`}>
                  {formatValue(live?.team || player.team)}
                </div>
              </div>

              <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
                <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                  <UserRound size={15} />
                  Position
                </div>
                <div className="text-white font-semibold">
                  {formatValue(live?.position || player.position)}
                </div>
              </div>

              <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
                <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                  <TrendingUp size={15} />
                  Status
                </div>
                <div className="text-white font-semibold">
                  {formatValue(formattedLiveStatus || player.status)}
                </div>
              </div>
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
                <div className="text-white font-semibold">
                  {titleCase(player.status)}
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
                      <div className="text-white font-semibold">
                        {formattedLiveStatus || '—'}
                      </div>
                    </div>

                    <div>
                      <div className="text-slate-500">Injury</div>
                      <div className="text-white font-semibold">
                        {formattedInjury || 'None listed'}
                      </div>
                    </div>

                    <div>
                      <div className="text-slate-500">Practice</div>
                      <div className="text-white font-semibold">
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
