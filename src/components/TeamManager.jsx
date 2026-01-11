import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Users, Plus, Trash2, Edit2, Save, X } from 'lucide-react';
import PlayerManager from './PlayerManager';

const TeamManager = () => {
    const { pointsTable, updatePointsTable } = useGame();
    const [isAdding, setIsAdding] = useState(false);
    const [newTeamName, setNewTeamName] = useState('');
    const [editingIndex, setEditingIndex] = useState(null);
    const [editName, setEditName] = useState('');

    // Handlers
    const handleAddTeam = (e) => {
        e.preventDefault();
        if (!newTeamName.trim()) return;

        const newTeam = {
            team: newTeamName,
            played: 0,
            won: 0,
            lost: 0,
            tied: 0,
            points: 0,
            nrr: 0
        };

        updatePointsTable([...pointsTable, newTeam]);
        setNewTeamName('');
        setIsAdding(false);
    };

    const handleDelete = (index) => {
        if (window.confirm("Are you sure? This will remove the team from the Points Table and future matches.")) {
            const updated = pointsTable.filter((_, i) => i !== index);
            updatePointsTable(updated);
        }
    };

    const startEdit = (index, currentName) => {
        setEditingIndex(index);
        setEditName(currentName);
    };

    const saveEdit = (index) => {
        if (!editName.trim()) return;
        const updated = [...pointsTable];
        updated[index] = { ...updated[index], team: editName };
        updatePointsTable(updated);
        setEditingIndex(null);
    };

    const [selectedTeam, setSelectedTeam] = useState(null);

    return (
        <div className="glass-card p-6 mb-8 border-l-4 border-l-blue-500">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <span className="w-2 h-8 bg-blue-500 rounded-full inline-block"></span>
                    Manage Teams
                </h2>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="bg-blue-600 hover:bg-blue-500 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg hover:shadow-blue-500/20 transition-all font-semibold"
                    title="Add New Team"
                >
                    <Plus size={20} />
                </button>
            </div>

            {/* Add Team Form */}
            {isAdding && (
                <form onSubmit={handleAddTeam} className="mb-6 bg-white/5 p-4 rounded-xl border border-white/10 flex gap-4 backdrop-blur-sm animate-fade-in-down items-center">
                    <input
                        type="text"
                        value={newTeamName}
                        onChange={(e) => setNewTeamName(e.target.value)}
                        placeholder="Enter Team Name"
                        className="flex-1 glass-input p-3 rounded-xl"
                        autoFocus
                    />
                    <div className="flex gap-2">
                        <button
                            type="submit"
                            className="bg-emerald-500 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 transition-all"
                            title="Save"
                        >
                            <Save size={20} />
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsAdding(false)}
                            className="bg-white/10 text-gray-400 hover:text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-red-500/20 transition-colors"
                            title="Cancel"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </form>
            )}

            {/* Team List */}
            <div className="space-y-3">
                {pointsTable.map((team, idx) => (
                    <div
                        key={idx}
                        className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5 hover:border-blue-500/30 hover:bg-white/[0.07] transition-all group cursor-pointer"
                        onClick={(e) => {
                            if (!e.target.closest('button') && !e.target.closest('input')) {
                                setSelectedTeam(team.team);
                            }
                        }}
                    >
                        {editingIndex === idx ? (
                            <div className="flex gap-2 flex-1 items-center">
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="flex-1 glass-input p-2 rounded-lg"
                                    autoFocus
                                />
                                <button onClick={() => saveEdit(idx)} className="text-green-400 hover:bg-green-500/20 p-2 rounded-full transition-colors"><Save size={20} /></button>
                                <button onClick={() => setEditingIndex(null)} className="text-gray-400 hover:bg-red-500/20 hover:text-red-400 p-2 rounded-full transition-colors"><X size={20} /></button>
                            </div>
                        ) : (
                            <>
                                <span className="font-semibold text-gray-200 group-hover:text-white transition-colors pl-2">{team.team}</span>
                                <div className="flex gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => startEdit(idx, team.team)} className="text-blue-400 hover:bg-blue-500/20 p-2 rounded-full transition-all" title="Rename">
                                        <Edit2 size={18} />
                                    </button>
                                    <button onClick={() => handleDelete(idx)} className="text-red-400 hover:bg-red-500/20 p-2 rounded-full transition-all" title="Delete">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                ))}
                {pointsTable.length === 0 && (
                    <div className="text-center text-gray-500 py-8">No teams found. Add one above!</div>
                )}
            </div>

            {selectedTeam && (
                <PlayerManager
                    teamName={selectedTeam}
                    onClose={() => setSelectedTeam(null)}
                />
            )}
        </div>
    );
};

export default TeamManager;
