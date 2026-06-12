import React, { useMemo } from 'react';
import { HIT_RATES_CSV } from '../constants';
import {
  AlertCircle,
  Award,
  BarChart3,
  Hash,
  Info,
  Medal,
  Percent,
  Target,
  TrendingDown,
  TrendingUp,
  Trophy,
} from 'lucide-react';

type HitRateSectionKey = 'rates' | 'counts' | 'ranks';

type ParsedSection = {
  title: string;
  headers: string[];
  rows: string[][];
};

type TableMode = 'percent' | 'number' | 'rank';

const SECTION_TITLES: Record<string, HitRateSectionKey> = {
  'Highest Hit %': 'rates',
  'Count for Formula': 'counts',
  'Rank for Hit %': 'ranks',
};

const SECTION_LABELS: Record<HitRateSectionKey, string> = {
  rates: 'Hit Rate',
  counts: 'Hit Count',
  ranks: 'Round Rank',
};

const ROUND_EXPLANATIONS: Record<string, string> = {
  'Rd 1': 'Round 1 picks should become cornerstone starters.',
  'Rd 2': 'Round 2 picks should usually become core starters.',
  'Rd 3': 'Round 3 is where strong scouting starts to separate.',
  'Rd 4': 'Round 4 hits are valuable roster-building wins.',
  'Rd 5': 'Round 5 is a depth-to-starter hunting zone.',
  'Rd 6': 'Round 6 hits are cheap roster value.',
  'Rd 7': 'Round 7 hits are bonus wins.',
  UN: 'Undrafted hits are found-money scouting wins.',
};

const cleanCell = (cell = '') => cell.trim();

const cleanOwner = (header = '') => header.replace(/^Team\s+/i, '').trim();

const parseNumber = (value?: string) => {
  const parsed = Number.parseFloat(value || '');
  return Number.isFinite(parsed) ? parsed : null;
};

const parseHitRateSections = (): Record<HitRateSectionKey, ParsedSection> => {
  const blankSection: ParsedSection = { title: '', headers: [], rows: [] };
  const sections: Record<HitRateSectionKey, ParsedSection> = {
    rates: { ...blankSection },
    counts: { ...blankSection },
    ranks: { ...blankSection },
  };

  let activeKey: HitRateSectionKey | null = null;

  HIT_RATES_CSV.trim()
    .split('\n')
    .map((line) => line.split(',').map(cleanCell))
    .forEach((cells) => {
      const firstCell = cells[0];
      const possibleSection = SECTION_TITLES[firstCell];

      if (possibleSection) {
        const headers = cells
          .slice(1)
          .filter((header) => header && !header.toLowerCase().startsWith('unnamed'))
          .map(cleanOwner);

        sections[possibleSection] = {
          title: firstCell,
          headers,
          rows: [],
        };
        activeKey = possibleSection;
        return;
      }

      if (!activeKey || !firstCell) return;

      const activeSection = sections[activeKey];
      const values = cells.slice(1, activeSection.headers.length + 1);

      if (values.every((value) => !value)) return;

      activeSection.rows.push([firstCell, ...values]);
    });

  return sections;
};

const formatPercent = (value?: string) => {
  const parsed = parseNumber(value);
  if (parsed === null) return '—';
  return `${Math.round(parsed * 100)}%`;
};

const formatNumber = (value?: string) => {
  const parsed = parseNumber(value);
  if (parsed === null) return '—';
  return Number.isInteger(parsed) ? `${parsed}` : parsed.toFixed(1);
};

const getHeatClass = (value?: string) => {
  const parsed = parseNumber(value);
  if (parsed === null) return 'bg-slate-800 text-slate-400 border-slate-700';

  if (parsed >= 0.6) return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25';
  if (parsed >= 0.45) return 'bg-brand-500/15 text-brand-300 border-brand-500/25';
  if (parsed >= 0.3) return 'bg-yellow-500/15 text-yellow-300 border-yellow-500/25';
  return 'bg-red-500/15 text-red-300 border-red-500/25';
};

const getRankClass = (value?: string) => {
  const parsed = parseNumber(value);
  if (parsed === null) return 'bg-slate-800 text-slate-400 border-slate-700';

  if (parsed === 1) return 'bg-yellow-500/15 text-yellow-300 border-yellow-500/25';
  if (parsed === 2) return 'bg-brand-500/15 text-brand-300 border-brand-500/25';
  if (parsed === 3) return 'bg-blue-500/15 text-blue-300 border-blue-500/25';
  return 'bg-slate-800 text-slate-300 border-slate-700';
};

const getNumberClass = (value?: string) => {
  const parsed = parseNumber(value);
  if (parsed === null) return 'bg-slate-800 text-slate-400 border-slate-700';

  if (parsed >= 8) return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25';
  if (parsed >= 5) return 'bg-brand-500/15 text-brand-300 border-brand-500/25';
  if (parsed >= 2) return 'bg-yellow-500/15 text-yellow-300 border-yellow-500/25';
  return 'bg-slate-800 text-slate-300 border-slate-700';
};

