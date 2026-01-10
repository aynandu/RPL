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
        <div className="glass-card p-6 border-l-4 border-l-orange-500 h-full">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <span className="w-2 h-8 bg-orange-500 rounded-full inline-block"></span>
                    Manage Points Table
                </h2>
                {isDirty && (
                    <button
                        onClick={handleSave}
                        className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-5 py-2.5 rounded-full flex items-center gap-2 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all font-bold animate-pulse"
                    >
                        <Save size={18} /> Save Changes
                    </button>
                )}
                {!isDirty && (
                    <button
                        onClick={handleAddTeam}
                        className="bg-white/10 text-gray-300 px-5 py-2.5 rounded-full flex items-center gap-2 hover:bg-white/20 transition-all font-semibold"
                    >
                        <Plus size={18} /> Add Team
                    </button>
                )}
            </div>

            <div className="overflow-x-auto rounded-xl border border-white/5">
                <table className="w-full text-sm text-center">
                    <thead className="bg-white/5 text-gray-300 uppercase text-xs tracking-wider font-bold">
                        <tr>
                            <th className="px-4 py-3 text-left">Team</th>
                            <th className="px-2 py-3 text-purple-300">P</th>
                            <th className="px-2 py-3 text-green-400">W</th>
                            <th className="px-2 py-3 text-red-400">L</th>
                            <th className="px-2 py-3 text-yellow-400">T</th>
                            <th className="px-2 py-3 text-blue-300">NRR</th>
                            <th className="px-2 py-3 text-orange-400">Pts</th>
                            <th className="px-2 py-3"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {localTable.map((team, idx) => (
                            <tr key={idx} className="hover:bg-white/[0.03] transition-colors group">
                                <td className="px-3 py-2 text-left">
                                    <input
                                        type="text"
                                        value={team.team}
                                        onChange={(e) => handleChange(idx, 'team', e.target.value)}
                                        className="w-full bg-transparent border-b border-transparent focus:border-blue-500 text-white p-1 outline-none font-medium min-w-[150px] transition-colors"
                                    />
                                </td>
                                <td className="px-1 py-1">
                                    <input
                                        type="number"
                                        value={team.played}
                                        onChange={(e) => handleChange(idx, 'played', Number(e.target.value))}
                                        className="w-12 bg-transparent text-center text-gray-400 focus:text-white p-1 outline-none"
                                    />
                                </td>
                                <td className="px-1 py-1">
                                    <input
                                        type="number"
                                        value={team.won}
                                        onChange={(e) => handleChange(idx, 'won', Number(e.target.value))}
                                        className="w-12 bg-transparent text-center text-gray-400 focus:text-green-400 font-bold p-1 outline-none"
                                    />
                                </td>
                                <td className="px-1 py-1">
                                    <input
                                        type="number"
                                        value={team.lost}
                                        onChange={(e) => handleChange(idx, 'lost', Number(e.target.value))}
                                        className="w-12 bg-transparent text-center text-gray-400 focus:text-red-400 font-bold p-1 outline-none"
                                    />
                                </td>
                                <td className="px-1 py-1">
                                    <input
                                        type="number"
                                        value={team.tied || 0}
                                        onChange={(e) => handleChange(idx, 'tied', Number(e.target.value))}
                                        className="w-12 bg-transparent text-center text-gray-400 focus:text-yellow-400 p-1 outline-none"
                                    />
                                </td>
                                <td className="px-1 py-1">
                                    <input
                                        type="number"
                                        step="0.001"
                                        value={team.nrr}
                                        onChange={(e) => handleChange(idx, 'nrr', e.target.value)}
                                        className="w-16 bg-transparent text-center text-gray-400 focus:text-blue-300 p-1 outline-none"
                                    />
                                </td>
                                <td className="px-2 py-2 font-black text-orange-400 text-lg">
                                    {team.points}
                                </td>
                                <td className="px-2 py-2">
                                    <button
                                        onClick={() => handleDeleteTeam(idx)}
                                        className="text-gray-600 hover:text-red-400 p-2 rounded-full hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
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
