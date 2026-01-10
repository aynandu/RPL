import React from 'react';
import { useGame } from '../context/GameContext';

const PointsTable = () => {
    const { pointsTable } = useGame();

    // Sort teams: Primary by Points (Desc), Secondary by NRR (Desc)
    const sortedTable = [...pointsTable].sort((a, b) => {
        if (b.points !== a.points) {
            return b.points - a.points;
        }
        return b.nrr - a.nrr;
    });

    return (
        <div className="glass-card overflow-hidden mb-8 border border-white/10 shadow-2xl">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
                <h3 className="text-xl font-black text-white uppercase tracking-wider relative z-10 flex items-center gap-2">
                    <span className="text-yellow-400">🏆</span> Standings
                </h3>
            </div>
            <div className="overflow-x-auto bg-black/40">
                <table className="w-full text-sm text-left text-gray-300">
                    <thead className="bg-white/5 text-gray-400 uppercase text-xs font-bold tracking-wider">
                        <tr>
                            <th className="px-4 py-4">Team</th>
                            <th className="px-2 py-4 text-center">P</th>
                            <th className="px-2 py-4 text-center">W</th>
                            <th className="px-2 py-4 text-center">L</th>
                            <th className="px-2 py-4 text-center">T</th>
                            <th className="px-2 py-4 text-center text-yellow-400">Pts</th>
                            <th className="px-2 py-4 text-right">NRR</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {sortedTable.map((team, idx) => (
                            <tr key={idx} className={`group transition-all hover:bg-white/10 ${idx < 4 ? 'bg-gradient-to-r from-green-500/5 to-transparent' : ''}`}>
                                <td className="px-4 py-3 font-bold text-white flex items-center gap-3">
                                    <span className={`w-6 h-6 rounded flex items-center justify-center text-xs ${idx === 0 ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/50' :
                                        idx === 1 ? 'bg-gray-400 text-black' :
                                            idx === 2 ? 'bg-orange-700 text-white' : 'bg-slate-800 text-gray-400'
                                        }`}>{idx + 1}</span>
                                    <span className="group-hover:text-blue-300 transition-colors">{team.team}</span>
                                </td>
                                <td className="px-2 py-3 text-center opacity-70 cursor-default">{team.played}</td>
                                <td className="px-2 py-3 text-center text-green-400 font-medium cursor-default">{team.won}</td>
                                <td className="px-2 py-3 text-center text-red-400 font-medium cursor-default">{team.lost}</td>
                                <td className="px-2 py-3 text-center text-yellow-500/70 cursor-default">{team.tied || 0}</td>
                                <td className="px-2 py-3 text-center font-black text-white text-lg drop-shadow cursor-default">{team.points}</td>
                                <td className="px-2 py-3 text-right font-mono text-gray-400 cursor-default">{team.nrr}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PointsTable;
