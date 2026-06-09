import React, { useMemo, useRef, useState } from 'react';
import {
  Sliders, Search, Plus, Trash2, RotateCcw, Download, Upload,
  AlertTriangle, Minus, Undo2, CheckCircle2,
} from 'lucide-react';
import { POSITIONS, NFL_TEAMS } from '../constants';
import { Player } from '../types';
import { TeamLogo } from '../components/TeamLogo';
import {
  useTeams, useOverrides, updatePlayer, revertPlayer, addPlayer,
  removePlayer, resetTeam, resetAll, exportOverrides, importOverrides,
  pendingChangeCount,
} from '../utils/rosterStore';

const ovrColor = (ovr: number) =>
  ovr >= 90 ? 'text-yellow-400' : ovr >= 80 ? 'text-green-400' : ovr >= 70 ? 'text-blue-400' : ovr > 0 ? 'text-slate-300' : 'text-red-400';

export const ControlPanel: React.FC = () => {
  const teams = useTeams();
  const overrides = useOverrides();
  const [teamId, setTeamId] = useState(teams[0]?.id ?? '');
  const [search, setSearch] = useState('');
  const [posFilter, setPosFilter] = useState('ALL');
  const [showAdd, setShowAdd] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [newPlayer, setNewPlayer] = useState({ name: '', position: 'QB', team: 'ARI', ovr: 70, depthOrder: 2 });
  const fileRef = useRef<HTMLInputElement>(null);

  const team = teams.find((t) => t.id === teamId) ?? teams[0];

  const flash = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const roster = useMemo(() => {
    const q = search.toLowerCase();
    return [...(team?.roster ?? [])]
      .filter((p) => (posFilter === 'ALL' || p.position === posFilter) && p.name.toLowerCase().includes(q))
      .sort((a, b) => a.position.localeCompare(b.position) || (a.depthOrder ?? 99) - (b.depthOrder ?? 99) || b.ovr - a.ovr);
  }, [team, search, posFilter]);

  const missingOvr = useMemo(
    () => teams.flatMap((t) => t.roster.filter((p) => !p.ovr)).length,
    [teams]
  );

  const bumpOvr = (p: Player, delta: number) =>
    updatePlayer(p.id, { ovr: Math.min(99, Math.max(0, p.ovr + delta)) });

  const handleExport = () => {
    const blob = new Blob([exportOverrides()], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `fanleague-roster-updates-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    flash('Updates exported');
  };

  const handleImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const ok = importOverrides(String(reader.result));
      flash(ok ? 'Updates imported' : 'Import failed — invalid file');
    };
    reader.readAsText(file);
  };

  const handleAdd = () => {
    if (!newPlayer.name.trim() || !team) return;
    addPlayer(team.id, {
      name: newPlayer.name.trim(),
      position: newPlayer.position,
      team: newPlayer.team,
      ovr: newPlayer.ovr,
      depthOrder: newPlayer.depthOrder,
      status: 'ACTIVE',
      draftRound: 'CP',
      faYear: '',
      projectedPoints: Math.floor(newPlayer.ovr / 5),
    });
    setNewPlayer({ ...newPlayer, name: '' });
    setShowAdd(false);
    flash(`${newPlayer.name.trim()} added`);
  };

  if (!team) return null;
  const changes = pendingChangeCount();

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto pb-24 lg:pb-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
        <h1 className="text-3xl md:text-4xl font-display font-bold text-white flex items-center gap-3">
          <Sliders className="text-brand-500" size={30} /> CONTROL PANEL
        </h1>
        <div className="flex items-center gap-2">
          <button onClick={handleExport} className="flex items-center gap-1.5 px-3 py-2 text-sm bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700">
            <Download size={15} /> Export
          </button>
          <button onClick={() => fileRef.current?.click()} className="flex items-center gap-1.5 px-3 py-2 text-sm bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700">
            <Upload size={15} /> Import
          </button>
          <input ref={fileRef} type="file" accept=".json" className="hidden"
            onChange={(e) => e.target.files?.[0] && handleImport(e.target.files[0])} />
          {changes > 0 && (
            <button onClick={() => window.confirm('Discard ALL roster updates and restore the original data?') && resetAll()}
              className="flex items-center gap-1.5 px-3 py-2 text-sm bg-red-900/40 hover:bg-red-900/70 text-red-300 rounded-lg border border-red-800">
              <RotateCcw size={15} /> Reset All
            </button>
          )}
        </div>
      </div>
      <p className="text-slate-400 text-sm mb-4">
        Update Madden ratings here after each roster update — changes save automatically and flow straight into Standings, League Scores, Players, and Comparisons.
        {changes > 0 && <span className="ml-2 text-brand-500 font-semibold">{changes} saved change{changes !== 1 && 's'}</span>}
      </p>

      {missingOvr > 0 && (
        <div className="flex items-center gap-2 bg-amber-900/30 border border-amber-700/50 text-amber-300 text-sm rounded-lg px-4 py-2.5 mb-4">
          <AlertTriangle size={16} />
          {missingOvr} player{missingOvr !== 1 && 's'} across the league still have a 0 OVR — find them with the team tabs below and set their rating.
        </div>
      )}

      {/* Team tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
        {teams.map((t) => (
          <button key={t.id} onClick={() => setTeamId(t.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border whitespace-nowrap text-sm transition-colors ${
              t.id === team.id ? 'bg-brand-500/20 border-brand-500 text-white' : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
            }`}>
            <TeamLogo src={t.avatarUrl} alt={t.name} size="sm" />
            <span className="font-semibold">{t.name}</span>
            <span className="text-slate-500 text-xs">({t.owner})</span>
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={`Search ${team.name} roster...`}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500" />
        </div>
        <select value={posFilter} onChange={(e) => setPosFilter(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white">
          <option value="ALL">All Positions</option>
          {POSITIONS.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <button onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-1.5 px-3 py-2 text-sm bg-brand-500 hover:bg-brand-600 text-white rounded-lg font-semibold">
          <Plus size={15} /> Add Player
        </button>
        <button onClick={() => window.confirm(`Reset all updates for ${team.name}?`) && resetTeam(team.id)}
          className="flex items-center gap-1.5 px-3 py-2 text-sm bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700">
          <RotateCcw size={15} /> Reset Team
        </button>
      </div>

      {/* Add player form */}
      {showAdd && (
        <div className="bg-slate-800/70 border border-slate-700 rounded-lg p-4 mb-4 grid grid-cols-2 md:grid-cols-6 gap-3 items-end">
          <div className="col-span-2">
            <label className="text-xs text-slate-400 block mb-1">Player Name</label>
            <input value={newPlayer.name} onChange={(e) => setNewPlayer({ ...newPlayer, name: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()} autoFocus
              className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-white" placeholder="e.g. Spencer Fano" />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">Position</label>
            <select value={newPlayer.position} onChange={(e) => setNewPlayer({ ...newPlayer, position: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-2 text-sm text-white">
              {POSITIONS.map((p) => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">NFL Team</label>
            <select value={newPlayer.team} onChange={(e) => setNewPlayer({ ...newPlayer, team: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-2 text-sm text-white">
              {NFL_TEAMS.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">OVR</label>
            <input type="number" min={0} max={99} value={newPlayer.ovr}
              onChange={(e) => setNewPlayer({ ...newPlayer, ovr: Number(e.target.value) })}
              className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-white" />
          </div>
          <button onClick={handleAdd} disabled={!newPlayer.name.trim()}
            className="px-3 py-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-40 text-white rounded text-sm font-semibold">
            Add to Roster
          </button>
        </div>
      )}

      {/* Roster table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400 text-xs uppercase tracking-wide border-b border-slate-800 bg-slate-900">
                <th className="px-4 py-3">Player</th>
                <th className="px-3 py-3">Pos</th>
                <th className="px-3 py-3">NFL</th>
                <th className="px-3 py-3 text-center">OVR</th>
                <th className="px-3 py-3">Depth</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {roster.map((p) => {
                const edited = !!overrides.patches[p.id];
                const added = p.id.startsWith('cp-');
                return (
                  <tr key={p.id} className={`border-b border-slate-800/60 hover:bg-slate-800/40 ${edited ? 'bg-brand-500/5' : ''}`}>
                    <td className="px-4 py-2.5">
                      <span className="text-white font-medium">{p.name}</span>
                      {edited && <span className="ml-2 text-[10px] uppercase bg-brand-500/20 text-brand-500 px-1.5 py-0.5 rounded">edited</span>}
                      {added && <span className="ml-2 text-[10px] uppercase bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded">new</span>}
                      {!p.ovr && <span className="ml-2 text-[10px] uppercase bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded">no ovr</span>}
                    </td>
                    <td className="px-3 py-2.5">
                      <select value={p.position} onChange={(e) => updatePlayer(p.id, { position: e.target.value })}
                        className="bg-slate-800 border border-slate-700 rounded px-1.5 py-1 text-xs text-slate-200">
                        {[...new Set([...POSITIONS, 'OT', 'OG', 'C', p.position])].map((pos) => <option key={pos}>{pos}</option>)}
                      </select>
                    </td>
                    <td className="px-3 py-2.5">
                      <select value={p.team} onChange={(e) => updatePlayer(p.id, { team: e.target.value })}
                        className="bg-slate-800 border border-slate-700 rounded px-1.5 py-1 text-xs text-slate-200">
                        {[...new Set([...NFL_TEAMS, p.team])].map((t) => <option key={t}>{t}</option>)}
                      </select>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => bumpOvr(p, -1)} className="p-1 text-slate-500 hover:text-white hover:bg-slate-700 rounded"><Minus size={13} /></button>
                        <input type="number" min={0} max={99} value={p.ovr}
                          onChange={(e) => updatePlayer(p.id, { ovr: Math.min(99, Math.max(0, Number(e.target.value) || 0)) })}
                          className={`w-14 text-center bg-slate-800 border border-slate-700 rounded py-1 font-bold ${ovrColor(p.ovr)} focus:border-brand-500 focus:outline-none`} />
                        <button onClick={() => bumpOvr(p, 1)} className="p-1 text-slate-500 hover:text-white hover:bg-slate-700 rounded"><Plus size={13} /></button>
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <select value={p.depthOrder ?? 99} onChange={(e) => updatePlayer(p.id, { depthOrder: Number(e.target.value) })}
                        className="bg-slate-800 border border-slate-700 rounded px-1.5 py-1 text-xs text-slate-200">
                        {[1, 2, 3, 4, 5, 6].map((d) => <option key={d} value={d}>{d === 1 ? 'Starter' : `Depth ${d}`}</option>)}
                      </select>
                    </td>
                    <td className="px-3 py-2.5">
                      <select value={p.status ?? 'ACTIVE'} onChange={(e) => updatePlayer(p.id, { status: e.target.value as Player['status'] })}
                        className="bg-slate-800 border border-slate-700 rounded px-1.5 py-1 text-xs text-slate-200">
                        <option value="ACTIVE">Active</option>
                        <option value="PRACTICE_SQUAD">Practice Squad</option>
                      </select>
                    </td>
                    <td className="px-3 py-2.5 text-right whitespace-nowrap">
                      {edited && (
                        <button onClick={() => revertPlayer(p.id)} title="Revert edits"
                          className="p-1.5 text-slate-500 hover:text-amber-400 hover:bg-slate-700 rounded mr-1"><Undo2 size={15} /></button>
                      )}
                      <button onClick={() => window.confirm(`Remove ${p.name} from ${team.name}?`) && removePlayer(p.id)}
                        title="Remove player" className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-700 rounded"><Trash2 size={15} /></button>
                    </td>
                  </tr>
                );
              })}
              {roster.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500">No players match your filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-20 lg:bottom-6 right-6 flex items-center gap-2 bg-slate-800 border border-brand-500/50 text-white text-sm px-4 py-3 rounded-lg shadow-xl z-50">
          <CheckCircle2 size={16} className="text-brand-500" /> {toast}
        </div>
      )}
    </div>
  );
};
