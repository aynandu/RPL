import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { Save, RefreshCw, Plus, Trash2 } from 'lucide-react';

const PointsTableEditor = () => {
    const { pointsTable, updatePointsTable } = useGame();
    const [localTable, setLocalTable] = useState(pointsTable);
    const [isDirty, setIsDirty] = useState(false);

    useEffect(() => {
        setLocalTable(pointsTable);
    }, [pointsTable]);

    const handleChange = (index, field, value) => {
        const updated = [...localTable];
        updated[index] = { ...updated[index], [field]: value };

        // Auto calculate Points: (Won * 2) + Tied
        if (field === 'won' || field === 'tied') {
            const won = field === 'won' ? Number(value) : Number(updated[index].won);
            const tied = field === 'tied' ? Number(value) : Number(updated[index].tied || 0);
            updated[index].points = (won * 2) + tied;
        }

        setLocalTable(updated);
        setIsDirty(true);
    };

    const handleSave = () => {
        updatePointsTable(localTable);
        setIsDirty(false);
    };

    const handleAddTeam = () => {
        const teamName = prompt("Enter new team name:");
        if (!teamName) return;

        const newTeam = {
            team: teamName,
            played: 0,
            won: 0,
            lost: 0,
            tied: 0,
            points: 0,
            nrr: 0
        };
        setLocalTable([...localTable, newTeam]);
        setIsDirty(true);
    };

    const handleDeleteTeam = (index) => {
        if (window.confirm("Are you sure you want to delete this team?")) {
            const updated = localTable.filter((_, i) => i !== index);
            setLocalTable(updated);
            setIsDirty(true);
        }
    };

    return (
        <div className="bg-slate-900 p-6 rounded-lg shadow-md border border-slate-800 mb-8">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">Manage Points Table</h2>
                {isDirty && (
                    <button
                        onClick={handleSave}
                        className="bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-green-700 transition-colors"
                    >
                        <Save size={16} /> Save Changes
                    </button>
                )}
                {!isDirty && (
                    <button
                        onClick={handleAddTeam}
                        className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-700 transition-colors"
                    >
                        <Plus size={16} /> Add Team
                    </button>
                )}
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-center">
                    <thead className="bg-slate-800 text-gray-400 uppercase text-xs">
                        <tr>
                            <th className="px-3 py-2 text-left">Team</th>
                            <th className="px-2 py-2">P</th>
                            <th className="px-2 py-2">W</th>
                            <th className="px-2 py-2">L</th>
                            <th className="px-2 py-2">T</th>
                            <th className="px-2 py-2">NRR</th>
                            <th className="px-2 py-2">Pts (Calc)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {localTable.map((team, idx) => (
                            <tr key={idx} className="hover:bg-slate-800/50">
                                <td className="px-3 py-2 text-left font-medium text-gray-200">{team.team}</td>
                                <td className="px-1 py-1">
                                    <input
                                        type="number"
                                        value={team.played}
                                        onChange={(e) => handleChange(idx, 'played', Number(e.target.value))}
                                        className="w-12 bg-slate-800 border border-slate-600 rounded text-center text-white p-1 focus:border-blue-500 outline-none"
                                    />
                                </td>
                                <td className="px-1 py-1">
                                    <input
                                        type="number"
                                        value={team.won}
                                        onChange={(e) => handleChange(idx, 'won', Number(e.target.value))}
                                        className="w-12 bg-slate-800 border border-slate-600 rounded text-center text-white p-1 focus:border-blue-500 outline-none"
                                    />
                                </td>
                                <td className="px-1 py-1">
                                    <input
                                        type="number"
                                        value={team.lost}
                                        onChange={(e) => handleChange(idx, 'lost', Number(e.target.value))}
                                        className="w-12 bg-slate-800 border border-slate-600 rounded text-center text-white p-1 focus:border-blue-500 outline-none"
                                    />
                                </td>
                                <td className="px-1 py-1">
                                    <input
                                        type="number"
                                        value={team.tied || 0}
                                        onChange={(e) => handleChange(idx, 'tied', Number(e.target.value))}
                                        className="w-12 bg-slate-800 border border-slate-600 rounded text-center text-white p-1 focus:border-blue-500 outline-none"
                                    />
                                </td>
                                <td className="px-1 py-1">
                                    <input
                                        type="number"
                                        step="0.001"
                                        value={team.nrr}
                                        onChange={(e) => handleChange(idx, 'nrr', e.target.value)}
                                        className="w-16 bg-slate-800 border border-slate-600 rounded text-center text-white p-1 focus:border-blue-500 outline-none"
                                    />
                                </td>
                                <td className="px-2 py-2 font-bold text-blue-400">
                                    {team.points}
                                </td>
                                <td className="px-2 py-2">
                                    <button
                                        onClick={() => handleDeleteTeam(idx)}
                                        className="text-red-500 hover:text-red-400 p-1 rounded hover:bg-red-500/10 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PointsTableEditor;
