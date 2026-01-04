import React, { useState, useMemo } from 'react';
import { DRAFT_CSV, ALL_TEAMS } from '../constants';
import { TrendingUp, TrendingDown, AlertCircle, Award, Search, Filter } from 'lucide-react';

export const Drafts: React.FC = () => {
  const [yearFilter, setYearFilter] = useState<string>('ALL');
  const [roundFilter, setRoundFilter] = useState<string>('ALL');
  const [userFilter, setUserFilter] = useState<string>('ALL');
  const [positionFilter, setPositionFilter] = useState<string>('ALL');
  const [playerSearch, setPlayerSearch] = useState<string>('');
  const [showHitsOnly, setShowHitsOnly] = useState<boolean>(false);
  const [showTrades, setShowTrades] = useState<boolean>(true);

  // Parse CSV data
  const lines = DRAFT_CSV.trim().split('\n');
  const headers = lines[0].split(',');
  const allRows = lines.slice(1).map((line) => line.split(','));

  // User/team options from headers (columns 3-7)
  const userOptions = headers.slice(3, 8).map((name, idx) => ({
    value: String(idx + 3),
    label: name.trim() || `Team ${idx + 1}`
  }));

  // Get all players from all teams for OVR lookup
  const allPlayers = useMemo(() => {
    return ALL_TEAMS.flatMap((team) => team.roster);
  }, []);

  // Extract year from data (years are marked with standalone rows like "2025,,,Order is,...")
  const extractYear = (rows: string[][]): Map<number, string> => {
    const yearMap = new Map<number, string>();
    let currentYear = '';

    rows.forEach((row, index) => {
      const firstCell = row[0];
      // Check if this is a year marker row (e.g., "2025")
      if (firstCell && /^\d{4}$/.test(firstCell.trim())) {
        currentYear = firstCell.trim();
      }
      yearMap.set(index, currentYear);
    });

    return yearMap;
  };

  const yearMap = useMemo(() => extractYear(allRows), [allRows]);

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

  // Extract position from draft cell
  const extractPosition = (cell: string): string | null => {
    if (!cell || cell.trim() === '') return null;
    const match = cell.match(/^(QB|RB|WR|TE|OL|OT|OG|C|ED|DT|LB|CB|S|K|G)\s+/i);
    return match ? match[1].toUpperCase() : null;
  };

  // Check if cell contains a hit marker ($)
  const isHit = (cell: string): boolean => {
    return cell.includes('$');
  };

  // Check if row is a trade note
  const isTrade = (row: string[]): boolean => {
    return row.some(cell => cell && cell.toLowerCase().includes('trade'));
  };

  // Check if row is a year marker or metadata row
  const isMetadataRow = (row: string[]): boolean => {
    const firstCell = row[0];
    // Year rows, empty rows, or rows with special markers
    if (!firstCell || firstCell.trim() === '') return true;
    if (/^\d{4}$/.test(firstCell.trim())) return true;
    if (row.some(cell => cell && (cell.includes('Order is') || cell.includes('&&') || cell.includes('###')))) return true;
    return false;
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

  // Filter rows by all criteria
  const filteredRows = useMemo(() => {
    let filtered = allRows.map((row, index) => ({ row, index }));

    // Filter by year
    if (yearFilter !== 'ALL') {
      filtered = filtered.filter(({ index }) => yearMap.get(index) === yearFilter);
    }

    // Filter by round
    if (roundFilter !== 'ALL') {
      filtered = filtered.filter(({ row }) => row[0] === roundFilter);
    }

    // Filter by position
    if (positionFilter !== 'ALL') {
      filtered = filtered.filter(({ row }) => {
        return row.some(cell => {
          const pos = extractPosition(cell);
          return pos === positionFilter;
        });
      });
    }

    // Filter by player name search
    if (playerSearch.trim() !== '') {
      const searchLower = playerSearch.toLowerCase();
      filtered = filtered.filter(({ row }) => {
        return row.some(cell => {
          const playerName = extractPlayerName(cell);
          return playerName && playerName.toLowerCase().includes(searchLower);
        });
      });
    }

    // Filter by hits only
    if (showHitsOnly) {
      filtered = filtered.filter(({ row }) => {
        return row.some(cell => isHit(cell));
      });
    }

    // Filter out trades if toggle is off
    if (!showTrades) {
      filtered = filtered.filter(({ row }) => !isTrade(row));
    }

    return filtered.map(({ row, index }) => ({ row, index }));
  }, [allRows, yearFilter, roundFilter, positionFilter, playerSearch, showHitsOnly, showTrades, yearMap]);

  // Count steals, busts, and hits
  const { stealCount, bustCount, hitCount } = useMemo(() => {
    let steals = 0;
    let busts = 0;
    let hits = 0;

    allRows.forEach((row) => {
      const round = row[0];
      // Check all team columns (skip RD, #, Order columns)
      for (let i = 3; i < row.length; i++) {
        const cell = row[i];
        if (isHit(cell)) hits++;

        const playerName = extractPlayerName(cell);
        if (playerName) {
          const evaluation = evaluatePick(round, playerName);
          if (evaluation.type === 'steal') steals++;
          if (evaluation.type === 'bust') busts++;
        }
      }
    });

    return { stealCount: steals, bustCount: busts, hitCount: hits };
  }, [allRows]);

  // Get unique years from data
  const availableYears = useMemo(() => {
    const years = new Set<string>();
    yearMap.forEach((year) => {
      if (year) years.add(year);
    });
    return Array.from(years).sort().reverse();
  }, [yearMap]);

  // Render cell with proper styling
  const renderCell = (cell: string, cellIndex: number, round: string) => {
    if (!cell || cell.trim() === '') return '-';

    // Check for special markers
    const hasHit = isHit(cell);
    const playerName = extractPlayerName(cell);

    let cellClass = '';
    let icon = null;

    if (cellIndex >= 3 && playerName) {
      const evaluation = evaluatePick(round, playerName);

      if (evaluation.type === 'steal') {
        cellClass = 'bg-brand-500/10 text-brand-500 font-medium';
        icon = <TrendingUp className="inline-block mr-1" size={14} />;
      } else if (evaluation.type === 'bust') {
        cellClass = 'bg-red-500/10 text-red-400 font-medium';
        icon = <TrendingDown className="inline-block mr-1" size={14} />;
      }
    }

    // Format the cell content
    let displayContent = cell;
    if (hasHit) {
      // Highlight $ symbol in gold
      displayContent = cell.replace('$', '');
      return (
        <span className={cellClass}>
          {icon}
          {displayContent}
          <span className="text-yellow-500 font-bold ml-1">$</span>
        </span>
      );
    }

    return (
      <span className={cellClass}>
        {icon}
        {displayContent}
      </span>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-4xl font-display font-bold text-white mb-4">DRAFT HISTORY</h1>

      {/* Intro */}
      <p className="text-slate-300 text-lg mb-6 max-w-3xl">
        Analyze historical draft performance across all rounds and years. Identify{' '}
        <span className="text-brand-500 font-semibold">late-round steals</span> (rounds 5-7/UN with 80+ OVR) and{' '}
        <span className="text-red-400 font-semibold">early-round busts</span> (rounds 1-3 with &lt;70 OVR).
        The <span className="text-yellow-500 font-bold">$</span> symbol marks picks that "hit" based on starter criteria.
      </p>

      {/* Legend */}
      <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 mb-6">
        <div className="flex flex-wrap items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-yellow-500 font-bold text-lg">$</span>
            <span className="text-slate-300">Pick "Hit" (met starter criteria)</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="text-brand-500" size={16} />
            <span className="text-slate-300">Late-Round Steal (80+ OVR)</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingDown className="text-red-400" size={16} />
            <span className="text-slate-300">Early-Round Bust (&lt;70 OVR)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400 italic text-xs">C, CE, CET</span>
            <span className="text-slate-300">Compensatory Picks</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-yellow-500 font-bold text-xl">$</span>
            <p className="text-slate-400 text-sm">Total Hits</p>
          </div>
          <p className="text-2xl font-bold text-yellow-500">{hitCount}</p>
        </div>

        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="text-brand-500" size={18} />
            <p className="text-slate-400 text-sm">Steals</p>
          </div>
          <p className="text-2xl font-bold text-brand-500">{stealCount}</p>
        </div>

        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown className="text-red-400" size={18} />
            <p className="text-slate-400 text-sm">Busts</p>
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

      {/* Filters */}
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={20} className="text-brand-500" />
          <h2 className="text-xl font-display font-bold text-white">FILTERS</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Year Filter */}
          <div>
            <label className="block text-slate-400 text-sm mb-2">Year</label>
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-brand-500"
            >
              <option value="ALL">All Years</option>
              {availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          {/* Round Filter */}
          <div>
            <label className="block text-slate-400 text-sm mb-2">Round</label>
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

          {/* User/Team Filter */}
          <div>
            <label className="block text-slate-400 text-sm mb-2">Team Owner</label>
            <select
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-brand-500"
            >
              <option value="ALL">All Owners</option>
              {userOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Position Filter */}
          <div>
            <label className="block text-slate-400 text-sm mb-2">Position</label>
            <select
              value={positionFilter}
              onChange={(e) => setPositionFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-brand-500"
            >
              <option value="ALL">All Positions</option>
              <option value="QB">QB</option>
              <option value="RB">RB</option>
              <option value="WR">WR</option>
              <option value="TE">TE</option>
              <option value="OL">OL</option>
              <option value="OT">OT</option>
              <option value="OG">OG</option>
              <option value="C">C</option>
              <option value="ED">ED</option>
              <option value="DT">DT</option>
              <option value="LB">LB</option>
              <option value="CB">CB</option>
              <option value="S">S</option>
              <option value="K">K</option>
            </select>
          </div>
        </div>

        {/* Search and Toggles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Player Search */}
          <div>
            <label className="block text-slate-400 text-sm mb-2">Search Player</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={18} />
              <input
                type="text"
                value={playerSearch}
                onChange={(e) => setPlayerSearch(e.target.value)}
                placeholder="Type player name..."
                className="w-full pl-10 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          {/* Show Hits Only Toggle */}
          <div>
            <label className="block text-slate-400 text-sm mb-2">Show Hits Only</label>
            <button
              onClick={() => setShowHitsOnly(!showHitsOnly)}
              className={`w-full px-3 py-2 rounded-lg font-medium transition-colors ${
                showHitsOnly
                  ? 'bg-yellow-500 text-slate-900'
                  : 'bg-slate-900 text-slate-400 border border-slate-700 hover:border-yellow-500'
              }`}
            >
              {showHitsOnly ? '$ Hits Only' : 'Show All Picks'}
            </button>
          </div>

          {/* Show Trades Toggle */}
          <div>
            <label className="block text-slate-400 text-sm mb-2">Show Trade Notes</label>
            <button
              onClick={() => setShowTrades(!showTrades)}
              className={`w-full px-3 py-2 rounded-lg font-medium transition-colors ${
                showTrades
                  ? 'bg-brand-500 text-white'
                  : 'bg-slate-900 text-slate-400 border border-slate-700 hover:border-brand-500'
              }`}
            >
              {showTrades ? 'Trades Visible' : 'Trades Hidden'}
            </button>
          </div>
        </div>
      </div>

      {/* Draft Table */}
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h2 className="text-2xl font-display font-bold text-white mb-6">
          DRAFT PICKS
          {yearFilter !== 'ALL' && <span className="text-brand-500"> — {yearFilter}</span>}
          {roundFilter !== 'ALL' && <span className="text-brand-500"> — Round {roundFilter}</span>}
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm font-mono">
            <thead className="sticky top-0 bg-slate-800 z-10">
              <tr className="border-b-2 border-slate-700">
                {headers.map((header, index) => {
                  // Show all columns if "All Users", otherwise only show RD, #, Order, and selected user
                  const shouldShow = userFilter === 'ALL' || index < 3 || index === parseInt(userFilter);
                  if (!shouldShow) return null;

                  return (
                    <th key={index} className="text-left py-3 px-3 text-slate-400 font-bold whitespace-nowrap bg-slate-800">
                      {header}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {filteredRows.map(({ row, index: originalIndex }, displayIndex) => {
                const round = row[0];
                const isTradeRow = isTrade(row);
                const isMetadata = isMetadataRow(row);

                // Zebra striping (alternating colors for non-metadata rows)
                let rowClass = 'border-b border-slate-800/50 hover:bg-slate-700/30 transition-colors';

                if (isTradeRow) {
                  rowClass = 'border-b border-slate-700 bg-slate-900/50 italic text-slate-400';
                } else if (isMetadata) {
                  rowClass = 'border-b border-slate-700 bg-slate-900/30 text-slate-500 text-xs';
                } else if (displayIndex % 2 === 0) {
                  rowClass = 'border-b border-slate-800/50 bg-slate-850 hover:bg-slate-700/30 transition-colors';
                }

                return (
                  <tr key={originalIndex} className={rowClass}>
                    {row.map((cell, cellIndex) => {
                      // Show all columns if "All Users", otherwise only show RD, #, Order, and selected user
                      const shouldShow = userFilter === 'ALL' || cellIndex < 3 || cellIndex === parseInt(userFilter);
                      if (!shouldShow) return null;

                      return (
                        <td key={cellIndex} className="py-2 px-3 whitespace-nowrap">
                          {renderCell(cell, cellIndex, round)}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredRows.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <AlertCircle size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg">No picks found matching your filters</p>
              <p className="text-sm mt-2">Try adjusting your search criteria</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