const getBadgeClass = (mode: TableMode, value?: string) => {
  if (mode === 'percent') return getHeatClass(value);
  if (mode === 'rank') return getRankClass(value);
  return getNumberClass(value);
};

const formatCell = (mode: TableMode, value?: string) => {
  if (mode === 'percent') return formatPercent(value);
  if (mode === 'rank') return parseNumber(value) ? `#${formatNumber(value)}` : '—';
  return formatNumber(value);
};

const getBestOwnerForRow = (row: string[], headers: string[], mode: TableMode) => {
  const values = row.slice(1).map((value, index) => ({
    owner: headers[index],
    value: parseNumber(value),
  }));

  const valid = values.filter((item) => item.value !== null) as { owner: string; value: number }[];
  if (!valid.length) return null;

  const sorted = valid.sort((a, b) => (mode === 'rank' ? a.value - b.value : b.value - a.value));
  return sorted[0];
};

const getAverageForRow = (row: string[]) => {
  const values = row
    .slice(1)
    .map(parseNumber)
    .filter((value): value is number => value !== null);

  if (!values.length) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
};

const getOwnerTotals = (section: ParsedSection) => {
  return section.headers.map((owner, index) => {
    const total = section.rows.reduce((sum, row) => sum + (parseNumber(row[index + 1]) || 0), 0);
    return { owner, total };
  });
};

const SummaryCard = ({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  detail: string;
}) => (
  <div className="bg-slate-800/70 rounded-xl border border-slate-700 p-4">
    <div className="flex items-center gap-2 text-slate-400 text-sm mb-3">
      <Icon size={18} className="text-brand-400" />
      {label}
    </div>
    <div className="text-2xl font-bold text-white leading-tight">{value}</div>
    <div className="text-xs text-slate-500 mt-2 leading-relaxed">{detail}</div>
  </div>
);

