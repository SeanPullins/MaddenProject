import React from 'react';
import { DRAFT_CSV } from '../constants';

export const Drafts: React.FC = () => {
  // Parse CSV data
  const lines = DRAFT_CSV.trim().split('\n');
  const headers = lines[0].split(',');
  const rows = lines.slice(1).map((line) => line.split(','));

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-4xl font-display font-bold text-white mb-8">DRAFT HISTORY</h1>

      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h2 className="text-2xl font-display font-bold text-white mb-6">ALL DRAFT PICKS</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                {headers.map((header, index) => (
                  <th
                    key={index}
                    className="text-left py-3 px-3 text-slate-400 font-medium whitespace-nowrap"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-b border-slate-800 hover:bg-slate-700/50">
                  {row.map((cell, cellIndex) => (
                    <td
                      key={cellIndex}
                      className="py-2 px-3 text-slate-300 whitespace-nowrap"
                    >
                      {cell || '-'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h3 className="text-xl font-display font-bold text-white mb-4">DRAFT STATS</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
            <p className="text-slate-400 text-sm mb-1">Total Rounds</p>
            <p className="text-2xl font-bold text-white">7</p>
          </div>
          <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
            <p className="text-slate-400 text-sm mb-1">Total Picks</p>
            <p className="text-2xl font-bold text-white">{rows.length}</p>
          </div>
          <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
            <p className="text-slate-400 text-sm mb-1">Teams</p>
            <p className="text-2xl font-bold text-white">5</p>
          </div>
        </div>
      </div>
    </div>
  );
};
