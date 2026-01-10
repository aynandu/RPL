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
        <div className="bg-slate-900 rounded-xl shadow-md overflow-hidden mb-6 border border-slate-800">
            <div className="bg-blue-600 p-3 text-white font-bold">
                Points Table
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-300">
                    <thead className="bg-slate-800 text-gray-400 uppercase text-xs">
                        <tr>
                            <th className="px-3 py-2">Team</th>
                            <th className="px-2 py-2 text-center">P</th>
                            <th className="px-2 py-2 text-center">W</th>
                            <th className="px-2 py-2 text-center">L</th>
                            <th className="px-2 py-2 text-center">T</th>
                            <th className="px-2 py-2 text-center">Pts</th>
                            <th className="px-2 py-2 text-right">NRR</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {sortedTable.map((team, idx) => (
                            <tr key={idx} className="hover:bg-slate-800 transition-colors">
                                <td className="px-3 py-2 font-medium text-gray-100">{team.team}</td>
                                <td className="px-2 py-2 text-center">{team.played}</td>
                                <td className="px-2 py-2 text-center">{team.won}</td>
                                <td className="px-2 py-2 text-center">{team.lost}</td>
                                <td className="px-2 py-2 text-center">{team.tied || 0}</td>
                                <td className="px-2 py-2 text-center font-bold text-white">{team.points}</td>
                                <td className="px-2 py-2 text-right">{team.nrr}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PointsTable;
