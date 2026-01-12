import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { X, Save, Plus, Trash2, Edit2 } from 'lucide-react';

const PlayerManager = ({ teamName, onClose, readOnly = false }) => {
    const { players, addPlayer, updatePlayer, deletePlayer } = useGame();
    const teamPlayers = players.filter(p => p.team === teamName);

    // State for creating/editing
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({});
    const [isAdding, setIsAdding] = useState(false);

    const initialFormState = {
        name: "",
        matches: 0,
        runs: 0,
        balls: 0,
        fours: 0,
        sixes: 0,
        fifties: 0,
        hundreds: 0,
        overs: 0,
        maidens: 0,
        runsConceded: 0,
        wickets: 0,
        highestScore: 0,
        isCaptain: false,
        isViceCaptain: false
    };

    const handleStartAdd = () => {
        if (readOnly) return;
        setFormData(initialFormState);
        setIsAdding(true);
        setEditingId(null);
    };

    const handleStartEdit = (player) => {
        if (readOnly) return;
        setFormData({ ...player });
        setEditingId(player.id);
        setIsAdding(false);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : (name === 'name' ? value : Number(value))
        }));
    };

    const handleRoleChange = (role) => {
        // Enforce mutual exclusivity
        if (role === 'isCaptain') {
            setFormData(prev => ({ ...prev, isCaptain: !prev.isCaptain, isViceCaptain: false }));
        } else if (role === 'isViceCaptain') {
            setFormData(prev => ({ ...prev, isViceCaptain: !prev.isViceCaptain, isCaptain: false }));
        }
    };

    // Calculate current roles in the team (excluding the player currently being edited)
    const currentCaptain = teamPlayers.find(p => p.isCaptain && p.id !== editingId);
    const currentViceCaptain = teamPlayers.find(p => p.isViceCaptain && p.id !== editingId);

    const handleSave = (e) => {
        e.preventDefault();
        if (!formData.name) return;

        if (isAdding) {
            addPlayer({ ...formData, team: teamName });
        } else {
            updatePlayer(editingId, formData);
        }

        setIsAdding(false);
        setEditingId(null);
        setFormData({});
    };

    const handleDelete = (id) => {
        if (readOnly) return;
        if (window.confirm("Delete this player?")) {
            deletePlayer(id);
        }
    };

    // Calculation Helpers
    const calculateAverage = (runs, matches) => {
        // Simple average: runs / matches (could be modified for dismissal based if data exists)
        if (!matches) return 0;
        return (runs / matches).toFixed(2);
    };

    const calculateStrikeRate = (runs, balls) => {
        if (!balls) return 0;
        return ((runs / balls) * 100).toFixed(2);
    };

    const calculateEconomy = (runsConceded, overs) => {
        if (!overs) return 0;
        return (runsConceded / overs).toFixed(2);
    };

    const hasBattingStats = (p) => {
        return p.runs > 0 || p.balls > 0 || p.fours > 0 || p.sixes > 0 || p.fifties > 0 || p.hundreds > 0;
    };

    const hasBowlingStats = (p) => {
        return p.overs > 0 || p.maidens > 0 || p.runsConceded > 0 || p.wickets > 0;
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex justify-center items-center z-50 p-4 animate-fade-in">
            <div className="glass-card w-full max-w-7xl h-[85vh] flex flex-col shadow-2xl animate-fade-in-up border border-white/10 relative overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5 backdrop-blur-md z-10">
                    <div>
                        <h2 className="text-3xl font-black text-white flex items-center gap-3">
                            <span className="w-2 h-10 bg-gradient-to-b from-blue-400 to-indigo-600 rounded-full inline-block"></span>
                            {teamName}
                            <span className="text-lg font-normal text-gray-400 ml-2 border-l border-white/10 pl-3">Squad Management</span>
                        </h2>
                        <div className="text-gray-400 text-sm mt-1 ml-5">
                            Total Players: <span className="text-white font-bold">{teamPlayers.length}</span>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        {!readOnly && !isAdding && !editingId && (
                            <button
                                onClick={handleStartAdd}
                                className="bg-blue-600 hover:bg-blue-500 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg hover:shadow-blue-500/20 transition-all font-semibold"
                                title="Add Player"
                            >
                                <Plus size={20} />
                            </button>
                        )}
                        <button onClick={onClose} className="bg-white/10 hover:bg-white/20 text-white w-10 h-10 rounded-full flex items-center justify-center transition-colors" title="Close">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto bg-black/20 p-6 custom-scrollbar">

                    {/* READ ONLY VIEW: Player Cards */}
                    {readOnly ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {teamPlayers.length === 0 ? (
                                <div className="col-span-full py-20 text-center text-gray-500">
                                    No players in squad.
                                </div>
                            ) : (
                                teamPlayers.map(player => {
                                    const showBatting = hasBattingStats(player) || (!hasBattingStats(player) && !hasBowlingStats(player));
                                    const showBowling = hasBowlingStats(player);

                                    return (
                                        <div key={player.id} className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-colors shadow-lg">



                                            <div className="flex justify-between items-start mb-4 border-b border-white/10 pb-3">
                                                <div>
                                                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                                        {player.name}
                                                        {player.isCaptain && <span className="bg-yellow-500/20 text-yellow-400 text-[10px] px-1.5 py-0.5 rounded border border-yellow-500/30">C</span>}
                                                        {player.isViceCaptain && <span className="bg-blue-500/20 text-blue-400 text-[10px] px-1.5 py-0.5 rounded border border-blue-500/30">VC</span>}
                                                    </h3>
                                                    <span className="text-xs uppercase font-bold text-gray-500">Matches: <span className="text-gray-300">{player.matches}</span></span>
                                                    {showBatting && <span className="text-xs uppercase font-bold text-gray-500 ml-3">Highest: <span className="text-yellow-400">{player.highestScore || 0}</span></span>}
                                                </div>
                                                <div className="flex gap-1">
                                                    {showBatting && <span className="bg-blue-500/20 text-blue-300 text-[10px] uppercase font-bold px-2 py-1 rounded">Bat</span>}
                                                    {showBowling && <span className="bg-green-500/20 text-green-300 text-[10px] uppercase font-bold px-2 py-1 rounded">Bowl</span>}
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                {/* Batting Stats Section */}
                                                {showBatting && (
                                                    <div>
                                                        <div className="text-xs font-bold text-gray-500 uppercase mb-2 flex items-center gap-2">
                                                            <div className="w-1 h-1 bg-blue-500 rounded-full"></div> Batting
                                                        </div>
                                                        <div className="grid grid-cols-4 gap-2 text-center bg-black/20 rounded-lg p-3">
                                                            <div>
                                                                <div className="text-[10px] text-gray-500 uppercase">Runs</div>
                                                                <div className="text-lg font-bold text-yellow-400">{player.runs}</div>
                                                            </div>
                                                            <div>
                                                                <div className="text-[10px] text-gray-500 uppercase">Balls</div>
                                                                <div className="text-sm font-medium text-gray-300">{player.balls}</div>
                                                            </div>
                                                            <div>
                                                                <div className="text-[10px] text-gray-500 uppercase">Avg</div>
                                                                <div className="text-sm font-medium text-gray-300">{calculateAverage(player.runs, player.matches)}</div>
                                                            </div>
                                                            <div>
                                                                <div className="text-[10px] text-gray-500 uppercase">SR</div>
                                                                <div className="text-sm font-medium text-gray-300">{calculateStrikeRate(player.runs, player.balls)}</div>
                                                            </div>
                                                            <div className="col-span-4 grid grid-cols-4 gap-2 pt-2 border-t border-white/5 mt-2">
                                                                <div>
                                                                    <div className="text-[10px] text-gray-500 uppercase">4s</div>
                                                                    <div className="text-xs text-gray-300">{player.fours}</div>
                                                                </div>
                                                                <div>
                                                                    <div className="text-[10px] text-gray-500 uppercase">6s</div>
                                                                    <div className="text-xs text-gray-300">{player.sixes}</div>
                                                                </div>
                                                                <div>
                                                                    <div className="text-[10px] text-gray-500 uppercase">50s</div>
                                                                    <div className="text-xs text-gray-300">{player.fifties}</div>
                                                                </div>
                                                                <div>
                                                                    <div className="text-[10px] text-gray-500 uppercase">100s</div>
                                                                    <div className="text-xs text-gray-300">{player.hundreds}</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Bowling Stats Section */}
                                                {showBowling && (
                                                    <div>
                                                        <div className="text-xs font-bold text-gray-500 uppercase mb-2 flex items-center gap-2">
                                                            <div className="w-1 h-1 bg-green-500 rounded-full"></div> Bowling
                                                        </div>
                                                        <div className="grid grid-cols-5 gap-2 text-center bg-black/20 rounded-lg p-3">
                                                            <div>
                                                                <div className="text-[10px] text-gray-500 uppercase">Ov</div>
                                                                <div className="text-sm font-medium text-gray-300">{player.overs || 0}</div>
                                                            </div>
                                                            <div>
                                                                <div className="text-[10px] text-gray-500 uppercase">Mdn</div>
                                                                <div className="text-sm font-medium text-gray-300">{player.maidens || 0}</div>
                                                            </div>
                                                            <div>
                                                                <div className="text-[10px] text-gray-500 uppercase">Run</div>
                                                                <div className="text-sm font-medium text-gray-300">{player.runsConceded || 0}</div>
                                                            </div>
                                                            <div>
                                                                <div className="text-[10px] text-gray-500 uppercase">Wkt</div>
                                                                <div className="text-lg font-bold text-yellow-400">{player.wickets || 0}</div>
                                                            </div>
                                                            <div>
                                                                <div className="text-[10px] text-gray-500 uppercase">Eco</div>
                                                                <div className="text-sm font-medium text-green-300">{calculateEconomy(player.runsConceded, player.overs)}</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    ) : (
                        /* EDIT MODE: Table View */
                        <>
                            {/* Edit/Add Form */}
                            {(isAdding || editingId) && (
                                <div className="mb-8 animate-fade-in-down">
                                    <form onSubmit={handleSave} className="bg-white/5 border border-white/10 p-6 rounded-2xl shadow-xl">
                                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                            {isAdding ? <Plus size={20} className="text-green-400" /> : <Edit2 size={20} className="text-blue-400" />}
                                            {isAdding ? 'Add New Player' : 'Edit Player Stats'}
                                        </h3>

                                        <div className="space-y-6">
                                            {/* Basic Info */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-xs uppercase font-bold text-gray-500 mb-1 block">Player Name</label>
                                                    <input
                                                        name="name"
                                                        value={formData.name}
                                                        onChange={handleChange}
                                                        className="w-full glass-input p-2.5 rounded-lg text-white font-bold"
                                                        placeholder="Full Name"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-xs uppercase font-bold text-gray-500 mb-1 block">Matches Played</label>
                                                    <input type="number" name="matches" value={formData.matches} onChange={handleChange} className="w-full glass-input p-2.5 rounded-lg text-center" />
                                                </div>
                                            </div>

                                            {/* Roles */}
                                            <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                                <h4 className="text-sm font-bold text-yellow-500 uppercase tracking-wider mb-3">Roles</h4>
                                                <div className="flex gap-6">
                                                    <label className={`flex items-center gap-3 cursor-pointer ${currentCaptain && !formData.isCaptain ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                                        <div className="relative">
                                                            <input
                                                                type="checkbox"
                                                                checked={formData.isCaptain || false}
                                                                onChange={() => handleRoleChange('isCaptain')}
                                                                disabled={currentCaptain && !formData.isCaptain}
                                                                className="sr-only"
                                                            />
                                                            <div className={`w-10 h-6 rounded-full transition-colors ${formData.isCaptain ? 'bg-yellow-500' : 'bg-gray-600'}`}></div>
                                                            <div className={`absolute left-1 top-1 w-4 h-4 rounded-full bg-white transition-transform ${formData.isCaptain ? 'translate-x-4' : ''}`}></div>
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-white">Captain (C)</div>
                                                            {currentCaptain && !formData.isCaptain && <div className="text-[10px] text-red-400">Assigned to: {currentCaptain.name}</div>}
                                                        </div>
                                                    </label>

                                                    <label className={`flex items-center gap-3 cursor-pointer ${currentViceCaptain && !formData.isViceCaptain ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                                        <div className="relative">
                                                            <input
                                                                type="checkbox"
                                                                checked={formData.isViceCaptain || false}
                                                                onChange={() => handleRoleChange('isViceCaptain')}
                                                                disabled={currentViceCaptain && !formData.isViceCaptain}
                                                                className="sr-only"
                                                            />
                                                            <div className={`w-10 h-6 rounded-full transition-colors ${formData.isViceCaptain ? 'bg-blue-500' : 'bg-gray-600'}`}></div>
                                                            <div className={`absolute left-1 top-1 w-4 h-4 rounded-full bg-white transition-transform ${formData.isViceCaptain ? 'translate-x-4' : ''}`}></div>
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-white">Vice Captain (VC)</div>
                                                            {currentViceCaptain && !formData.isViceCaptain && <div className="text-[10px] text-red-400">Assigned to: {currentViceCaptain.name}</div>}
                                                        </div>
                                                    </label>
                                                </div>
                                            </div>

                                            {/* Batting Stats */}
                                            <div>
                                                <h4 className="text-sm font-bold text-blue-400 uppercase tracking-wider mb-3 border-b border-white/10 pb-2">Batting Stats</h4>
                                                <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                                                    <div>
                                                        <label className="text-xs uppercase font-bold text-gray-500 mb-1 block">Runs</label>
                                                        <input type="number" name="runs" value={formData.runs} onChange={handleChange} className="w-full glass-input p-2.5 rounded-lg text-center" />
                                                    </div>
                                                    <div>
                                                        <label className="text-xs uppercase font-bold text-gray-500 mb-1 block">Balls</label>
                                                        <input type="number" name="balls" value={formData.balls} onChange={handleChange} className="w-full glass-input p-2.5 rounded-lg text-center" />
                                                    </div>
                                                    <div>
                                                        <label className="text-xs uppercase font-bold text-gray-500 mb-1 block">4s</label>
                                                        <input type="number" name="fours" value={formData.fours} onChange={handleChange} className="w-full glass-input p-2.5 rounded-lg text-center" />
                                                    </div>
                                                    <div>
                                                        <label className="text-xs uppercase font-bold text-gray-500 mb-1 block">6s</label>
                                                        <input type="number" name="sixes" value={formData.sixes} onChange={handleChange} className="w-full glass-input p-2.5 rounded-lg text-center" />
                                                    </div>
                                                    <div>
                                                        <label className="text-xs uppercase font-bold text-gray-500 mb-1 block">50s</label>
                                                        <input type="number" name="fifties" value={formData.fifties} onChange={handleChange} className="w-full glass-input p-2.5 rounded-lg text-center" />
                                                    </div>
                                                    <div>
                                                        <label className="text-xs uppercase font-bold text-gray-500 mb-1 block">100s</label>
                                                        <input type="number" name="hundreds" value={formData.hundreds} onChange={handleChange} className="w-full glass-input p-2.5 rounded-lg text-center" />
                                                    </div>
                                                    <div>
                                                        <label className="text-xs uppercase font-bold text-gray-500 mb-1 block">Highest</label>
                                                        <input type="number" name="highestScore" value={formData.highestScore || 0} onChange={handleChange} className="w-full glass-input p-2.5 rounded-lg text-center font-bold text-yellow-400" />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Bowling Stats */}
                                            <div>
                                                <h4 className="text-sm font-bold text-green-400 uppercase tracking-wider mb-3 border-b border-white/10 pb-2">Bowling Stats</h4>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                    <div>
                                                        <label className="text-xs uppercase font-bold text-gray-500 mb-1 block">Overs</label>
                                                        <input type="number" name="overs" value={formData.overs || 0} onChange={handleChange} className="w-full glass-input p-2.5 rounded-lg text-center" />
                                                    </div>
                                                    <div>
                                                        <label className="text-xs uppercase font-bold text-gray-500 mb-1 block">Maidens</label>
                                                        <input type="number" name="maidens" value={formData.maidens || 0} onChange={handleChange} className="w-full glass-input p-2.5 rounded-lg text-center" />
                                                    </div>
                                                    <div>
                                                        <label className="text-xs uppercase font-bold text-gray-500 mb-1 block">Runs Conceded</label>
                                                        <input type="number" name="runsConceded" value={formData.runsConceded || 0} onChange={handleChange} className="w-full glass-input p-2.5 rounded-lg text-center" />
                                                    </div>
                                                    <div>
                                                        <label className="text-xs uppercase font-bold text-gray-500 mb-1 block">Wickets</label>
                                                        <input type="number" name="wickets" value={formData.wickets || 0} onChange={handleChange} className="w-full glass-input p-2.5 rounded-lg text-center" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex justify-end gap-3 mt-6">
                                            <button
                                                type="submit"
                                                className="bg-emerald-500 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 transition-all font-bold"
                                                title="Save Player"
                                            >
                                                <Save size={20} />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => { setIsAdding(false); setEditingId(null); setFormData({}); }}
                                                className="bg-white/10 text-gray-400 hover:text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-red-500/20 transition-colors"
                                                title="Cancel"
                                            >
                                                <X size={20} />
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {/* Players Table */}
                            <div className="glass-card overflow-hidden border border-white/10 rounded-xl overflow-x-auto">
                                <table className="w-full text-left border-collapse whitespace-nowrap">
                                    <thead>
                                        <tr className="bg-white/5 text-xs uppercase text-gray-400 font-bold tracking-wider">
                                            <th className="p-4 border-b border-white/5 sticky left-0 bg-[#0f1016] z-10 shadow-lg">Player Name</th>
                                            <th className="p-4 border-b border-white/5 text-center bg-white/5">Mat</th>

                                            {/* Batting Headers */}
                                            <th className="p-4 border-b border-white/5 text-center text-blue-300">Run</th>
                                            <th className="p-4 border-b border-white/5 text-center">Ball</th>
                                            <th className="p-4 border-b border-white/5 text-center">Avg</th>
                                            <th className="p-4 border-b border-white/5 text-center">SR</th>
                                            <th className="p-4 border-b border-white/5 text-center text-gray-500">4s</th>
                                            <th className="p-4 border-b border-white/5 text-center text-gray-500">6s</th>
                                            <th className="p-4 border-b border-white/5 text-center text-gray-500">50</th>
                                            <th className="p-4 border-b border-white/5 text-center text-gray-500">100</th>
                                            <th className="p-4 border-b border-white/5 text-center text-yellow-500 border-r border-white/5">HS</th>

                                            {/* Bowling Headers */}
                                            <th className="p-4 border-b border-white/5 text-center text-green-300">Ov</th>
                                            <th className="p-4 border-b border-white/5 text-center">Mdn</th>
                                            <th className="p-4 border-b border-white/5 text-center">Run</th>
                                            <th className="p-4 border-b border-white/5 text-center text-yellow-300">Wkt</th>
                                            <th className="p-4 border-b border-white/5 text-center">Eco</th>

                                            {!readOnly && <th className="p-4 border-b border-white/5 text-right sticky right-0 bg-[#0f1016] z-10 shadow-lg">Actions</th>}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5 text-sm">
                                        {teamPlayers.length === 0 ? (
                                            <tr>
                                                <td colSpan={readOnly ? 16 : 17} className="p-8 text-center text-gray-500">
                                                    {readOnly ? "No players in squad." : "No players found. Click \"Add Player\" to build your squad."}
                                                </td>
                                            </tr>
                                        ) : (
                                            teamPlayers.map((player) => (
                                                <tr key={player.id} className="hover:bg-white/5 transition-colors group">
                                                    <td className="p-4 font-bold text-white group-hover:text-blue-300 transition-colors sticky left-0 bg-[#0a0f1c] group-hover:bg-[#1a1f2e] transition-colors shadow-lg z-10 border-r border-white/5 flex items-center gap-2">
                                                        {player.name}
                                                        {player.isCaptain && <span className="bg-yellow-500/20 text-yellow-500 text-[10px] px-1.5 py-0.5 rounded border border-yellow-500/30 font-bold" title="Captain">C</span>}
                                                        {player.isViceCaptain && <span className="bg-blue-500/20 text-blue-500 text-[10px] px-1.5 py-0.5 rounded border border-blue-500/30 font-bold" title="Vice Captain">VC</span>}
                                                    </td>
                                                    <td className="p-4 text-center text-gray-300 bg-white/5">{player.matches}</td>

                                                    {/* Batting Stats */}
                                                    <td className="p-4 text-center font-bold text-blue-300 text-base">{player.runs}</td>
                                                    <td className="p-4 text-center text-gray-400">{player.balls}</td>
                                                    <td className="p-4 text-center font-mono text-gray-300">{calculateAverage(player.runs, player.matches)}</td>
                                                    <td className="p-4 text-center font-mono text-gray-300">{calculateStrikeRate(player.runs, player.balls)}</td>
                                                    <td className="p-4 text-center text-gray-500">{player.fours}</td>
                                                    <td className="p-4 text-center text-gray-500">{player.sixes}</td>
                                                    <td className="p-4 text-center text-gray-500">{player.fifties}</td>
                                                    <td className="p-4 text-center text-gray-500">{player.hundreds}</td>
                                                    <td className="p-4 text-center font-bold text-yellow-500 border-r border-white/5">{player.highestScore || 0}</td>

                                                    {/* Bowling Stats */}
                                                    <td className="p-4 text-center text-gray-300">{player.overs || 0}</td>
                                                    <td className="p-4 text-center text-gray-400">{player.maidens || 0}</td>
                                                    <td className="p-4 text-center text-gray-400">{player.runsConceded || 0}</td>
                                                    <td className="p-4 text-center font-bold text-yellow-400 text-base">{player.wickets || 0}</td>
                                                    <td className="p-4 text-center font-mono text-green-300">{calculateEconomy(player.runsConceded, player.overs)}</td>

                                                    {!readOnly && (
                                                        <td className="p-4 text-right flex justify-end gap-2 sticky right-0 bg-[#0a0f1c] group-hover:bg-[#1a1f2e] transition-colors shadow-lg z-10 border-l border-white/5">
                                                            <button
                                                                onClick={() => handleStartEdit(player)}
                                                                className="p-2 rounded-full text-blue-400 hover:bg-blue-500/10 transition-colors"
                                                                title="Edit"
                                                            >
                                                                <Edit2 size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(player.id)}
                                                                className="p-2 rounded-full text-red-400 hover:bg-red-500/10 transition-colors"
                                                                title="Delete"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </td>
                                                    )}
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PlayerManager;
