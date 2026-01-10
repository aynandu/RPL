import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { X, Save } from 'lucide-react';

const ScoreUpdateForm = ({ match, onClose }) => {
    const { updateMatch } = useGame();
    const [formData, setFormData] = useState(match);

    useEffect(() => {
        setFormData(match);
    }, [match]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleNestedChange = (parent, field, value) => {
        setFormData(prev => ({
            ...prev,
            [parent]: {
                ...prev[parent],
                [field]: value
            }
        }));
    };

    const handleScoreChange = (team, field, value) => {
        setFormData(prev => ({
            ...prev,
            score: {
                ...prev.score,
                [team]: {
                    ...prev.score[team],
                    [field]: Number(value)
                }
            }
        }));
    };

    // Helper to update batting/bowling deeply nested
    const handleDeepChange = (section, subSection, field, value) => {
        setFormData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [subSection]: {
                    ...(prev[section]?.[subSection] || {}),
                    [field]: section === 'batting' && field !== 'name' ? Number(value) : (field === 'overs' || field === 'runs' || field === 'wickets' ? Number(value) : value)
                }
            }
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        updateMatch(match.id, formData);
        onClose();
    };

    const initBatting = () => {
        if (!formData.batting) {
            setFormData(prev => ({
                ...prev,
                batting: {
                    striker: { name: "Batter 1", runs: 0, balls: 0, fours: 0, sixes: 0 },
                    nonStriker: { name: "Batter 2", runs: 0, balls: 0, fours: 0, sixes: 0 }
                }
            }));
        }
    };

    const initBowling = () => {
        if (!formData.bowling) {
            setFormData(prev => ({
                ...prev,
                bowling: {
                    bowler: { name: "Bowler 1", overs: 0, runs: 0, wickets: 0 }
                }
            }));
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex justify-center items-center z-50 p-4 animate-fade-in">
            <div className="glass-card w-full max-w-3xl h-[85vh] overflow-hidden flex flex-col shadow-2xl animate-fade-in-up border border-white/10">
                <div className="sticky top-0 bg-white/5 backdrop-blur-md p-4 border-b border-white/10 flex justify-between items-center z-10 text-white">
                    <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                        Update Match: {formData.team1} vs {formData.team2}
                    </h2>
                    <button onClick={onClose} className="hover:bg-white/10 p-2 rounded-full transition-colors text-gray-300 hover:text-white"><X /></button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1 bg-gradient-to-br from-slate-900/50 to-indigo-900/20">
                    {/* General Settings */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 border-b border-white/10 pb-6">
                        <div>
                            <label className="block text-xs font-bold mb-1 text-gray-400 uppercase tracking-wider">Status</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full glass-input p-2 rounded-lg"
                            >
                                <option value="upcoming" className="bg-slate-900 text-gray-300">Upcoming</option>
                                <option value="live" className="bg-slate-900 text-gray-300">Live</option>
                                <option value="completed" className="bg-slate-900 text-gray-300">Completed</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold mb-1 text-gray-400 uppercase tracking-wider">Date & Time</label>
                            <input
                                type="datetime-local"
                                name="date"
                                value={formData.date ? new Date(formData.date).toISOString().slice(0, 16) : ''}
                                onChange={handleChange}
                                className="w-full glass-input p-2 rounded-lg"
                            />
                        </div>
                        <div className="md:col-span-1">
                            <label className="block text-xs font-bold mb-1 text-gray-400 uppercase tracking-wider">Team 1</label>
                            <input
                                type="text"
                                name="team1"
                                value={formData.team1}
                                onChange={handleChange}
                                className="w-full glass-input p-2 rounded-lg font-bold text-blue-300"
                            />
                        </div>
                        <div className="md:col-span-1">
                            <label className="block text-xs font-bold mb-1 text-gray-400 uppercase tracking-wider">Team 2</label>
                            <input
                                type="text"
                                name="team2"
                                value={formData.team2}
                                onChange={handleChange}
                                className="w-full glass-input p-2 rounded-lg font-bold text-purple-300"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold mb-1 text-gray-400 uppercase tracking-wider">Man of the Match</label>
                            <input
                                type="text"
                                name="manOfTheMatch"
                                value={formData.manOfTheMatch || ''}
                                onChange={handleChange}
                                placeholder="Player Name"
                                className="w-full glass-input p-2 rounded-lg"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold mb-1 text-gray-400 uppercase tracking-wider">Stadium</label>
                            <select
                                name="stadium"
                                value={formData.stadium || 'Indoor Stadium, Pramdom'}
                                onChange={handleChange}
                                className="w-full glass-input p-2 rounded-lg text-gray-300"
                            >
                                <option value="Indoor Stadium, Pramdom" className="bg-slate-900">Indoor Stadium, Pramdom</option>
                                <option value="Turf, Pathanamthitta" className="bg-slate-900">Turf, Pathanamthitta</option>
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold mb-1 text-gray-400 uppercase tracking-wider">Toss Result</label>
                            <input
                                type="text"
                                name="tossResult"
                                value={formData.tossResult || ''}
                                onChange={handleChange}
                                placeholder="e.g. Team A won the toss..."
                                className="w-full glass-input p-2 rounded-lg"
                            />
                        </div>
                    </div>

                    {/* Team Scores */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-b border-white/10 pb-6">
                        <div className="bg-blue-500/10 p-4 rounded-xl border border-blue-500/20">
                            <h3 className="font-bold mb-4 text-blue-300 border-b border-blue-500/20 pb-2 flex justify-between">
                                {formData.team1} Score
                                <span className="text-xs font-normal text-blue-400 opacity-70">Runs / Wkts / Overs</span>
                            </h3>
                            <div className="grid grid-cols-3 gap-2">
                                <input type="number" placeholder="Runs" value={formData.score.team1.runs} onChange={(e) => handleScoreChange('team1', 'runs', e.target.value)} className="w-full glass-input p-2 rounded text-center font-mono text-lg" />
                                <input type="number" placeholder="Wkts" value={formData.score.team1.wickets} onChange={(e) => handleScoreChange('team1', 'wickets', e.target.value)} className="w-full glass-input p-2 rounded text-center font-mono text-lg" />
                                <input type="number" placeholder="Overs" value={formData.score.team1.overs} onChange={(e) => handleScoreChange('team1', 'overs', e.target.value)} className="w-full glass-input p-2 rounded text-center font-mono text-lg" step="0.1" />
                            </div>
                        </div>
                        <div className="bg-purple-500/10 p-4 rounded-xl border border-purple-500/20">
                            <h3 className="font-bold mb-4 text-purple-300 border-b border-purple-500/20 pb-2 flex justify-between">
                                {formData.team2} Score
                                <span className="text-xs font-normal text-purple-400 opacity-70">Runs / Wkts / Overs</span>
                            </h3>
                            <div className="grid grid-cols-3 gap-2">
                                <input type="number" placeholder="Runs" value={formData.score.team2.runs} onChange={(e) => handleScoreChange('team2', 'runs', e.target.value)} className="w-full glass-input p-2 rounded text-center font-mono text-lg" />
                                <input type="number" placeholder="Wickets" value={formData.score.team2.wickets} onChange={(e) => handleScoreChange('team2', 'wickets', e.target.value)} className="w-full glass-input p-2 rounded text-center font-mono text-lg" />
                                <input type="number" placeholder="Overs" value={formData.score.team2.overs} onChange={(e) => handleScoreChange('team2', 'overs', e.target.value)} className="w-full glass-input p-2 rounded text-center font-mono text-lg" step="0.1" />
                            </div>
                        </div>
                    </div>

                    {/* Batting Details */}
                    <div className="border-b border-white/10 pb-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-white flex items-center gap-2">
                                <span className="w-1.5 h-6 bg-yellow-500 rounded-full inline-block"></span>
                                Current Batting
                            </h3>
                            <button type="button" onClick={initBatting} className="text-xs text-blue-400 hover:text-blue-300 px-3 py-1 rounded-full bg-blue-500/10 hover:bg-blue-500/20 transition-colors">Initialize</button>
                        </div>
                        {formData.batting && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-6 gap-3 items-end">
                                    <div className="col-span-2 text-xs font-bold text-gray-400 uppercase">Striker</div>
                                    <div className="text-xs font-bold text-gray-400 text-center">R</div>
                                    <div className="text-xs font-bold text-gray-400 text-center">B</div>
                                    <div className="text-xs font-bold text-gray-400 text-center">4s</div>
                                    <div className="text-xs font-bold text-gray-400 text-center">6s</div>

                                    <div className="col-span-2">
                                        <input type="text" value={formData.batting.striker.name} onChange={(e) => handleDeepChange('batting', 'striker', 'name', e.target.value)} className="w-full glass-input p-2 rounded" />
                                    </div>
                                    <input type="number" value={formData.batting.striker.runs} onChange={(e) => handleDeepChange('batting', 'striker', 'runs', e.target.value)} className="w-full glass-input p-2 rounded text-center" />
                                    <input type="number" value={formData.batting.striker.balls} onChange={(e) => handleDeepChange('batting', 'striker', 'balls', e.target.value)} className="w-full glass-input p-2 rounded text-center" />
                                    <input type="number" value={formData.batting.striker.fours} onChange={(e) => handleDeepChange('batting', 'striker', 'fours', e.target.value)} className="w-full glass-input p-2 rounded text-center" />
                                    <input type="number" value={formData.batting.striker.sixes} onChange={(e) => handleDeepChange('batting', 'striker', 'sixes', e.target.value)} className="w-full glass-input p-2 rounded text-center" />
                                </div>
                                <div className="grid grid-cols-6 gap-3 items-end">
                                    <div className="col-span-2 text-xs font-bold text-gray-400 uppercase">Non-Striker</div>
                                    <div className="text-xs font-bold text-gray-400 text-center">R</div>
                                    <div className="text-xs font-bold text-gray-400 text-center">B</div>
                                    <div className="text-xs font-bold text-gray-400 text-center">4s</div>
                                    <div className="text-xs font-bold text-gray-400 text-center">6s</div>

                                    <div className="col-span-2">
                                        <input type="text" value={formData.batting.nonStriker.name} onChange={(e) => handleDeepChange('batting', 'nonStriker', 'name', e.target.value)} className="w-full glass-input p-2 rounded" />
                                    </div>
                                    <input type="number" value={formData.batting.nonStriker.runs} onChange={(e) => handleDeepChange('batting', 'nonStriker', 'runs', e.target.value)} className="w-full glass-input p-2 rounded text-center" />
                                    <input type="number" value={formData.batting.nonStriker.balls} onChange={(e) => handleDeepChange('batting', 'nonStriker', 'balls', e.target.value)} className="w-full glass-input p-2 rounded text-center" />
                                    <input type="number" value={formData.batting.nonStriker.fours} onChange={(e) => handleDeepChange('batting', 'nonStriker', 'fours', e.target.value)} className="w-full glass-input p-2 rounded text-center" />
                                    <input type="number" value={formData.batting.nonStriker.sixes} onChange={(e) => handleDeepChange('batting', 'nonStriker', 'sixes', e.target.value)} className="w-full glass-input p-2 rounded text-center" />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Bowling Details */}
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-white flex items-center gap-2">
                                <span className="w-1.5 h-6 bg-red-500 rounded-full inline-block"></span>
                                Current Bowler
                            </h3>
                            <button type="button" onClick={initBowling} className="text-xs text-blue-400 hover:text-blue-300 px-3 py-1 rounded-full bg-blue-500/10 hover:bg-blue-500/20 transition-colors">Initialize</button>
                        </div>
                        {formData.bowling && (
                            <div className="grid grid-cols-6 gap-3 items-end">
                                <div className="col-span-2 text-xs font-bold text-gray-400 uppercase">Name</div>
                                <div className="text-xs font-bold text-gray-400 text-center">O</div>
                                <div className="text-xs font-bold text-gray-400 text-center">R</div>
                                <div className="text-xs font-bold text-gray-400 text-center">W</div>
                                <div className="col-span-1"></div>

                                <div className="col-span-2">
                                    <input type="text" value={formData.bowling.bowler.name} onChange={(e) => handleDeepChange('bowling', 'bowler', 'name', e.target.value)} className="w-full glass-input p-2 rounded" />
                                </div>
                                <input type="number" step="0.1" value={formData.bowling.bowler.overs} onChange={(e) => handleDeepChange('bowling', 'bowler', 'overs', e.target.value)} className="w-full glass-input p-2 rounded text-center" />
                                <input type="number" value={formData.bowling.bowler.runs} onChange={(e) => handleDeepChange('bowling', 'bowler', 'runs', e.target.value)} className="w-full glass-input p-2 rounded text-center" />
                                <input type="number" value={formData.bowling.bowler.wickets} onChange={(e) => handleDeepChange('bowling', 'bowler', 'wickets', e.target.value)} className="w-full glass-input p-2 rounded text-center" />
                            </div>
                        )}
                    </div>
                </form>

                <div className="p-4 border-t border-white/10 flex justify-end bg-white/5 backdrop-blur-md">
                    <button type="submit" onClick={handleSubmit} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-full font-bold flex items-center gap-2 shadow-lg hover:shadow-blue-500/40 transition-all hover:scale-105">
                        <Save size={20} /> Save Updates
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ScoreUpdateForm;
