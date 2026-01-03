import React from 'react';
import { HIT_RATES_CSV } from '../constants';
import { TrendingUp, TrendingDown, Target, Info, Award, AlertCircle } from 'lucide-react';

export const HitRates: React.FC = () => {
  // Parse CSV data
  const lines = HIT_RATES_CSV.trim().split('\n');
  const sections: { title: string; data: string[][] }[] = [];

  let currentSection: string[][] = [];
  let currentTitle = '';

  lines.forEach((line) => {
    const cells = line.split(',');
    if (cells[0] && !cells[0].startsWith('Unnamed') && cells.some(c => c.trim())) {
      if (currentSection.length > 0) {
        sections.push({ title: currentTitle, data: currentSection });
        currentSection = [];
      }
      currentTitle = cells[0];
    }
    currentSection.push(cells);
  });

  if (currentSection.length > 0) {
    sections.push({ title: currentTitle, data: currentSection });
  }

  // Determine color class based on percentage value
  const getPercentageColor = (value: string): string => {
    const num = parseFloat(value);
    if (isNaN(num)) return '';

    // High success: 50%+ (green)
    if (num >= 0.5) return 'bg-brand-500/20 text-brand-500 font-bold';
    // Medium success: 30-49% (yellow)
    if (num >= 0.3) return 'bg-yellow-500/20 text-yellow-500 font-medium';
    // Low success: <30% (red)
    return 'bg-red-500/20 text-red-400 font-medium';
  };

  // Get icon based on percentage value
  const getPercentageIcon = (value: string) => {
    const num = parseFloat(value);
    if (isNaN(num)) return null;

    if (num >= 0.6) return <TrendingUp className="inline-block mr-1" size={14} />;
    if (num < 0.25) return <TrendingDown className="inline-block mr-1" size={14} />;
    return null;
  };

  // Format percentage for display
  const formatPercentage = (value: string): string => {
    const num = parseFloat(value);
    if (isNaN(num)) return value;
    return `${Math.round(num * 100)}%`;
  };

  // Check if a cell contains a percentage
  const isPercentage = (value: string): boolean => {
    const num = parseFloat(value);
    return !isNaN(num) && num >= 0 && num <= 1;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-4xl font-display font-bold text-white mb-4">HIT RATES ANALYSIS</h1>

      {/* Intro */}
      <p className="text-slate-300 text-lg mb-6 max-w-3xl">
        Hit rates measure <span className="text-brand-500 font-semibold">draft success</span> by tracking which picks become valuable contributors.
        A "hit" is defined by league criteria (typically starter-level performance over multiple years).
        Higher percentages indicate <span className="font-semibold">superior scouting and drafting strategy</span>.
        Use this data to identify which teams excel at finding talent in specific rounds.
      </p>

      {/* Legend */}
      <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 mb-6">
        <div className="flex flex-wrap items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-brand-500/20 flex items-center justify-center">
              <TrendingUp className="text-brand-500" size={14} />
            </div>
            <span className="text-slate-300">High Success (50%+)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-yellow-500/20 flex items-center justify-center">
              <Target className="text-yellow-500" size={14} />
            </div>
            <span className="text-slate-300">Medium Success (30-49%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-red-500/20 flex items-center justify-center">
              <TrendingDown className="text-red-400" size={14} />
            </div>
            <span className="text-slate-300">Low Success (&lt;30%)</span>
          </div>
        </div>
      </div>

      {/* Data Sections */}
      <div className="space-y-6 mb-8">
        {sections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h2 className="text-2xl font-display font-bold text-white mb-4 flex items-center gap-2">
              {section.title === 'Highest Hit %' && <Award className="text-yellow-500" size={24} />}
              {section.title === 'Count for Formula' && <Info className="text-brand-500" size={24} />}
              {section.title || `Section ${sectionIndex + 1}`}
            </h2>

            {section.title === 'Highest Hit %' && (
              <p className="text-slate-400 text-sm mb-4">
                Success rate by draft round for each team. Higher percentages indicate better talent evaluation.
              </p>
            )}

            {section.title === 'Count for Formula' && (
              <p className="text-slate-400 text-sm mb-4">
                Total number of "hits" recorded by round. More hits demonstrate consistent drafting success.
              </p>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <tbody>
                  {section.data.map((row, rowIndex) => (
                    <tr
                      key={rowIndex}
                      className={rowIndex === 0 ? 'border-b-2 border-slate-700' : 'border-b border-slate-800'}
                    >
                      {row.map((cell, cellIndex) => {
                        const isHeaderRow = rowIndex === 0;
                        const isFirstColumn = cellIndex === 0;
                        const cellIsPercentage = isPercentage(cell);
                        const isTotalRow = row[0]?.includes('Total') || row[0]?.includes('Ave');

                        let cellClass = 'py-3 px-4';

                        if (isHeaderRow) {
                          cellClass += ' text-slate-400 font-medium';
                        } else if (isFirstColumn) {
                          cellClass += ' text-white font-medium';
                        } else if (cellIsPercentage) {
                          cellClass += ` ${getPercentageColor(cell)}`;
                        } else {
                          cellClass += ' text-slate-300';
                        }

                        // Highlight total row
                        if (isTotalRow && !isFirstColumn && cellIsPercentage) {
                          cellClass += ' ring-1 ring-brand-500/30';
                        }

                        return (
                          <td key={cellIndex} className={cellClass}>
                            {cellIsPercentage ? (
                              <>
                                {getPercentageIcon(cell)}
                                {formatPercentage(cell)}
                              </>
                            ) : (
                              cell || '-'
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {/* How to Use This Data */}
      <div className="bg-gradient-to-r from-brand-500/10 to-blue-500/10 border border-brand-500/30 rounded-lg p-6 mb-6">
        <h2 className="text-2xl font-display font-bold text-white mb-4 flex items-center gap-2">
          <AlertCircle className="text-brand-500" size={24} />
          HOW TO USE THIS DATA
        </h2>
        <div className="space-y-4 text-slate-300">
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-500 text-white flex items-center justify-center text-xs font-bold mt-0.5">
              1
            </div>
            <div>
              <p className="font-semibold text-white mb-1">Evaluate Draft Strategy</p>
              <p className="text-sm">
                Compare hit rates across rounds to identify which teams excel at early-round picks vs. finding late-round gems.
                Teams with high hit rates in rounds 5-7 demonstrate superior scouting depth.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-500 text-white flex items-center justify-center text-xs font-bold mt-0.5">
              2
            </div>
            <div>
              <p className="font-semibold text-white mb-1">Assess Trade Value</p>
              <p className="text-sm">
                Use hit rates to evaluate trade offers involving draft picks. A 2nd round pick from a team with 60% hit rate
                is more valuable than one from a team with 30% success.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-500 text-white flex items-center justify-center text-xs font-bold mt-0.5">
              3
            </div>
            <div>
              <p className="font-semibold text-white mb-1">Identify Patterns</p>
              <p className="text-sm">
                Look for teams with consistently high "Total Ave" percentages—these franchises have superior talent evaluation processes.
                Conversely, low hit rates may indicate need for scouting improvements or positional focus issues.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-500 text-white flex items-center justify-center text-xs font-bold mt-0.5">
              4
            </div>
            <div>
              <p className="font-semibold text-white mb-1">Plan Future Drafts</p>
              <p className="text-sm">
                If your team has low hit rates in specific rounds, adjust your draft strategy. Consider trading down from rounds
                where you historically struggle, or focus scouting resources on improving evaluation in those rounds.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h3 className="text-xl font-display font-bold text-white mb-4">ABOUT HIT CRITERIA</h3>
        <div className="text-slate-300 space-y-2 text-sm">
          <p>
            <span className="text-brand-500 font-semibold">Rounds 1-2:</span> Must be a starter (depth order &lt;5) in 3 of first 5 years to qualify as a "hit"
          </p>
          <p>
            <span className="text-brand-500 font-semibold">Rounds 3-5:</span> Must be a starter in 2 of first 5 years to qualify as a "hit"
          </p>
          <p>
            <span className="text-brand-500 font-semibold">Rounds 6-7 & UN:</span> Must be a starter in 1 of first 5 years to qualify as a "hit"
          </p>
          <p className="text-slate-500 text-xs mt-4">
            These thresholds reflect realistic expectations for draft capital invested. Early picks are held to higher standards.
          </p>
        </div>
      </div>
    </div>
  );
};
