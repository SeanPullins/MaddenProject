import React, { useState } from 'react';
import { Player } from '../types';
import { getTeamColors } from '../utils/teamColors';
import {
  X,
  Activity,
  MapPin,
  Shield,
  UserRound,
  TrendingUp,
  Newspaper,
  ExternalLink,
  HeartPulse,
  Hash,
  Scale,
  Ruler,
  GraduationCap,
  Sparkles,
  Loader2,
  Brain,
} from 'lucide-react';
import type { LivePlayerInfo } from '../hooks/useLivePlayerData';
import { evaluatePlayerWithAi } from '../services/playerAi';

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

const formatHeight = (height?: string | null) => {
  if (!height) return '—';

  const inches = Number(height);
  if (!Number.isFinite(inches)) return height;

  const feet = Math.floor(inches / 12);
  const remaining = inches % 12;

  return `${feet}'${remaining}"`;
};

const getCurrentTeam = (player: Player, live?: LivePlayerInfo) => {
  if (live?.matched && (live.currentTeam || live.team)) {
    return live.currentTeam || live.team || player.team;
  }

  return player.team;
};

const getAvailabilityBadge = (live?: LivePlayerInfo) => {
  const status = live?.status?.toLowerCase() || '';
  const injury = live?.injuryStatus?.toLowerCase() || '';
  const practice = live?.practiceParticipation?.toLowerCase() || '';

  if (!live?.matched) {
    return {
      label: 'No Live Match',
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

const getTrendingText = (live?: LivePlayerInfo) => {
  if (!live?.matched) return 'No trend data';

  const adds = live.trendingAddCount ?? 0;
  const drops = live.trendingDropCount ?? 0;

  if (adds === 0 && drops === 0) return 'No major Sleeper movement in the last 24 hours.';
  if (adds > drops) return `Trending up: ${adds} adds vs ${drops} drops in the last 24 hours.`;
  if (drops > adds) return `Trending down: ${drops} drops vs ${adds} adds in the last 24 hours.`;

  return `Even movement: ${adds} adds and ${drops} drops in the last 24 hours.`;
};

const getPlayerSituationSummary = (player: Player, live?: LivePlayerInfo) => {
  if (!live?.matched) {
    return `${player.name} is listed in your Madden database as a ${player.position} for ${player.team}, but no current live NFL match was found yet.`;
  }

  const displayTeam = getCurrentTeam(player, live);
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

  const depthSentence = depth
    ? ` He is listed around ${depth} on the ${depthPosition} depth chart.`
    : '';

  const injurySentence = injury
    ? ` Current injury designation: ${injury}.`
    : practice
      ? ` Latest practice status: ${practice}.`
      : ' No current injury designation is listed.';

  const profileSentence = years
    ? ` He is a ${livePosition}${college} with ${years}.`
    : ` He is a ${livePosition}${college}.`;

  return `${player.name} is currently listed with ${displayTeam} as a ${livePosition}. Live roster status: ${status}.${depthSentence} ${profileSentence}${injurySentence}`.replace(
    /\s+/g,
    ' '
  );
};

export const PlayerCard: React.FC<PlayerCardProps> = ({ player, live, onClose }) => {
  const displayTeam = getCurrentTeam(player, live);
  const colors = getTeamColors(displayTeam);
  const badge = getAvailabilityBadge(live);
  const situationSummary = getPlayerSituationSummary(player, live);

  const [aiLoading, setAiLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [aiMeta, setAiMeta] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  const teamMismatch = Boolean(live?.matched && displayTeam && displayTeam !== player.team);

  const formattedLiveStatus = titleCase(live?.status);
  const formattedPractice = titleCase(live?.practiceParticipation);
  const formattedInjury = titleCase(live?.injuryStatus);
  const formattedBodyPart = titleCase(live?.injuryBodyPart);
  const trendingText = getTrendingText(live);

  const handleAiEvaluation = async () => {
    setAiLoading(true);
    setAiError(null);

    try {
      const result = await evaluatePlayerWithAi(player, live);
      setAiAnalysis(result.analysis);
      setAiMeta(
        [result.model, result.generatedAt ? new Date(result.generatedAt).toLocaleString() : null]
          .filter(Boolean)
          .join(' • ')
      );
    } catch (error) {
      setAiError(error instanceof Error ? error.message : 'AI evaluation failed.');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 z-40" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div
          className="bg-slate-900 rounded-lg shadow-2xl max-w-xl w-full border-2 overflow-hidden max-h-[90vh] overflow-y-auto"
          style={{ borderColor: colors.secondary }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with LIVE team colors */}
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
                  <span className="font-semibold">{live?.position || player.position}</span>
                  <span>•</span>
                  <span>{displayTeam}</span>

                  {live?.number && (
                    <>
                      <span>•</span>
                      <span>#{live.number}</span>
                    </>
                  )}
                </div>

                {teamMismatch && (
                  <div className="mt-2 text-xs text-yellow-100">
                    Madden listed team: <strong>{player.team}</strong>. Live data now shows:{' '}
                    <strong>{displayTeam}</strong>.
                  </div>
                )}

                <div className="mt-3 flex flex-wrap gap-2">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${badge.className}`}
                  >
                    <Activity size={13} />
                    {badge.label}
                  </span>

                  <button
                    onClick={handleAiEvaluation}
                    disabled={aiLoading}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border border-white/20 bg-white/10 text-white hover:bg-white/20 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                  >
                    {aiLoading ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
                    {aiLoading ? 'Evaluating...' : 'AI Evaluate'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {/* AI Evaluation */}
            <div className="bg-slate-800 rounded-lg p-4 border border-brand-500/40">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <Brain size={18} className="text-brand-400" />
                  <div>
                    <div className="text-white font-semibold">AI Player Evaluation</div>
                    <div className="text-xs text-slate-500">Projection, recent-news read, franchise use, and risk level</div>
                  </div>
                </div>

                <button
                  onClick={handleAiEvaluation}
                  disabled={aiLoading}
                  className="shrink-0 inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {aiLoading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                  {aiLoading ? 'Running' : 'Evaluate'}
                </button>
              </div>

              {aiError && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
                  {aiError}
                  <div className="mt-2 text-xs text-red-200/80">
                    Make sure the Supabase Edge Function is deployed and OPENROUTER_API_KEY is saved in Supabase Function Secrets.
                  </div>
                </div>
              )}

              {aiAnalysis ? (
                <div className="rounded-lg bg-slate-950/70 border border-slate-700 p-3">
                  <div className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">{aiAnalysis}</div>
                  {aiMeta && <div className="text-xs text-slate-500 mt-3 pt-2 border-t border-slate-800">{aiMeta}</div>}
                </div>
              ) : !aiError ? (
                <div className="text-slate-400 text-sm leading-relaxed">
                  Click <strong>Evaluate</strong> to have AI analyze this player using the Madden rating, live roster status, injury data, depth chart info, market movement, and available headlines.
                </div>
              ) : null}
            </div>

            {/* Current Situation Summary */}
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <div className="flex items-center gap-2 mb-2">
                <MapPin size={18} className="text-brand-400" />
                <div className="text-white font-semibold">Current Situation</div>
              </div>

              <p className="text-slate-300 text-sm leading-relaxed">{situationSummary}</p>
            </div>

            {/* Roster Status & News */}
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <div className="flex items-center gap-2 mb-3">
                <Newspaper size={18} className="text-brand-400" />
                <div className="text-white font-semibold">Roster Status & News</div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="rounded-lg bg-slate-900/70 border border-slate-700 p-3">
                  <div className="text-slate-500 mb-1">Roster note</div>
                  <div className="text-slate-200 leading-relaxed">
                    {live?.rosterStatusNote || 'No roster note available.'}
                  </div>
                </div>

                <div className="rounded-lg bg-slate-900/70 border border-slate-700 p-3">
                  <div className="text-slate-500 mb-1">Availability note</div>
                  <div className="text-slate-200 leading-relaxed">
                    {live?.availabilityNote || 'No availability note available.'}
                  </div>
                </div>

                <div className="rounded-lg bg-slate-900/70 border border-slate-700 p-3">
                  <div className="text-slate-500 mb-1">Fantasy / market movement</div>
                  <div className="text-slate-200 leading-relaxed">{trendingText}</div>
                </div>

                {live?.latestNews && live.latestNews.length > 0 && (
                  <div className="rounded-lg bg-slate-900/70 border border-slate-700 p-3">
                    <div className="text-slate-500 mb-2">Latest headlines</div>
                    <div className="space-y-2">
                      {live.latestNews.slice(0, 3).map((item, index) => (
                        <a
                          key={`${item.url}-${index}`}
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          className="block rounded-lg border border-slate-700 bg-slate-950/60 p-3 hover:bg-slate-700/40 transition-colors"
                        >
                          <div className="text-slate-100 text-sm font-semibold leading-snug">{item.title}</div>
                          <div className="text-slate-500 text-xs mt-1">
                            {item.source || 'News'}{item.publishedAt ? ` • ${item.publishedAt}` : ''}
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {(live?.newsLinks?.espnUrl || live?.newsLinks?.googleNewsUrl) && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {live?.newsLinks?.espnUrl && (
                      <a
                        href={live.newsLinks.espnUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold transition-colors"
                      >
                        ESPN profile
                        <ExternalLink size={13} />
                      </a>
                    )}

                    {live?.newsLinks?.googleNewsUrl && (
                      <a
                        href={live.newsLinks.googleNewsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold transition-colors"
                      >
                        Latest news search
                        <ExternalLink size={13} />
                      </a>
                    )}
                  </div>
                )}
              </div>
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
                  Current Team
                </div>
                <div className="text-white font-semibold">{displayTeam}</div>
              </div>

              <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
                <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                  <Shield size={15} />
                  Madden Team
                </div>
                <div className={`font-semibold ${teamMismatch ? 'text-yellow-300' : 'text-white'}`}>
                  {player.team}
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

            {/* Live NFL Details */}
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <div className="flex items-center justify-between mb-3">
                <div className="text-slate-400 text-sm font-medium">Live NFL Details</div>
                <div className="text-xs text-slate-500">{live?.source || 'No live match'}</div>
              </div>

              {live?.matched ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="text-slate-500">Current Team</div>
                      <div className="text-white font-semibold">{displayTeam}</div>
                    </div>

                    <div>
                      <div className="text-slate-500">NFL Status</div>
                      <div className="text-white font-semibold">{formattedLiveStatus || '—'}</div>
                    </div>

                    <div>
                      <div className="text-slate-500">Active</div>
                      <div className="text-white font-semibold">
                        {live.active === null || live.active === undefined
                          ? '—'
                          : live.active
                            ? 'Yes'
                            : 'No'}
                      </div>
                    </div>

                    <div>
                      <div className="text-slate-500">Jersey</div>
                      <div className="text-white font-semibold">
                        {live.number ? `#${live.number}` : '—'}
                      </div>
                    </div>

                    <div>
                      <div className="text-slate-500">Injury</div>
                      <div className="text-white font-semibold">
                        {formattedInjury || 'None listed'}
                      </div>
                    </div>

                    <div>
                      <div className="text-slate-500">Body Part</div>
                      <div className="text-white font-semibold">{formattedBodyPart || '—'}</div>
                    </div>

                    <div>
                      <div className="text-slate-500">Practice</div>
                      <div className="text-white font-semibold">{formattedPractice || '—'}</div>
                    </div>

                    <div>
                      <div className="text-slate-500">Sleeper Depth</div>
                      <div className="text-white font-semibold">
                        {live.depthChartOrder ? `#${live.depthChartOrder}` : '—'}
                      </div>
                    </div>

                    <div>
                      <div className="text-slate-500">Depth Position</div>
                      <div className="text-white font-semibold">{live.depthChartPosition || '—'}</div>
                    </div>

                    <div>
                      <div className="text-slate-500">Fantasy Positions</div>
                      <div className="text-white font-semibold">
                        {live.fantasyPositions?.length ? live.fantasyPositions.join(', ') : '—'}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-1 text-slate-500">
                        <Ruler size={13} />
                        Height
                      </div>
                      <div className="text-white font-semibold">{formatHeight(live.height)}</div>
                    </div>

                    <div>
                      <div className="flex items-center gap-1 text-slate-500">
                        <Scale size={13} />
                        Weight
                      </div>
                      <div className="text-white font-semibold">
                        {live.weight ? `${live.weight} lbs` : '—'}
                      </div>
                    </div>

                    <div>
                      <div className="text-slate-500">Age</div>
                      <div className="text-white font-semibold">{live.age || '—'}</div>
                    </div>

                    <div>
                      <div className="flex items-center gap-1 text-slate-500">
                        <GraduationCap size={13} />
                        College
                      </div>
                      <div className="text-white font-semibold">{live.college || '—'}</div>
                    </div>

                    <div>
                      <div className="text-slate-500">Years Exp.</div>
                      <div className="text-white font-semibold">{live.yearsExp ?? '—'}</div>
                    </div>

                    <div>
                      <div className="flex items-center gap-1 text-slate-500">
                        <Hash size={13} />
                        Search Rank
                      </div>
                      <div className="text-white font-semibold">{live.searchRank ?? '—'}</div>
                    </div>
                  </div>

                  {live.injuryNotes && (
                    <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3">
                      <div className="flex items-center gap-2 text-red-300 text-sm font-semibold mb-1">
                        <HeartPulse size={15} />
                        Injury Notes
                      </div>
                      <div className="text-red-100 text-sm">{live.injuryNotes}</div>
                    </div>
                  )}

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

            {/* Madden Info */}
            <div className="grid grid-cols-2 gap-3">
              {player.draftRound && (
                <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
                  <div className="text-slate-400 text-sm mb-1">Draft Round</div>
                  <div className="text-white font-semibold">{player.draftRound}</div>
                </div>
              )}

              {player.faYear && (
                <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
                  <div className="text-slate-400 text-sm mb-1">FA Year</div>
                  <div className="text-white font-semibold">{player.faYear}</div>
                </div>
              )}

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

              {player.status && (
                <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
                  <div className="text-slate-400 text-sm mb-1">Madden Status</div>
                  <div className="text-white font-semibold">{titleCase(player.status)}</div>
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
