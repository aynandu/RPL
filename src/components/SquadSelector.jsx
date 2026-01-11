import React, { useState, useEffect } from 'react';
import { X, Check, AlertCircle } from 'lucide-react';

const SquadSelector = ({ teamName, availablePlayers, onSave, onCancel, maxSelection = 11, title = "Select Playing XI" }) => {
    const [selectedIds, setSelectedIds] = useState([]);

    useEffect(() => {
        setSelectedIds([]);
    }, [teamName]);

    // Filter players for this specific team if availablePlayers contains all teams
    // Assuming availablePlayers might be the full list, or pre-filtered. 
    // Let's assume the parent passes the correct list for simplicity, but filtering is safe.
    const teamPlayers = availablePlayers.filter(p => p.team === teamName);

    const togglePlayer = (id) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(prev => prev.filter(pid => pid !== id));
        } else {
            if (selectedIds.length >= maxSelection) {
                // If maxSelection is 1, assume replace behavior or simple toggle
                if (maxSelection === 1) {
                    setSelectedIds([id]);
                    return;
                }
                // Optional: Show toast or shake animation for limit reached
                return;
            }
            setSelectedIds(prev => [...prev, id]);
        }
    };

    const handleSave = () => {
        const selectedPlayers = teamPlayers.filter(p => selectedIds.includes(p.id));
        onSave(selectedPlayers);
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-[60] p-4 animate-fade-in">
            <div className="glass-card w-full max-w-2xl h-[80vh] flex flex-col shadow-2xl animate-fade-in-up border border-white/10 relative overflow-hidden">
                {/* Header */}
                <div className="p-5 border-b border-white/10 flex justify-between items-center bg-[#0f1016]">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            {title}
                            <span className="text-sm font-normal text-gray-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
                                {teamName}
                            </span>
                        </h2>
                        <div className={`text-xs mt-1 font-bold ${selectedIds.length === maxSelection ? 'text-green-400' : 'text-yellow-400'}`}>
                            {selectedIds.length}/{maxSelection} Selected
                        </div>
                    </div>
                    <button onClick={onCancel} className="hover:bg-white/10 p-2 rounded-full transition-colors text-gray-400 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                {/* Player List */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 grid grid-cols-3 gap-2 bg-gradient-to-b from-[#0f1016] to-[#1a1f2e]">
                    {teamPlayers.length === 0 ? (
                        <div className="text-center py-20 text-gray-500">
                            No players found in this squad.
                            <br />
                            Please add players via Team Manager first.
                        </div>
                    ) : (
                        teamPlayers.map(player => {
                            const isSelected = selectedIds.includes(player.id);
                            return (
                                <div
                                    key={player.id}
                                    onClick={() => togglePlayer(player.id)}
                                    className={`flex items-center justify-between p-1.5 rounded-lg border transition-all cursor-pointer group ${isSelected
                                        ? 'bg-blue-600/20 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                                        : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10'
                                        }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isSelected
                                            ? 'bg-blue-500 border-blue-500'
                                            : 'border-gray-600 group-hover:border-gray-400'
                                            }`}>
                                            {isSelected && <Check size={12} className="text-white" />}
                                        </div>
                                        <div>
                                            <div className={`font-bold transition-colors ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                                                {player.name}
                                            </div>
                                            <div className="flex gap-2 text-[10px] uppercase font-bold text-gray-500">
                                                {player.isCaptain && <span className="text-yellow-500">Captain</span>}
                                                {player.isViceCaptain && <span className="text-blue-400">Vice Captain</span>}
                                                <span>Matches: {player.matches}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Stats Preview (Batting/Bowling badges) */}
                                    <div className="flex gap-1 opacity-50">
                                        {(player.runs > 0 || player.matches > 0) && (
                                            <div className="w-1.5 h-6 bg-blue-500/50 rounded-full" title="Batter"></div>
                                        )}
                                        {player.wickets > 0 && (
                                            <div className="w-1.5 h-6 bg-green-500/50 rounded-full" title="Bowler"></div>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-white/10 bg-[#0f1016] flex justify-end gap-3 z-10">
                    <button
                        onClick={onCancel}
                        className="px-6 py-2.5 rounded-lg font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                    >
                        Skip / Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={selectedIds.length !== maxSelection}
                        className={`px-8 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-all ${selectedIds.length === maxSelection
                            ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                            : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                            }`}
                    >
                        {selectedIds.length === maxSelection ? <Check size={20} /> : <AlertCircle size={20} />}
                        {selectedIds.length === maxSelection ? (maxSelection === 1 ? 'Select Bowler' : 'Confirm XI') : `Select ${maxSelection - selectedIds.length} more`}
                    </button>

                </div>
            </div>
        </div>
    );
};

export default SquadSelector;
