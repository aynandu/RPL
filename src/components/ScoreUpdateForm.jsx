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
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-3xl h-[85vh] overflow-y-auto shadow-2xl animate-fade-in-up">
                <div className="sticky top-0 bg-gray-100 p-4 border-b flex justify-between items-center z-10">
                    <h2 className="text-xl font-bold">Update Match: {formData.team1} vs {formData.team2}</h2>
                    <button onClick={onClose}><X /></button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* General Settings */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 border-b pb-4">
                        <div>
                            <label className="block text-sm font-bold mb-1">Status</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full border p-2 rounded"
                            >
                                <option value="upcoming">Upcoming</option>
                                <option value="live">Live</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-1">Date & Time</label>
                            <input
                                type="datetime-local"
                                name="date"
                                value={formData.date ? new Date(formData.date).toISOString().slice(0, 16) : ''}
                                onChange={handleChange}
                                className="w-full border p-2 rounded"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-1">Team 1 Name</label>
                            <input
                                type="text"
                                name="team1"
                                value={formData.team1}
                                onChange={handleChange}
                                className="w-full border p-2 rounded"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-1">Team 2 Name</label>
                            <input
                                type="text"
                                name="team2"
                                value={formData.team2}
                                onChange={handleChange}
                                className="w-full border p-2 rounded"
                            />
                        </div>
                    </div>

                    {/* Team Scores */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-b pb-4">
                        <div className="bg-blue-50 p-4 rounded">
                            <h3 className="font-bold mb-2">{formData.team1} Score</h3>
                            <div className="grid grid-cols-3 gap-2">
                                <input type="number" placeholder="Runs" value={formData.score.team1.runs} onChange={(e) => handleScoreChange('team1', 'runs', e.target.value)} className="w-full border p-1 rounded" />
                                <input type="number" placeholder="Wickets" value={formData.score.team1.wickets} onChange={(e) => handleScoreChange('team1', 'wickets', e.target.value)} className="w-full border p-1 rounded" />
                                <input type="number" placeholder="Overs" value={formData.score.team1.overs} onChange={(e) => handleScoreChange('team1', 'overs', e.target.value)} className="w-full border p-1 rounded" step="0.1" />
                            </div>
                        </div>
                        <div className="bg-blue-50 p-4 rounded">
                            <h3 className="font-bold mb-2">{formData.team2} Score</h3>
                            <div className="grid grid-cols-3 gap-2">
                                <input type="number" placeholder="Runs" value={formData.score.team2.runs} onChange={(e) => handleScoreChange('team2', 'runs', e.target.value)} className="w-full border p-1 rounded" />
                                <input type="number" placeholder="Wickets" value={formData.score.team2.wickets} onChange={(e) => handleScoreChange('team2', 'wickets', e.target.value)} className="w-full border p-1 rounded" />
                                <input type="number" placeholder="Overs" value={formData.score.team2.overs} onChange={(e) => handleScoreChange('team2', 'overs', e.target.value)} className="w-full border p-1 rounded" step="0.1" />
                            </div>
                        </div>
                    </div>

                    {/* Batting Details */}
                    <div className="border-b pb-4">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-bold">Current Batting</h3>
                            <button type="button" onClick={initBatting} className="text-xs text-blue-600 underline">Initialize</button>
                        </div>
                        {formData.batting && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-6 gap-2 items-end">
                                    <div className="col-span-2 text-xs font-bold text-gray-500">Striker</div>
                                    <div className="text-xs font-bold text-gray-500 text-center">R</div>
                                    <div className="text-xs font-bold text-gray-500 text-center">B</div>
                                    <div className="text-xs font-bold text-gray-500 text-center">4s</div>
                                    <div className="text-xs font-bold text-gray-500 text-center">6s</div>

                                    <div className="col-span-2">
                                        <input type="text" value={formData.batting.striker.name} onChange={(e) => handleDeepChange('batting', 'striker', 'name', e.target.value)} className="w-full border p-1 rounded" />
                                    </div>
                                    <input type="number" value={formData.batting.striker.runs} onChange={(e) => handleDeepChange('batting', 'striker', 'runs', e.target.value)} className="w-full border p-1 rounded" />
                                    <input type="number" value={formData.batting.striker.balls} onChange={(e) => handleDeepChange('batting', 'striker', 'balls', e.target.value)} className="w-full border p-1 rounded" />
                                    <input type="number" value={formData.batting.striker.fours} onChange={(e) => handleDeepChange('batting', 'striker', 'fours', e.target.value)} className="w-full border p-1 rounded" />
                                    <input type="number" value={formData.batting.striker.sixes} onChange={(e) => handleDeepChange('batting', 'striker', 'sixes', e.target.value)} className="w-full border p-1 rounded" />
                                </div>
                                <div className="grid grid-cols-6 gap-2 items-end">
                                    <div className="col-span-2 text-xs font-bold text-gray-500">Non-Striker</div>
                                    <div className="text-xs font-bold text-gray-500 text-center">R</div>
                                    <div className="text-xs font-bold text-gray-500 text-center">B</div>
                                    <div className="text-xs font-bold text-gray-500 text-center">4s</div>
                                    <div className="text-xs font-bold text-gray-500 text-center">6s</div>

                                    <div className="col-span-2">
                                        <input type="text" value={formData.batting.nonStriker.name} onChange={(e) => handleDeepChange('batting', 'nonStriker', 'name', e.target.value)} className="w-full border p-1 rounded" />
                                    </div>
                                    <input type="number" value={formData.batting.nonStriker.runs} onChange={(e) => handleDeepChange('batting', 'nonStriker', 'runs', e.target.value)} className="w-full border p-1 rounded" />
                                    <input type="number" value={formData.batting.nonStriker.balls} onChange={(e) => handleDeepChange('batting', 'nonStriker', 'balls', e.target.value)} className="w-full border p-1 rounded" />
                                    <input type="number" value={formData.batting.nonStriker.fours} onChange={(e) => handleDeepChange('batting', 'nonStriker', 'fours', e.target.value)} className="w-full border p-1 rounded" />
                                    <input type="number" value={formData.batting.nonStriker.sixes} onChange={(e) => handleDeepChange('batting', 'nonStriker', 'sixes', e.target.value)} className="w-full border p-1 rounded" />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Bowling Details */}
                    <div className="pb-4">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-bold">Current Bowler</h3>
                            <button type="button" onClick={initBowling} className="text-xs text-blue-600 underline">Initialize</button>
                        </div>
                        {formData.bowling && (
                            <div className="grid grid-cols-6 gap-2 items-end">
                                <div className="col-span-2 text-xs font-bold text-gray-500">Name</div>
                                <div className="text-xs font-bold text-gray-500 text-center">O</div>
                                <div className="text-xs font-bold text-gray-500 text-center">R</div>
                                <div className="text-xs font-bold text-gray-500 text-center">W</div>
                                <div className="col-span-1"></div>

                                <div className="col-span-2">
                                    <input type="text" value={formData.bowling.bowler.name} onChange={(e) => handleDeepChange('bowling', 'bowler', 'name', e.target.value)} className="w-full border p-1 rounded" />
                                </div>
                                <input type="number" step="0.1" value={formData.bowling.bowler.overs} onChange={(e) => handleDeepChange('bowling', 'bowler', 'overs', e.target.value)} className="w-full border p-1 rounded" />
                                <input type="number" value={formData.bowling.bowler.runs} onChange={(e) => handleDeepChange('bowling', 'bowler', 'runs', e.target.value)} className="w-full border p-1 rounded" />
                                <input type="number" value={formData.bowling.bowler.wickets} onChange={(e) => handleDeepChange('bowling', 'bowler', 'wickets', e.target.value)} className="w-full border p-1 rounded" />
                            </div>
                        )}
                    </div>

                    <div className="sticky bottom-0 bg-gray-50 p-4 border-t flex justify-end">
                        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg hover:bg-blue-700">
                            <Save size={20} /> Save Updates
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ScoreUpdateForm;
