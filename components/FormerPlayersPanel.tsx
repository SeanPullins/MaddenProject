import React from 'react';
import { FormerPlayer } from '../types';
import { X, UserMinus } from 'lucide-react';

interface FormerPlayersPanelProps {
  teamName: string;
  formerPlayers: FormerPlayer[];
  onClose: () => void;
  teamColor?: string;
}

export const FormerPlayersPanel: React.FC<FormerPlayersPanelProps> = ({
  teamName,
  formerPlayers,
  onClose,
  teamColor = '#10b981' // Default brand color
}) => {
  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 z-40" onClick={onClose} />

      {/* Panel */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div
          className="bg-slate-900 rounded-lg shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden border-2"
          style={{ borderColor: teamColor }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className="p-6 relative"
            style={{ backgroundColor: teamColor }}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>

            <div className="flex items-center gap-3">
              <UserMinus size={32} className="text-white" />
              <div>
                <h2 className="text-2xl font-display font-bold text-white">
                  Former Players
                </h2>
                <p className="text-white/90 text-sm">{teamName}</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
            {formerPlayers.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <UserMinus size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-lg">No former players on record</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b-2 border-slate-700">
                    <tr>
                      <th className="text-left py-3 px-4 text-slate-400 font-bold">
                        Player(s)
                      </th>
                      <th className="text-left py-3 px-4 text-slate-400 font-bold">
                        Reason
                      </th>
                      <th className="text-left py-3 px-4 text-slate-400 font-bold">
                        Compensation
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {formerPlayers.map((formerPlayer, index) => (
                      <tr
                        key={index}
                        className={`border-b border-slate-800 hover:bg-slate-800/50 transition-colors ${
                          index % 2 === 0 ? 'bg-slate-850' : ''
                        }`}
                      >
                        <td className="py-3 px-4 text-white font-medium">
                          {formerPlayer.name}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                              formerPlayer.reason === 'FA'
                                ? 'bg-blue-500/20 text-blue-400'
                                : formerPlayer.reason === 'Cut'
                                ? 'bg-red-500/20 text-red-400'
                                : formerPlayer.reason === 'Trade'
                                ? 'bg-purple-500/20 text-purple-400'
                                : formerPlayer.reason === 'Retired'
                                ? 'bg-slate-500/20 text-slate-400'
                                : 'bg-slate-700 text-slate-300'
                            }`}
                          >
                            {formerPlayer.reason}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-300">
                          {formerPlayer.compensation || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Notes if any */}
            {formerPlayers.some((fp) => fp.notes) && (
              <div className="mt-6 p-4 bg-slate-800 rounded-lg border border-slate-700">
                <h3 className="text-sm font-bold text-slate-400 mb-2">NOTES</h3>
                <div className="space-y-1">
                  {formerPlayers
                    .filter((fp) => fp.notes)
                    .map((fp, index) => (
                      <p key={index} className="text-sm text-slate-300">
                        <span className="font-medium text-white">{fp.name}:</span>{' '}
                        {fp.notes}
                      </p>
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
