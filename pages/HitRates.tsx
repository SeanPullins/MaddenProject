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
    if (num >= 0.5) return 'text-brand-500';
    // Medium success: 30-49% (yellow)
    if (num >= 0.3) return 'text-yellow-500';
    // Low success: <30% (red)
    return 'text-red-400';
  };

  // Get background color based on percentage value
  const getPercentageBg = (value: string): string => {
    const num = parseFloat(value);
    if (isNaN(num)) return '';

    if (num >= 0.5) return 'bg-brand-500/10';
    if (num >= 0.3) return 'bg-yellow-500/10';
    return 'bg-red-500/10';
  };

  // Get icon based on percentage value
  const getPercentageIcon = (value: string) => {
    const num = parseFloat(value);
    if (isNaN(num)) return null;

    if (num >= 0.6) return <TrendingUp className="inline-block" size={16} />;
    if (num < 0.25) return <TrendingDown className="inline-block" size={16} />;
    return <Target className="inline-block" size={16} />;
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
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-3">
        HIT RATES ANALYSIS
      </h1>
      <p className="text-slate-400 text-sm md:text-base mb-6 md:mb-8">
        Track draft success by round and team
      </p>

      {/* What is a Hit */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6 md:mb-8">
        <div className="flex items-start gap-3">
          <Info className="text-blue-500 mt-0.5 flex-shrink-0" size={20} />
          <div>
            <h3 className="text-white font-bold mb-2">What is a "Hit"?</h3>
            <p className="text-slate-300 text-sm">
              A draft pick qualifies as a <span className="text-blue-500 font-semibold">"hit"</span> when the player becomes a <strong>regular starter</strong> for your franchise.
              The threshold varies by round: early picks (Rounds 1-2) must start in 3 of their first 5 years,
              mid-rounds (3-5) need 2 years, and late rounds (6-7/UN) need just 1 year as a starter.
            </p>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-slate-800/50 rounded-lg p-4 mb-6 md:mb-8">
        <div className="flex flex-wrap items-center gap-4 md:gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-brand-500/20 flex items-center justify-center">
              <TrendingUp className="text-brand-500" size={14} />
            </div>
            <span className="text-slate-300">High (50%+)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-yellow-500/20 flex items-center justify-center">
              <Target className="text-yellow-500" size={14} />
            </div>
            <span className="text-slate-300">Medium (30-49%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-red-500/20 flex items-center justify-center">
              <TrendingDown className="text-red-400" size={14} />
            </div>
            <span className="text-slate-300">Low (&lt;30%)</span>
          </div>
        </div>
      </div>

      {/* Data Sections */}
      <div className="space-y-8 md:space-y-10 mb-10">
        {sections.map((section, sectionIndex) => {
          const headers = section.data[0] || [];
          const dataRows = section.data.slice(1);

          return (
            <div key={sectionIndex} className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                {section.title === 'Highest Hit %' && <Award className="text-yellow-500" size={24} />}
                {section.title === 'Count for Formula' && <Info className="text-brand-500" size={24} />}
                <div>
                  <h2 className="text-xl md:text-2xl font-display font-bold text-white">
                    {section.title || `Section ${sectionIndex + 1}`}
                  </h2>
                  {section.title === 'Highest Hit %' && (
                    <p className="text-slate-500 text-xs md:text-sm mt-1">
                      Success rate by draft round
                    </p>
                  )}
                  {section.title === 'Count for Formula' && (
                    <p className="text-slate-500 text-xs md:text-sm mt-1">
                      Total hits by round
                    </p>
                  )}
                </div>
              </div>

              {/* Mobile: Card layout */}
              <div className="block md:hidden space-y-4">
                {dataRows.map((row, rowIndex) => {
                  const teamName = row[0];
                  if (!teamName) return null;

                  return (
                    <div key={rowIndex} className="bg-slate-800/50 rounded-lg p-4 space-y-3">
                      <h3 className="text-white font-bold text-base">{teamName}</h3>
                      <div className="grid grid-cols-2 gap-3">
                        {headers.slice(1).map((header, idx) => {
                          const value = row[idx + 1];
                          if (!value) return null;
                          const cellIsPercentage = isPercentage(value);

                          return (
                            <div key={idx} className="space-y-1">
                              <p className="text-slate-500 text-xs">{header}</p>
                              {cellIsPercentage ? (
                                <div className={`flex items-center gap-2 px-3 py-2 rounded ${getPercentageBg(value)}`}>
                                  <span className={`text-lg font-bold ${getPercentageColor(value)}`}>
                                    {formatPercentage(value)}
                                  </span>
                                  <span className={getPercentageColor(value)}>
                                    {getPercentageIcon(value)}
                                  </span>
                                </div>
                              ) : (
                                <p className="text-slate-300 text-base px-3 py-2">{value}</p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop: Optimized table with better spacing */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700">
                      {headers.map((header, idx) => (
                        <th key={idx} className={`text-left py-4 px-4 text-slate-500 text-xs uppercase tracking-wider font-medium ${idx === 0 ? 'sticky left-0 bg-slate-950' : ''}`}>
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {dataRows.map((row, rowIndex) => {
                      const isTotalRow = row[0]?.includes('Total') || row[0]?.includes('Ave');

                      return (
                        <tr key={rowIndex} className={isTotalRow ? 'bg-slate-800/30' : ''}>
                          {row.map((cell, cellIndex) => {
                            const isFirstColumn = cellIndex === 0;
                            const cellIsPercentage = isPercentage(cell);

                            return (
                              <td key={cellIndex} className={`py-4 px-4 ${isFirstColumn ? 'sticky left-0 bg-slate-950' : ''}`}>
                                {isFirstColumn ? (
                                  <span className="text-white font-medium">{cell || '-'}</span>
                                ) : cellIsPercentage ? (
                                  <div className="flex items-center gap-2">
                                    <span className={`text-xl font-bold ${getPercentageColor(cell)}`}>
                                      {formatPercentage(cell)}
                                    </span>
                                    <span className={getPercentageColor(cell)}>
                                      {getPercentageIcon(cell)}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-slate-400 text-sm">{cell || '-'}</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>

      {/* How to Use This Data */}
      <div className="bg-gradient-to-r from-brand-500/10 to-blue-500/10 border border-brand-500/30 rounded-lg p-6 mb-8">
        <h2 className="text-xl md:text-2xl font-display font-bold text-white mb-4 flex items-center gap-2">
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
      <div className="bg-gradient-to-r from-slate-800 to-slate-850 rounded-lg p-6 border border-slate-700">
        <h3 className="text-lg md:text-xl font-display font-bold text-white mb-4 flex items-center gap-2">
          <AlertCircle className="text-brand-500" size={20} />
          HIT CRITERIA BY ROUND
        </h3>
        <p className="text-slate-400 text-sm mb-4">
          Draft picks are evaluated based on <strong className="text-white">starter years</strong> (depth order &lt; 5) within their first 5 seasons.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <Award className="text-yellow-500" size={18} />
              <span className="text-brand-500 font-semibold text-base">Rounds 1-2</span>
            </div>
            <p className="text-slate-300 text-sm">
              <strong className="text-white">3+ years</strong> as a starter
            </p>
            <p className="text-slate-500 text-xs mt-1">High expectations</p>
          </div>

          <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <Target className="text-blue-500" size={18} />
              <span className="text-brand-500 font-semibold text-base">Rounds 3-5</span>
            </div>
            <p className="text-slate-300 text-sm">
              <strong className="text-white">2+ years</strong> as a starter
            </p>
            <p className="text-slate-500 text-xs mt-1">Moderate expectations</p>
          </div>

          <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="text-brand-500" size={18} />
              <span className="text-brand-500 font-semibold text-base">Rounds 6-7 & UN</span>
            </div>
            <p className="text-slate-300 text-sm">
              <strong className="text-white">1+ year</strong> as a starter
            </p>
            <p className="text-slate-500 text-xs mt-1">Any starter is a win</p>
          </div>
        </div>
      </div>
    </div>
  );
};
