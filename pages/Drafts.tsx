import React, { useState, useMemo } from 'react';
import { DRAFT_CSV, ALL_TEAMS } from '../constants';
import { TrendingUp, TrendingDown, AlertCircle, Award } from 'lucide-react';

export const Drafts: React.FC = () => {
  const [roundFilter, setRoundFilter] = useState<string>('ALL');

  // Parse CSV data
  const lines = DRAFT_CSV.trim().split('\n');
  const headers = lines[0].split(',');
  const allRows = lines.slice(1).map((line) => line.split(','));

  // Get all players from all teams for OVR lookup
  const allPlayers = useMemo(() => {
    return ALL_TEAMS.flatMap((team) => team.roster);
  }, []);

  // Extract player name from draft cell (e.g., "WR Jayden Higgins (1)" -> "Jayden Higgins")
  const extractPlayerName = (cell: string): string | null => {
    if (!cell || cell.trim() === '' || cell.includes('Trades') || cell.includes('Order')) {
      return null;
    }
    // Remove position prefix, markers like (1), (2), $, &&, ###, and team abbreviations
    const cleaned = cell
      .replace(/^(QB|RB|WR|TE|OL|OT|OG|C|ED|DT|LB|CB|S|K|G)\s+/i, '')
      .replace(/\s*\([0-9]+\)\s*/g, '')
      .replace(/\s*\$\s*/g, '')
      .replace(/\s*&&\s*/g, '')
      .replace(/\s*###\s*/g, '')
      .replace(/\s+(Ind|Sea|Lvr|Min|Hou|Gb|Ne|Atl|Chi|Den|Pit|Kc|Mia|Buf|Bal|Lac|Ten|Cin|Car|No|Sf|Cle|Lar|Tb|Nyj|Was|Phi|Arz|Nyg|Det|Jax|Osu|Bama|Fsu|Nd|Mich|Uga|Iowa|Wisc|LSU|Psu|Nw|Okla|Stanford|Okst|Duke|Fla|ORE|UCF|SYR|Gram|MSU|TCU|MidTen|UAB|Boise|TxAm|Vir|FL|Fres|AUB|Minn|Bay|Vandy|NCST|Okst|Md|ILL|Vir|CLEM|MSST|FSU|Clem|Psu|Uconn|UK|ISU|UNC|BAMA|IND|MD|Utsa|SamH|UC|Sc|VT|ASU|WISC|Uga|Osu|NEB|PSU|BAY|FlAM|ND|AUB|UNC|MICH|Mizz|TX|Arizona St|Fau|Wash|Tx|Ore|PUR|Tul|Fres|ASU|Okst|Neb|Vir|Aub|NCST|Md|ILL|VTECH|TENN|IDA|SAN JOSE ST|UTSA|BSU|WMU|LIB|Clem|Uconn|RUTGERS|RUT|TUL|OKST|OSU|Cent Mizz|Uc|Ten|Fres|Ore|Az|AUB|Vandy|Aub|Okst|Wake|Gram|UAB|Col|TxAm|Louisiana|FAU|Tul|PUR|Fres|Vandy|Bay|Ore|III)\s*$/i, '')
      .trim();

    return cleaned || null;
  };

  // Determine if a pick is a "steal" or "bust"
  const evaluatePick = (round: string, playerName: string | null): { type: 'steal' | 'bust' | 'normal', ovr: number } => {
    if (!playerName) return { type: 'normal', ovr: 0 };

    const player = allPlayers.find((p) =>
      p.name.toLowerCase().includes(playerName.toLowerCase()) ||
      playerName.toLowerCase().includes(p.name.toLowerCase())
    );

    const currentOvr = player?.ovr || 0;
    const numericRound = parseInt(round);

    // Steals: Late rounds (5-7, UN) with high current OVR (80+)
    if ((numericRound >= 5 || round === 'UN') && currentOvr >= 80) {
      return { type: 'steal', ovr: currentOvr };
    }

    // Busts: Early rounds (1-3) with low OVR (<70) or not on roster (0)
    if (numericRound >= 1 && numericRound <= 3 && currentOvr < 70) {
      return { type: 'bust', ovr: currentOvr };
    }

    return { type: 'normal', ovr: currentOvr };
  };

  // Filter rows by round
  const filteredRows = useMemo(() => {
    if (roundFilter === 'ALL') return allRows;
    return allRows.filter((row) => row[0] === roundFilter);
  }, [allRows, roundFilter]);

  // Count steals and busts
  const { stealCount, bustCount } = useMemo(() => {
    let steals = 0;
    let busts = 0;

    allRows.forEach((row) => {
      const round = row[0];
      // Check all team columns (skip RD, #, Order columns)
      for (let i = 3; i < row.length; i++) {
        const playerName = extractPlayerName(row[i]);
        if (playerName) {
          const evaluation = evaluatePick(round, playerName);
          if (evaluation.type === 'steal') steals++;
          if (evaluation.type === 'bust') busts++;
        }
      }
    });

    return { stealCount: steals, bustCount: busts };
  }, [allRows]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-4xl font-display font-bold text-white mb-4">DRAFT HISTORY</h1>

      {/* Intro */}
      <p className="text-slate-300 text-lg mb-6 max-w-3xl">
        Analyze historical draft performance across all rounds. Identify{' '}
        <span className="text-brand-500 font-semibold">late-round steals</span> (rounds 5-7/UN with 80+ OVR) and{' '}
        <span className="text-red-400 font-semibold">early-round busts</span> (rounds 1-3 with &lt;70 OVR).
        Draft value is measured by comparing <span className="font-semibold">draft capital invested</span> versus{' '}
        <span className="font-semibold">current Madden rating</span>.
      </p>

      {/* Legend */}
      <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 mb-6">
        <div className="flex flex-wrap items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <TrendingUp className="text-brand-500" size={16} />
            <span className="text-slate-300">Late-Round Steal (80+ OVR)</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingDown className="text-red-400" size={16} />
            <span className="text-slate-300">Early-Round Bust (&lt;70 OVR)</span>
          </div>
          <div className="flex items-center gap-2">
            <Award className="text-yellow-500" size={16} />
            <span className="text-slate-300">High-Value Pick</span>
          </div>
        </div>
      </div>

      {/* Filter and Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <label className="block text-slate-400 text-sm mb-2">Filter by Round</label>
          <select
            value={roundFilter}
            onChange={(e) => setRoundFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-brand-500"
          >
            <option value="ALL">All Rounds</option>
            <option value="1">Round 1</option>
            <option value="2">Round 2</option>
            <option value="3">Round 3</option>
            <option value="4">Round 4</option>
            <option value="5">Round 5</option>
            <option value="6">Round 6</option>
            <option value="7">Round 7</option>
            <option value="UN">Undrafted (UN)</option>
          </select>
        </div>

        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="text-brand-500" size={18} />
            <p className="text-slate-400 text-sm">Total Steals</p>
          </div>
          <p className="text-2xl font-bold text-brand-500">{stealCount}</p>
        </div>

        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown className="text-red-400" size={18} />
            <p className="text-slate-400 text-sm">Total Busts</p>
          </div>
          <p className="text-2xl font-bold text-red-400">{bustCount}</p>
        </div>

        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle className="text-slate-400" size={18} />
            <p className="text-slate-400 text-sm">Total Picks</p>
          </div>
          <p className="text-2xl font-bold text-white">{allRows.length}</p>
        </div>
      </div>

      {/* Draft Table */}
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h2 className="text-2xl font-display font-bold text-white mb-6">
          {roundFilter === 'ALL' ? 'ALL DRAFT PICKS' : `ROUND ${roundFilter} PICKS`}
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                {headers.map((header, index) => (
                  <th key={index} className="text-left py-3 px-3 text-slate-400 font-medium whitespace-nowrap">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row, rowIndex) => {
                const round = row[0];

                return (
                  <tr key={rowIndex} className="border-b border-slate-800 hover:bg-slate-700/50">
                    {row.map((cell, cellIndex) => {
                      // Evaluate picks in team columns (skip RD, #, Order)
                      let cellClass = 'py-2 px-3 text-slate-300 whitespace-nowrap';
                      let icon = null;

                      if (cellIndex >= 3 && cell) {
                        const playerName = extractPlayerName(cell);
                        if (playerName) {
                          const evaluation = evaluatePick(round, playerName);

                          if (evaluation.type === 'steal') {
                            cellClass = 'py-2 px-3 whitespace-nowrap bg-brand-500/10 text-brand-500 font-medium';
                            icon = <TrendingUp className="inline-block mr-1" size={14} />;
                          } else if (evaluation.type === 'bust') {
                            cellClass = 'py-2 px-3 whitespace-nowrap bg-red-500/10 text-red-400 font-medium';
                            icon = <TrendingDown className="inline-block mr-1" size={14} />;
                          }
                        }
                      }

                      return (
                        <td key={cellIndex} className={cellClass}>
                          {icon}
                          {cell || '-'}
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
    </div>
  );
};
