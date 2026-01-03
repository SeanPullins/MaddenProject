import React from 'react';
import { HIT_RATES_CSV } from '../constants';

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

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-4xl font-display font-bold text-white mb-8">HIT RATES ANALYSIS</h1>

      <div className="space-y-6">
        {sections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h2 className="text-2xl font-display font-bold text-white mb-4">
              {section.title || `Section ${sectionIndex + 1}`}
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <tbody>
                  {section.data.map((row, rowIndex) => (
                    <tr
                      key={rowIndex}
                      className={rowIndex === 0 ? 'border-b-2 border-slate-700' : 'border-b border-slate-800'}
                    >
                      {row.map((cell, cellIndex) => (
                        <td
                          key={cellIndex}
                          className={`py-2 px-3 ${
                            rowIndex === 0
                              ? 'text-slate-400 font-medium'
                              : cellIndex === 0
                              ? 'text-white font-medium'
                              : 'text-slate-300'
                          }`}
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
        ))}
      </div>

      <div className="mt-6 bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h3 className="text-xl font-display font-bold text-white mb-4">ABOUT HIT RATES</h3>
        <p className="text-slate-300">
          Hit rates measure the success rate of draft picks by round and team. A "hit" is typically
          defined as a player who becomes a valuable contributor to the franchise. Higher
          percentages indicate better drafting efficiency.
        </p>
      </div>
    </div>
  );
};