const DataTable = ({
  section,
  mode,
  description,
}: {
  section: ParsedSection;
  mode: TableMode;
  description: string;
}) => {
  const rows = section.rows.filter((row) => row[0]);

  return (
    <div className="bg-slate-900/70 rounded-xl border border-slate-700 overflow-hidden">
      <div className="p-4 md:p-5 border-b border-slate-700 bg-slate-800/40">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h2 className="text-xl font-display font-bold text-white">{SECTION_LABELS[mode === 'percent' ? 'rates' : mode === 'rank' ? 'ranks' : 'counts']}</h2>
            <p className="text-slate-400 text-sm mt-1">{description}</p>
          </div>

          {mode === 'percent' && (
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="px-2 py-1 rounded border border-emerald-500/25 bg-emerald-500/15 text-emerald-300">60%+ elite</span>
              <span className="px-2 py-1 rounded border border-brand-500/25 bg-brand-500/15 text-brand-300">45–59% strong</span>
              <span className="px-2 py-1 rounded border border-yellow-500/25 bg-yellow-500/15 text-yellow-300">30–44% usable</span>
              <span className="px-2 py-1 rounded border border-red-500/25 bg-red-500/15 text-red-300">Under 30%</span>
            </div>
          )}
        </div>
      </div>

      <div className="block md:hidden p-4 space-y-3">
        {rows.map((row) => {
          const best = getBestOwnerForRow(row, section.headers, mode);

          return (
            <div key={`${section.title}-${row[0]}`} className="rounded-lg border border-slate-700 bg-slate-800/60 p-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <div className="text-white font-semibold">{row[0]}</div>
                  <div className="text-slate-500 text-xs mt-1">{ROUND_EXPLANATIONS[row[0]] || 'Total performance across all rounds.'}</div>
                </div>
                {best && (
                  <div className="text-right shrink-0">
                    <div className="text-slate-500 text-xs">Best</div>
                    <div className="text-brand-300 text-sm font-semibold">{best.owner}</div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                {section.headers.map((owner, index) => {
                  const value = row[index + 1];
                  return (
                    <div key={`${row[0]}-${owner}`} className={`rounded-lg border px-3 py-2 ${getBadgeClass(mode, value)}`}>
                      <div className="text-xs opacity-80">{owner}</div>
                      <div className="text-lg font-bold">{formatCell(mode, value)}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="hidden md:block overflow-x-auto">
        <table className="w-full min-w-[760px]">
          <thead>
            <tr className="border-b border-slate-700 bg-slate-950/60">
              <th className="sticky left-0 z-10 bg-slate-950 text-left py-3 px-4 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                Round
              </th>
              {section.headers.map((owner) => (
                <th key={owner} className="text-left py-3 px-4 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                  {owner}
                </th>
              ))}
              {mode === 'percent' && (
                <th className="text-left py-3 px-4 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                  Round Avg
                </th>
              )}
              <th className="text-left py-3 px-4 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                Read
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {rows.map((row) => {
              const isTotal = row[0].toLowerCase().includes('total');
              const best = getBestOwnerForRow(row, section.headers, mode);
              const avg = getAverageForRow(row);

              return (
                <tr key={`${section.title}-${row[0]}`} className={isTotal ? 'bg-brand-500/10' : 'hover:bg-slate-800/40'}>
                  <td className="sticky left-0 z-10 bg-slate-950 py-3 px-4">
                    <div className="text-white font-semibold">{row[0]}</div>
                    <div className="text-slate-500 text-xs mt-0.5 max-w-[180px]">
                      {ROUND_EXPLANATIONS[row[0]] || 'Overall average'}
                    </div>
                  </td>

                  {section.headers.map((owner, index) => {
                    const value = row[index + 1];
                    return (
                      <td key={`${row[0]}-${owner}`} className="py-3 px-4">
                        <span className={`inline-flex min-w-[66px] items-center justify-center rounded-lg border px-3 py-1.5 text-sm font-bold ${getBadgeClass(mode, value)}`}>
                          {formatCell(mode, value)}
                        </span>
                      </td>
                    );
                  })}

                  {mode === 'percent' && (
                    <td className="py-3 px-4">
                      <span className={`inline-flex min-w-[66px] items-center justify-center rounded-lg border px-3 py-1.5 text-sm font-bold ${getHeatClass(avg === null ? '' : `${avg}`)}`}>
                        {avg === null ? '—' : `${Math.round(avg * 100)}%`}
                      </span>
                    </td>
                  )}

                  <td className="py-3 px-4 text-sm text-slate-400">
                    {best ? (
                      <span>
                        {mode === 'rank' ? 'Best rank' : 'Best'}: <strong className="text-white">{best.owner}</strong>
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const HitRates: React.FC = () => {
  const sections = useMemo(parseHitRateSections, []);
  const rates = sections.rates;
  const counts = sections.counts;
  const ranks = sections.ranks;

  const summary = useMemo(() => {
    const totalAverageRow = rates.rows.find((row) => row[0].toLowerCase().includes('total'));
    const rateRows = rates.rows.filter((row) => !row[0].toLowerCase().includes('total'));

    const bestOverall = totalAverageRow
      ? getBestOwnerForRow(totalAverageRow, rates.headers, 'percent')
      : null;

    const roundAverages = rateRows
      .map((row) => ({ round: row[0], average: getAverageForRow(row) }))
      .filter((item): item is { round: string; average: number } => item.average !== null);

    const strongestRound = [...roundAverages].sort((a, b) => b.average - a.average)[0];
    const toughestRound = [...roundAverages].sort((a, b) => a.average - b.average)[0];

    const ownerTotals = getOwnerTotals(counts);
    const mostHits = [...ownerTotals].sort((a, b) => b.total - a.total)[0];

    return {
      bestOverall,
      strongestRound,
      toughestRound,
      mostHits,
    };
  }, [rates, counts]);

  const roundTakeaways = rates.rows
    .filter((row) => row[0] && !row[0].toLowerCase().includes('total'))
    .map((row) => {
      const best = getBestOwnerForRow(row, rates.headers, 'percent');
      const average = getAverageForRow(row);
      return { round: row[0], best, average };
    });

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6 md:space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1 text-brand-300 text-xs font-semibold mb-3">
            <Target size={14} />
            Draft evaluation dashboard
          </div>
          <h1 className="text-3xl md:text-5xl font-display font-bold text-white tracking-tight">
            Hit Rates
          </h1>
          <p className="text-slate-400 text-sm md:text-base mt-2 max-w-2xl">
            A cleaner view of which franchises consistently turn draft picks into starters.
            Use this to understand scouting strength, trade value, and where each team wins or struggles by round.
          </p>
        </div>

        <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-4 max-w-md">
          <div className="flex items-start gap-3">
            <Info className="text-blue-400 mt-0.5 shrink-0" size={20} />
            <div>
              <h3 className="text-white font-bold text-sm mb-1">What counts as a hit?</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                A hit means the player became a regular starter. Rounds 1–2 need 3 starter years,
                rounds 3–5 need 2 starter years, and rounds 6–7/undrafted need 1 starter year.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <SummaryCard
          icon={Trophy}
          label="Best overall hit rate"
          value={summary.bestOverall ? `${summary.bestOverall.owner} • ${Math.round(summary.bestOverall.value * 100)}%` : '—'}
          detail="Uses the Total Ave row across all draft buckets."
        />
        <SummaryCard
          icon={Hash}
          label="Most total hits"
          value={summary.mostHits ? `${summary.mostHits.owner} • ${summary.mostHits.total}` : '—'}
          detail="Raw starter-hit count across all tracked rounds."
        />
        <SummaryCard
          icon={TrendingUp}
          label="Friendliest round"
          value={summary.strongestRound ? `${summary.strongestRound.round} • ${Math.round(summary.strongestRound.average * 100)}%` : '—'}
          detail="Highest average success rate across owners."
        />
        <SummaryCard
          icon={TrendingDown}
          label="Hardest round"
          value={summary.toughestRound ? `${summary.toughestRound.round} • ${Math.round(summary.toughestRound.average * 100)}%` : '—'}
          detail="Lowest average success rate across owners."
        />
      </div>

      <div className="bg-slate-800/60 rounded-xl border border-slate-700 p-4 md:p-5">
        <div className="flex items-center gap-2 mb-4">
          <Medal size={20} className="text-yellow-400" />
          <h2 className="text-white font-display font-bold text-xl">Quick Takeaways by Round</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          {roundTakeaways.map((item) => (
            <div key={item.round} className="rounded-lg border border-slate-700 bg-slate-900/70 p-4">
              <div className="flex items-center justify-between gap-3 mb-2">
                <div className="text-white font-bold">{item.round}</div>
                <div className="text-slate-500 text-xs">
                  Avg {item.average === null ? '—' : `${Math.round(item.average * 100)}%`}
                </div>
              </div>
              <div className="text-slate-400 text-xs leading-relaxed mb-3">
                {ROUND_EXPLANATIONS[item.round] || 'Round-level hit rate.'}
              </div>
              {item.best && (
                <div className="rounded-lg border border-brand-500/25 bg-brand-500/10 px-3 py-2">
                  <div className="text-brand-300 text-xs">Best in this bucket</div>
                  <div className="text-white font-semibold">
                    {item.best.owner} • {Math.round(item.best.value * 100)}%
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <DataTable
        section={rates}
        mode="percent"
        description="The main table. Higher percentages mean more of that owner's picks became starter-level players."
      />

      <DataTable
        section={counts}
        mode="number"
        description="Raw number of starter hits by round. This adds context to the percentages."
      />

      <DataTable
        section={ranks}
        mode="rank"
        description="Simple rank by round, where #1 is best in that bucket."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-gradient-to-r from-brand-500/10 to-blue-500/10 border border-brand-500/30 rounded-xl p-5">
          <h2 className="text-xl font-display font-bold text-white mb-4 flex items-center gap-2">
            <AlertCircle className="text-brand-400" size={22} />
            How to Read This Page
          </h2>
          <div className="space-y-3 text-sm text-slate-300">
            <p>
              <strong className="text-white">Hit Rate</strong> answers: “How often did this owner turn picks in this round into starters?”
            </p>
            <p>
              <strong className="text-white">Hit Count</strong> answers: “How many actual starter hits did they produce?”
            </p>
            <p>
              <strong className="text-white">Rank</strong> answers: “Who was best compared to the rest of the league in that round?”
            </p>
          </div>
        </div>

        <div className="bg-slate-800/70 rounded-xl p-5 border border-slate-700">
          <h3 className="text-xl font-display font-bold text-white mb-4 flex items-center gap-2">
            <Award className="text-yellow-400" size={22} />
            Hit Criteria by Round
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-slate-900/70 rounded-lg p-4 border border-slate-700">
              <div className="text-brand-300 font-semibold">Rounds 1–2</div>
              <div className="text-white font-bold mt-1">3+ starter years</div>
              <div className="text-slate-500 text-xs mt-1">Premium pick standard</div>
            </div>
            <div className="bg-slate-900/70 rounded-lg p-4 border border-slate-700">
              <div className="text-brand-300 font-semibold">Rounds 3–5</div>
              <div className="text-white font-bold mt-1">2+ starter years</div>
              <div className="text-slate-500 text-xs mt-1">Development value</div>
            </div>
            <div className="bg-slate-900/70 rounded-lg p-4 border border-slate-700">
              <div className="text-brand-300 font-semibold">Rounds 6–7 / UN</div>
              <div className="text-white font-bold mt-1">1+ starter year</div>
              <div className="text-slate-500 text-xs mt-1">Any starter is a win</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-900/70 rounded-xl border border-slate-700 p-5">
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 className="text-brand-400" size={20} />
          <h3 className="text-white font-display font-bold text-lg">Best Use</h3>
        </div>
        <p className="text-slate-400 text-sm leading-relaxed">
          Use hit rates as a strategy signal, not a final verdict. A high percentage with a low hit count can be noisy,
          while a strong hit count across several rounds is more reliable. The best drafting profiles combine a strong
          total average, multiple #1 round ranks, and enough raw hits to prove the pattern is real.
        </p>
      </div>
    </div>
  );
};
