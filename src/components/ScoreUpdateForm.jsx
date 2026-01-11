import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { X, Save, Trash2, UserPlus } from 'lucide-react';
import SquadSelector from './SquadSelector';

const ScoreUpdateForm = ({ match, onClose }) => {
    const { updateMatch, allTeams, players } = useGame(); // Get players from context
    const [formData, setFormData] = useState(match);
    const [activeTab, setActiveTab] = useState('innings1'); // 'innings1' or 'innings2'

    // Squad Selector State
    const [showSquadSelector, setShowSquadSelector] = useState(false);
    const [selectorTeam, setSelectorTeam] = useState(null); // 'team1' or 'team2'

    // Bowler Selector State
    const [showBowlerSelector, setShowBowlerSelector] = useState(false);
    const [bowlingTeam, setBowlingTeam] = useState(null); // The team name whose squad to show

    useEffect(() => {
        setFormData(match);
    }, [match]);

    // Initialize overs arrays based on selection
    useEffect(() => {
        const totalOvers = parseInt(formData.oversChoosen) || 6;

        ['innings1Overs', 'innings2Overs'].forEach(key => {
            if (!formData[key] || formData[key].length !== totalOvers) {
                // If it doesn't exist or length changed (e.g. 6 to 8), re-init
                // Ideally preserve existing data if growing, but for simplicity re-init or check length
                setFormData(prev => {
                    const currentOvers = prev[key] || [];
                    if (currentOvers.length === totalOvers) return prev; // No change needed

                    let newOvers = [...currentOvers];
                    if (newOvers.length < totalOvers) {
                        // Add more
                        for (let i = newOvers.length; i < totalOvers; i++) {
                            newOvers.push({ over: i + 1, balls: Array(6).fill(""), bowler: "", extras: "" });
                        }
                    } else {
                        // Truncate (if switched 8 -> 6)
                        newOvers = newOvers.slice(0, totalOvers);
                    }
                    return { ...prev, [key]: newOvers };
                });
            }
        });
    }, [formData.oversChoosen]);

    // Auto-calculate scores based on Over-by-Over data
    useEffect(() => {
        const calculateStats = (oversData) => {
            if (!oversData) return { runsFromBalls: 0, totalExtras: 0 };
            return oversData.reduce((acc, over) => {
                const ballsSum = over.balls.reduce((sum, ball) => sum + (Number(ball) || 0), 0);
                const extras = Number(over.extras) || 0;
                return {
                    runsFromBalls: acc.runsFromBalls + ballsSum,
                    totalExtras: acc.totalExtras + extras
                };
            }, { runsFromBalls: 0, totalExtras: 0 });
        };

        const stats1 = calculateStats(formData.innings1Overs);
        const stats2 = calculateStats(formData.innings2Overs);

        const totalRuns1 = stats1.runsFromBalls + stats1.totalExtras;
        const totalRuns2 = stats2.runsFromBalls + stats2.totalExtras;

        setFormData(prev => {
            // Only update if values are different
            if (prev.score.team1.runs === totalRuns1 &&
                prev.score.team2.runs === totalRuns2 &&
                prev.score.team1.extras === stats1.totalExtras &&
                prev.score.team2.extras === stats2.totalExtras) {
                return prev;
            }
            return {
                ...prev,
                score: {
                    ...prev.score,
                    team1: { ...prev.score.team1, runs: totalRuns1, extras: stats1.totalExtras },
                    team2: { ...prev.score.team2, runs: totalRuns2, extras: stats2.totalExtras }
                }
            };
        });
    }, [formData.innings1Overs, formData.innings2Overs]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Trigger Squad Selector if status becomes 'live'
        if (name === 'status' && value === 'live') {
            // Check if batting info is empty to avoid overwriting existing data
            const batting1Empty = !formData.batting || formData.batting.every(p => !p.name);

            if (batting1Empty && formData.team1) {
                // Determine order: Team 1 first, then Team 2 (we'll chain this in handleSquadSave)
                setSelectorTeam('team1');
                setShowSquadSelector(true);
            }
        }
    };

    const handleSquadSave = (selectedPlayers) => {
        if (selectorTeam === 'team1') {
            // Populate Innings 1 Batting
            const newBatting = selectedPlayers.map(p => ({
                name: p.name,
                runs: 0,
                balls: 0,
                fours: 0,
                sixes: 0,
                dismissalType: "nextToBat",
                dismissalBowler: "",
                dismissalFielder: ""
            }));

            setFormData(prev => ({
                ...prev,
                batting: newBatting
            }));

            // Chain to Team 2
            if (formData.team2) {
                setSelectorTeam('team2'); // Switch to Team 2
                // Keep selector open
            } else {
                setShowSquadSelector(false);
                setSelectorTeam(null);
            }

        } else if (selectorTeam === 'team2') {
            // Populate Innings 2 Batting
            const newBatting = selectedPlayers.map(p => ({
                name: p.name,
                runs: 0,
                balls: 0,
                fours: 0,
                sixes: 0,
                dismissalType: "nextToBat",
                dismissalBowler: "",
                dismissalFielder: ""
            }));

            setFormData(prev => ({
                ...prev,
                secondInningsBatting: newBatting
            }));

            // Close selector
            setShowSquadSelector(false);
            setSelectorTeam(null);
        }
    };

    const handleScoreChange = (team, field, value) => {
        setFormData(prev => ({
            ...prev,
            score: {
                ...prev.score,
                [team]: {
                    ...prev.score[team],
                    [field]: value === '' ? '' : Number(value)
                }
            }
        }));
    };

    // Helper to get current arrays based on tab
    const getBattingKey = () => activeTab === 'innings1' ? 'batting' : 'secondInningsBatting';
    const getBowlingKey = () => activeTab === 'innings1' ? 'bowling' : 'secondInningsBowling';

    // Batting Array Change Handler
    const handleBattingChange = (index, field, value) => {
        const key = getBattingKey();
        setFormData(prev => {
            const newBatting = [...(prev[key] || [])];
            if (!newBatting[index]) {
                newBatting[index] = { name: "", runs: "", balls: "", fours: "", sixes: "", dismissalType: "nextToBat", dismissalBowler: "", dismissalFielder: "" };
            }
            newBatting[index] = {
                ...newBatting[index],
                [field]: (['runs', 'balls', 'fours', 'sixes'].includes(field)) ? (value === '' ? '' : Number(value)) : value
            };

            // Clear conditional fields if dismissal type changes
            if (field === 'dismissalType') {
                if (value === 'notOut') {
                    newBatting[index].dismissalBowler = "";
                    newBatting[index].dismissalFielder = "";
                } else if (value === 'lbw' || value === 'bowled') {
                    newBatting[index].dismissalFielder = "";
                } else if (value === 'runOut') {
                    newBatting[index].dismissalBowler = "";
                }
            }
            return { ...prev, [key]: newBatting };
        });
    };

    const handleBowlingChange = (index, field, value) => {
        const key = getBowlingKey();
        setFormData(prev => {
            const newBowling = [...(prev[key] || [])];
            if (!newBowling[index]) {
                newBowling[index] = { name: "", overs: "", runs: "", wickets: "" };
            }
            newBowling[index] = {
                ...newBowling[index],
                [field]: (['overs', 'runs', 'wickets', 'extras'].includes(field)) ? (value === '' ? '' : Number(value)) : value
            };
            return { ...prev, [key]: newBowling };
        });
    };

    const addBowler = (e) => {
        if (e) e.preventDefault();

        // Determine bowling team (Opposite of batting team)
        const battingTeam = activeTab === 'innings1' ? formData.team1 : formData.team2;
        const bowlingTeamName = activeTab === 'innings1' ? formData.team2 : formData.team1;

        setBowlingTeam(bowlingTeamName);
        setShowBowlerSelector(true);
    };

    const handleBowlerSelect = (selectedPlayers) => {
        if (selectedPlayers.length === 0) return;

        const player = selectedPlayers[0];
        const key = getBowlingKey();

        setFormData(prev => {
            const currentList = prev[key];
            const listArray = Array.isArray(currentList) ? currentList : [];
            // Add new bowler
            return {
                ...prev,
                [key]: [...listArray, { name: player.name, overs: "", runs: "", wickets: "", extras: "" }]
            };
        });

        setShowBowlerSelector(false);
        setBowlingTeam(null);
    };

    const removeBowler = (index) => {
        const key = getBowlingKey();
        if (window.confirm("Are you sure you want to remove this bowler?")) {
            setFormData(prev => ({
                ...prev,
                [key]: prev[key].filter((_, i) => i !== index)
            }));
        }
    };

    const initBatting = () => {
        const key = getBattingKey();
        if (!formData[key] || !Array.isArray(formData[key])) {
            const initialBatting = Array(11).fill(null).map(() => ({
                name: "", runs: "", balls: "", fours: "", sixes: "",
                dismissalType: "nextToBat", dismissalBowler: "", dismissalFielder: ""
            }));
            setFormData(prev => ({
                ...prev,
                [key]: initialBatting
            }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        updateMatch(match.id, formData);
        onClose();
    };

    // Derived state for display
    const currentBatting = formData[getBattingKey()];
    const currentBowling = formData[getBowlingKey()];

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
                            <select
                                name="team1"
                                value={formData.team1}
                                onChange={handleChange}
                                className="w-full glass-input p-2 rounded-lg font-bold text-blue-300"
                            >
                                <option value="" className="bg-slate-900 text-gray-400">Select Team</option>
                                {allTeams && allTeams.map((team, idx) => (
                                    <option key={idx} value={team} className="bg-slate-900 text-white">{team}</option>
                                ))}
                            </select>
                        </div>
                        <div className="md:col-span-1">
                            <label className="block text-xs font-bold mb-1 text-gray-400 uppercase tracking-wider">Team 2</label>
                            <select
                                name="team2"
                                value={formData.team2}
                                onChange={handleChange}
                                className="w-full glass-input p-2 rounded-lg font-bold text-purple-300"
                            >
                                <option value="" className="bg-slate-900 text-gray-400">Select Team</option>
                                {allTeams && allTeams.map((team, idx) => (
                                    <option key={idx} value={team} className="bg-slate-900 text-white">{team}</option>
                                ))}
                            </select>
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
                            <label className="block text-xs font-bold mb-1 text-gray-400 uppercase tracking-wider">Over Choosen</label>
                            <select
                                name="oversChoosen"
                                value={formData.oversChoosen || '6 Over'}
                                onChange={handleChange}
                                className="w-full glass-input p-2 rounded-lg text-gray-300"
                            >
                                <option value="6 Over" className="bg-slate-900">6 Over</option>
                                <option value="8 Over" className="bg-slate-900">8 Over</option>
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
                                <input type="number" placeholder="Runs" value={formData.score.team1.runs} onChange={(e) => handleScoreChange('team1', 'runs', e.target.value)} className="w-full glass-input p-2 rounded text-center font-mono text-lg" disabled title="Auto-calculated" />
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
                                <input type="number" placeholder="Runs" value={formData.score.team2.runs} onChange={(e) => handleScoreChange('team2', 'runs', e.target.value)} className="w-full glass-input p-2 rounded text-center font-mono text-lg" disabled title="Auto-calculated" />
                                <input type="number" placeholder="Wkts" value={formData.score.team2.wickets} onChange={(e) => handleScoreChange('team2', 'wickets', e.target.value)} className="w-full glass-input p-2 rounded text-center font-mono text-lg" />
                                <input type="number" placeholder="Overs" value={formData.score.team2.overs} onChange={(e) => handleScoreChange('team2', 'overs', e.target.value)} className="w-full glass-input p-2 rounded text-center font-mono text-lg" step="0.1" />
                            </div>
                        </div>
                    </div>

                    {/* Innings Tabs */}
                    <div className="flex gap-4 border-b border-white/10 mb-6">
                        <button
                            type="button"
                            onClick={() => setActiveTab('innings1')}
                            className={`pb-2 px-4 font-bold transition-colors border-b-2 ${activeTab === 'innings1'
                                ? 'border-yellow-500 text-yellow-500'
                                : 'border-transparent text-gray-400 hover:text-gray-300'
                                }`}
                        >
                            1st Innings ({formData.team1})
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('innings2')}
                            className={`pb-2 px-4 font-bold transition-colors border-b-2 ${activeTab === 'innings2'
                                ? 'border-yellow-500 text-yellow-500'
                                : 'border-transparent text-gray-400 hover:text-gray-300'
                                }`}
                        >
                            2nd Innings ({formData.team2})
                        </button>
                    </div>

                    {/* Current Batting Details */}
                    <div className="border-b border-white/10 pb-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-white flex items-center gap-2">
                                <span className="w-1.5 h-6 bg-yellow-500 rounded-full inline-block"></span>
                                Batting: {activeTab === 'innings1' ? formData.team1 : formData.team2}
                            </h3>
                            <button type="button" onClick={initBatting} className="text-xs text-blue-400 hover:text-blue-300 px-3 py-1 rounded-full bg-blue-500/10 hover:bg-blue-500/20 transition-colors">Initialize (11 Players)</button>
                        </div>
                        {currentBatting && Array.isArray(currentBatting) && (
                            <div className="space-y-4">
                                {/* Header Row */}
                                <div className="grid grid-cols-12 gap-2 text-xs font-bold text-gray-400 uppercase mb-2 text-center">
                                    <div className="col-span-1 text-left">#</div>
                                    <div className="col-span-3 text-left">Player Name</div>
                                    <div className="col-span-2 text-left">Status</div>
                                    <div className="col-span-3 text-left">Details</div>
                                    <div className="col-span-3 grid grid-cols-4 gap-1">
                                        <div>R</div>
                                        <div>B</div>
                                        <div>4s</div>
                                        <div>6s</div>
                                    </div>
                                </div>

                                {currentBatting.map((batter, idx) => (
                                    <div key={idx} className="bg-white/5 p-3 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                                        <div className="grid grid-cols-12 gap-2 items-start">
                                            <div className="col-span-1 text-gray-500 font-mono text-sm pt-2">{idx + 1}</div>
                                            <div className="col-span-3">
                                                <input
                                                    type="text"
                                                    placeholder={`Batter ${idx + 1}`}
                                                    value={batter.name}
                                                    onChange={(e) => handleBattingChange(idx, 'name', e.target.value)}
                                                    className="w-full glass-input p-2 rounded text-sm mb-1"
                                                />
                                            </div>
                                            <div className="col-span-2">
                                                <select
                                                    value={batter.dismissalType || "nextToBat"}
                                                    onChange={(e) => handleBattingChange(idx, 'dismissalType', e.target.value)}
                                                    className="w-full glass-input p-2 rounded text-xs"
                                                >
                                                    <option value="notOut" className="bg-slate-900">Not Out</option>
                                                    <option value="lbw" className="bg-slate-900">LBW</option>
                                                    <option value="caught" className="bg-slate-900">Caught</option>
                                                    <option value="stumping" className="bg-slate-900">Stumping</option>
                                                    <option value="runOut" className="bg-slate-900">Run Out</option>
                                                    <option value="nextToBat" className="bg-slate-900">Next-to-bat</option>
                                                </select>
                                            </div>

                                            {/* Conditional Dismissal Inputs */}
                                            <div className="col-span-3 space-y-2">
                                                {['lbw', 'caught', 'stumping'].includes(batter.dismissalType) && (
                                                    <input
                                                        type="text"
                                                        placeholder="Bowler Name"
                                                        value={batter.dismissalBowler || ""}
                                                        onChange={(e) => handleBattingChange(idx, 'dismissalBowler', e.target.value)}
                                                        className="w-full glass-input p-1.5 rounded text-xs border-l-2 border-red-500/50"
                                                    />
                                                )}
                                                {['caught', 'stumping', 'runOut'].includes(batter.dismissalType) && (
                                                    <input
                                                        type="text"
                                                        placeholder={batter.dismissalType === 'runOut' ? "Fielder Name" : (batter.dismissalType === 'stumping' ? "Wicket Keeper" : "Fielder Name")}
                                                        value={batter.dismissalFielder || ""}
                                                        onChange={(e) => handleBattingChange(idx, 'dismissalFielder', e.target.value)}
                                                        className="w-full glass-input p-1.5 rounded text-xs border-l-2 border-yellow-500/50"
                                                    />
                                                )}
                                            </div>

                                            <div className="col-span-3 grid grid-cols-4 gap-1">
                                                <input
                                                    type="number"
                                                    value={batter.runs}
                                                    onChange={(e) => handleBattingChange(idx, 'runs', e.target.value)}
                                                    className="w-full glass-input p-2 rounded text-center text-sm font-bold text-white"
                                                    placeholder="0"
                                                />
                                                <input
                                                    type="number"
                                                    value={batter.balls}
                                                    onChange={(e) => handleBattingChange(idx, 'balls', e.target.value)}
                                                    className="w-full glass-input p-2 rounded text-center text-sm"
                                                    placeholder="0"
                                                />
                                                <input
                                                    type="number"
                                                    value={batter.fours}
                                                    onChange={(e) => handleBattingChange(idx, 'fours', e.target.value)}
                                                    className="w-full glass-input p-2 rounded text-center text-sm text-gray-400"
                                                    placeholder="0"
                                                />
                                                <input
                                                    type="number"
                                                    value={batter.sixes}
                                                    onChange={(e) => handleBattingChange(idx, 'sixes', e.target.value)}
                                                    className="w-full glass-input p-2 rounded text-center text-sm text-gray-400"
                                                    placeholder="0"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {currentBatting && Array.isArray(currentBatting) && (
                            <div className="mt-4 flex justify-end items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                                <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">Innings Extras:</label>
                                <input
                                    type="number"
                                    value={activeTab === 'innings1' ? (formData.score.team1.extras || 0) : (formData.score.team2.extras || 0)}
                                    readOnly
                                    className="glass-input p-2 rounded text-center w-24 font-bold text-yellow-400 bg-black/20 cursor-not-allowed"
                                    placeholder="0"
                                    title="Calculated from Over-by-Over Extras"
                                />
                            </div>
                        )}
                    </div>

                    {/* Bowling Details */}
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-white flex items-center gap-2">
                                <span className="w-1.5 h-6 bg-red-500 rounded-full inline-block"></span>
                                Bowling: {activeTab === 'innings1' ? formData.team2 : formData.team1}
                            </h3>
                            <button type="button" onClick={addBowler} className="text-xs text-white bg-green-600 hover:bg-green-500 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1">
                                + Add Bowler
                            </button>
                        </div>
                        {currentBowling && Array.isArray(currentBowling) && (
                            <div className="space-y-2">
                                <div className="grid grid-cols-12 gap-2 text-xs font-bold text-gray-400 uppercase mb-2 text-center">
                                    <div className="col-span-1 text-left">#</div>
                                    <div className="col-span-4 text-left">Bowler Name</div>
                                    <div className="col-span-2">Overs</div>
                                    <div className="col-span-2">Runs</div>
                                    <div className="col-span-2">Wickets</div>
                                    <div className="col-span-1"></div>
                                </div>
                                {currentBowling.map((bowler, idx) => (
                                    <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                                        <div className="col-span-1 text-gray-500 font-mono text-sm">{idx + 1}</div>
                                        <div className="col-span-4">
                                            <input
                                                type="text"
                                                placeholder={`Bowler ${idx + 1}`}
                                                value={bowler.name}
                                                onChange={(e) => handleBowlingChange(idx, 'name', e.target.value)}
                                                className="w-full glass-input p-2 rounded text-sm"
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <input
                                                type="number"
                                                step="0.1"
                                                value={bowler.overs}
                                                onChange={(e) => handleBowlingChange(idx, 'overs', e.target.value)}
                                                className="w-full glass-input p-2 rounded text-center text-sm"
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <input
                                                type="number"
                                                value={bowler.runs}
                                                onChange={(e) => handleBowlingChange(idx, 'runs', e.target.value)}
                                                className="w-full glass-input p-2 rounded text-center text-sm"
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <input
                                                type="number"
                                                value={bowler.wickets}
                                                onChange={(e) => handleBowlingChange(idx, 'wickets', e.target.value)}
                                                className="w-full glass-input p-2 rounded text-center text-sm font-bold text-red-400"
                                            />
                                        </div>
                                        <div className="col-span-1 flex justify-center">
                                            <button
                                                type="button"
                                                onClick={() => removeBowler(idx)}
                                                className="text-red-400 hover:text-red-300 hover:bg-red-400/10 p-1.5 rounded-lg transition-colors"
                                                title="Remove Bowler"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Detailed Over Scoring */}
                    <div className="border-t border-white/10 pt-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-white flex items-center gap-2">
                                <span className="w-1.5 h-6 bg-green-500 rounded-full inline-block"></span>
                                Over-by-Over Scoring ({activeTab === 'innings1' ? '1st Innings' : '2nd Innings'})
                            </h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {(activeTab === 'innings1' ? formData.innings1Overs : formData.innings2Overs)?.map((overData, overIdx) => (
                                <div key={overIdx} className="glass-card p-3 rounded-xl border border-white/10">
                                    <div className="flex justify-between items-center mb-2 border-b border-white/10 pb-1">
                                        <h4 className="font-bold text-sm text-gray-300">Over {overData.over}</h4>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-gray-500">Total:</span>
                                            <span className="text-xs font-mono bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded font-bold">
                                                {(overData.balls.reduce((sum, ball) => sum + (Number(ball) || 0), 0) + (Number(overData.extras) || 0))}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Bowler Name Input */}
                                    <div className="mb-2">
                                        <input
                                            type="text"
                                            placeholder="Bowler Name"
                                            value={overData.bowler || ""}
                                            onChange={(e) => {
                                                const key = activeTab === 'innings1' ? 'innings1Overs' : 'innings2Overs';
                                                setFormData(prev => {
                                                    const newOvers = [...(prev[key] || [])];
                                                    newOvers[overIdx] = { ...newOvers[overIdx], bowler: e.target.value };
                                                    return { ...prev, [key]: newOvers };
                                                });
                                            }}
                                            className="w-full glass-input p-1.5 rounded text-xs text-gray-300 placeholder-gray-600 mb-1"
                                        />
                                    </div>

                                    <div className="grid grid-cols-6 gap-1 mb-2">
                                        {overData.balls.map((ball, ballIdx) => (
                                            <input
                                                key={ballIdx}
                                                type="text"
                                                value={ball}
                                                onChange={(e) => {
                                                    const key = activeTab === 'innings1' ? 'innings1Overs' : 'innings2Overs';
                                                    setFormData(prev => {
                                                        const newOvers = [...(prev[key] || [])];
                                                        const newBalls = [...newOvers[overIdx].balls];
                                                        newBalls[ballIdx] = e.target.value;
                                                        newOvers[overIdx] = { ...newOvers[overIdx], balls: newBalls };
                                                        return { ...prev, [key]: newOvers };
                                                    });
                                                }}
                                                className="w-full glass-input p-1.5 rounded text-center text-xs font-bold"
                                                placeholder="0"
                                            />
                                        ))}
                                    </div>

                                    <div className="flex items-center justify-between gap-2 mb-2 bg-white/5 p-1.5 rounded">
                                        <label className="text-xs text-gray-400 font-bold uppercase">Extras</label>
                                        <input
                                            type="number"
                                            value={overData.extras || ""}
                                            onChange={(e) => {
                                                const key = activeTab === 'innings1' ? 'innings1Overs' : 'innings2Overs';
                                                setFormData(prev => {
                                                    const newOvers = [...(prev[key] || [])];
                                                    newOvers[overIdx] = { ...newOvers[overIdx], extras: e.target.value };
                                                    return { ...prev, [key]: newOvers };
                                                });
                                            }}
                                            className="w-16 glass-input p-1 rounded text-center text-xs font-bold text-yellow-400"
                                            placeholder="0"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const key = activeTab === 'innings1' ? 'innings1Overs' : 'innings2Overs';
                                                setFormData(prev => {
                                                    const newOvers = [...(prev[key] || [])];
                                                    const newBalls = [...newOvers[overIdx].balls, ""];
                                                    newOvers[overIdx] = { ...newOvers[overIdx], balls: newBalls };
                                                    return { ...prev, [key]: newOvers };
                                                });
                                            }}
                                            className="w-full py-1 text-xs bg-green-500/10 hover:bg-green-500/20 rounded transition-colors text-green-400 hover:text-green-300 flex items-center justify-center gap-1"
                                        >
                                            <span>+ Insert</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const key = activeTab === 'innings1' ? 'innings1Overs' : 'innings2Overs';
                                                setFormData(prev => {
                                                    const newOvers = [...(prev[key] || [])];
                                                    if (newOvers[overIdx].balls.length > 0) {
                                                        const newBalls = newOvers[overIdx].balls.slice(0, -1);
                                                        newOvers[overIdx] = { ...newOvers[overIdx], balls: newBalls };
                                                    }
                                                    return { ...prev, [key]: newOvers };
                                                });
                                            }}
                                            className="w-full py-1 text-xs bg-red-500/10 hover:bg-red-500/20 rounded transition-colors text-red-400 hover:text-red-300 flex items-center justify-center gap-1"
                                        >
                                            <span>- Delete</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </form>

                <div className="p-4 border-t border-white/10 flex justify-end bg-white/5 backdrop-blur-md">
                    <button type="submit" onClick={handleSubmit} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-full font-bold flex items-center gap-2 shadow-lg hover:shadow-blue-500/40 transition-all hover:scale-105">
                        <Save size={20} /> Save Updates
                    </button>
                </div>
            </div>

            {/* Squad Selector Modal for Batting XI */}
            {showSquadSelector && (
                <SquadSelector
                    key={selectorTeam === 'team1' ? formData.team1 : formData.team2}
                    teamName={selectorTeam === 'team1' ? formData.team1 : formData.team2}
                    availablePlayers={players || []}
                    onSave={handleSquadSave}
                    onCancel={() => { setShowSquadSelector(false); setSelectorTeam(null); }}
                />
            )}

            {/* Squad Selector Modal for Adding Bowler */}
            {showBowlerSelector && (
                <SquadSelector
                    key={'bowler-' + bowlingTeam}
                    teamName={bowlingTeam}
                    availablePlayers={players || []}
                    onSave={handleBowlerSelect}
                    onCancel={() => { setShowBowlerSelector(false); setBowlingTeam(null); }}
                    maxSelection={1}
                    title="Select New Bowler"
                />
            )}
        </div>
    );
};

export default ScoreUpdateForm;
