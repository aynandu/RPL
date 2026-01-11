import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { X, Save, Trash2, UserPlus } from 'lucide-react';
import SquadSelector from './SquadSelector';

const ScoreUpdateForm = ({ match, onClose }) => {
    const { updateMatch, allTeams, players } = useGame(); // Get players from context
    const [formData, setFormData] = useState({ ...match, oversChoosen: match.oversChoosen || '6 Over' });
    const [activeTab, setActiveTab] = useState('innings1'); // 'innings1' or 'innings2'

    // Squad Selector State
    const [showSquadSelector, setShowSquadSelector] = useState(false);
    const [selectorTeam, setSelectorTeam] = useState(null); // 'team1' or 'team2'

    // Bowler Selector State for "Add Bowler" list
    const [showBowlerSelector, setShowBowlerSelector] = useState(false);
    const [bowlingTeam, setBowlingTeam] = useState(null);

    // Over-specific Bowler Selector State
    const [showOverSelector, setShowOverSelector] = useState(false);
    const [activeOverIndex, setActiveOverIndex] = useState(null);

    useEffect(() => {
        setFormData({ ...match, oversChoosen: match.oversChoosen || '6 Over' });
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
                            newOvers.push({ over: i + 1, balls: Array(6).fill(""), bowler: "", extras: "", wickets: "" });
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
    // Auto-calculate Team Runs and Innings Extras from Over Cards
    useEffect(() => {
        const calculateInningsStats = (oversList) => {
            if (!oversList || !Array.isArray(oversList)) return { totalRuns: 0, totalExtras: 0 };

            let runs = 0;
            let extras = 0;

            oversList.forEach(over => {
                const overExtras = Number(over.extras) || 0;
                const ballRuns = over.balls.reduce((acc, ball) => acc + (Number(ball) || 0), 0);

                runs += ballRuns + overExtras;
                extras += overExtras;
            });

            return { totalRuns: runs, totalExtras: extras };
        };

        const stats1 = calculateInningsStats(formData.innings1Overs);
        const stats2 = calculateInningsStats(formData.innings2Overs);

        // Only update if changed to prevent loops
        setFormData(prev => {
            // Check if current matches calculated to avoid unnecessary re-renders
            if (prev.score.team1.runs === stats1.totalRuns &&
                prev.score.team1.extras === stats1.totalExtras &&
                prev.score.team2.runs === stats2.totalRuns &&
                prev.score.team2.extras === stats2.totalExtras) {
                return prev;
            }

            return {
                ...prev,
                score: {
                    ...prev.score,
                    team1: { ...prev.score.team1, runs: stats1.totalRuns, extras: stats1.totalExtras },
                    team2: { ...prev.score.team2, runs: stats2.totalRuns, extras: stats2.totalExtras }
                }
            };
        });
    }, [formData.innings1Overs, formData.innings2Overs]);

    // Auto-calculate Total Overs from Bowling Stats
    useEffect(() => {
        const sumOvers = (bowlingList) => {
            if (!bowlingList || !Array.isArray(bowlingList)) return 0;
            let totalBalls = 0;
            bowlingList.forEach(b => {
                const ov = Number(b.overs) || 0;
                const fullOvers = Math.floor(ov);
                const balls = Math.round((ov - fullOvers) * 10);
                totalBalls += (fullOvers * 6) + balls;
            });
            const finalOvers = Math.floor(totalBalls / 6);
            const finalBalls = totalBalls % 6;
            return Number(`${finalOvers}.${finalBalls}`);
        };

        const countWickets = (battingList) => {
            if (!battingList || !Array.isArray(battingList)) return 0;
            return battingList.filter(p => p.dismissalType && p.dismissalType !== 'notOut' && p.dismissalType !== 'nextToBat').length;
        };

        const overs1 = sumOvers(formData.bowling); // Team 2 bowling against Team 1
        const overs2 = sumOvers(formData.secondInningsBowling); // Team 1 bowling against Team 2

        const wickets1 = countWickets(formData.batting);
        const wickets2 = countWickets(formData.secondInningsBatting);

        setFormData(prev => {
            if (prev.score.team1.overs === overs1 &&
                prev.score.team2.overs === overs2 &&
                prev.score.team1.wickets === wickets1 &&
                prev.score.team2.wickets === wickets2) return prev;

            return {
                ...prev,
                score: {
                    ...prev.score,
                    team1: { ...prev.score.team1, overs: overs1, wickets: wickets1 },
                    team2: { ...prev.score.team2, overs: overs2, wickets: wickets2 }
                }
            };
        });
    }, [formData.bowling, formData.secondInningsBowling, formData.batting, formData.secondInningsBatting]);

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
                newBowling[index] = { name: "", overs: "", maidens: "", runs: "", wickets: "" };
            }
            newBowling[index] = {
                ...newBowling[index],
                [field]: (['overs', 'maidens', 'runs', 'wickets'].includes(field)) ? (value === '' ? '' : Number(value)) : value
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
                [key]: [...listArray, { name: player.name, overs: "", maidens: "", runs: "", wickets: "", extras: "" }]
            };
        });

        setShowBowlerSelector(false);
        setBowlingTeam(null);
        setBowlingTeam(null);
    };

    const handleOverBowlerClick = (index) => {
        // Determine bowling team (Opposite of batting team)
        const bowlingTeamName = activeTab === 'innings1' ? formData.team2 : formData.team1;
        setBowlingTeam(bowlingTeamName);
        setActiveOverIndex(index);
        setShowOverSelector(true);
    };

    const handleOverBowlerSelect = (selectedPlayers) => {
        if (selectedPlayers.length === 0) return;
        const player = selectedPlayers[0];
        const key = activeTab === 'innings1' ? 'innings1Overs' : 'innings2Overs';

        setFormData(prev => {
            const newOvers = [...(prev[key] || [])];
            newOvers[activeOverIndex] = { ...newOvers[activeOverIndex], bowler: player.name };
            return { ...prev, [key]: newOvers };
        });

        setShowOverSelector(false);
        setBowlingTeam(null);
        setActiveOverIndex(null);
    };

    const handleSaveOver = (overIndex) => {
        const key = activeTab === 'innings1' ? 'innings1Overs' : 'innings2Overs';
        const bowlingKey = getBowlingKey();
        const overData = formData[key][overIndex];

        if (!overData || !overData.bowler) {
            alert("Please select a bowler for this over first.");
            return;
        }

        // Calculate stats for this over
        const runsFromBalls = overData.balls.reduce((sum, ball) => sum + (Number(ball) || 0), 0);
        const extras = Number(overData.extras) || 0;
        const totalRuns = runsFromBalls + extras;
        const wickets = (Number(overData.wickets) || 0) + overData.balls.filter(b => b === 'W' || b === 'w').length; // Assuming 'W' in balls counts as wicket too, or just user input field. User asked for "wkts" field to map.
        // Let's stick to the user request: "value in total on overcard to runs", "value in wkts on overcard to wickets".
        // The "Total" displayed on the card includes ball runs + extras.

        // Re-calcing total exactly as displayed
        const displayedTotal = runsFromBalls + extras;
        const inputWickets = Number(overData.wickets) || 0;
        const isMaiden = displayedTotal === 0;

        setFormData(prev => {
            let currentBowling = [...(prev[bowlingKey] || [])];

            // 1. REVERT previous stats if this over was already saved
            if (overData.savedStats) {
                const { bowlerName, runs, wickets, isMaiden: wasMaiden } = overData.savedStats;
                const oldBowlerIndex = currentBowling.findIndex(b => b.name === bowlerName);

                if (oldBowlerIndex !== -1) {
                    const oldBowler = currentBowling[oldBowlerIndex];
                    currentBowling[oldBowlerIndex] = {
                        ...oldBowler,
                        overs: Math.max(0, (Number(oldBowler.overs) || 0) - 1),
                        runs: Math.max(0, (Number(oldBowler.runs) || 0) - runs),
                        wickets: Math.max(0, (Number(oldBowler.wickets) || 0) - wickets),
                        maidens: Math.max(0, (Number(oldBowler.maidens) || 0) - (wasMaiden ? 1 : 0))
                    };
                }
            }

            // 2. APPLY new stats
            const bowlerIndex = currentBowling.findIndex(b => b.name === overData.bowler);

            if (bowlerIndex !== -1) {
                // Update existing bowler
                const bowler = currentBowling[bowlerIndex];
                currentBowling[bowlerIndex] = {
                    ...bowler,
                    overs: (Number(bowler.overs) || 0) + 1,
                    runs: (Number(bowler.runs) || 0) + displayedTotal,
                    wickets: (Number(bowler.wickets) || 0) + inputWickets,
                    maidens: (Number(bowler.maidens) || 0) + (isMaiden ? 1 : 0)
                };
            } else {
                // Add new bowler
                currentBowling.push({
                    name: overData.bowler,
                    overs: 1,
                    runs: displayedTotal,
                    wickets: inputWickets,
                    maidens: isMaiden ? 1 : 0,
                    extras: 0
                });
            }

            // 3. Update the Over Data object with the new "savedStats"
            const newOvers = [...prev[key]];
            newOvers[overIndex] = {
                ...overData,
                savedStats: {
                    bowlerName: overData.bowler,
                    runs: displayedTotal,
                    wickets: inputWickets,
                    isMaiden: isMaiden
                }
            };

            return { ...prev, [bowlingKey]: currentBowling, [key]: newOvers };
        });

        // Visual feedback (optional but good)
        // alert(`Saved Over ${overData.over} for ${overData.bowler}`);
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
        alert('Match updates saved successfully!');
        // onClose(); // Keep window open as per user request
    };

    // Derived state for display
    const currentBatting = formData[getBattingKey()];
    const currentBowling = formData[getBowlingKey()];

    const handleClearOver = (overIndex) => {
        if (window.confirm("Are you sure you want to clear this over? This will remove the stats from the bowler and reset the card.")) {
            const key = activeTab === 'innings1' ? 'innings1Overs' : 'innings2Overs';
            const bowlingKey = activeTab === 'innings1' ? 'bowling' : 'secondInningsBowling';

            setFormData(prev => {
                const newOvers = [...(prev[key] || [])];
                const savedStats = newOvers[overIndex].savedStats;
                let currentBowling = [...(prev[bowlingKey] || [])];

                // 1. Revert stats if they were saved
                if (savedStats) {
                    const { bowlerName, runs, wickets, isMaiden: wasMaiden } = savedStats;
                    const oldBowlerIndex = currentBowling.findIndex(b => b.name === bowlerName);

                    if (oldBowlerIndex !== -1) {
                        const oldBowler = currentBowling[oldBowlerIndex];
                        currentBowling[oldBowlerIndex] = {
                            ...oldBowler,
                            overs: Math.max(0, (Number(oldBowler.overs) || 0) - 1),
                            runs: Math.max(0, (Number(oldBowler.runs) || 0) - runs),
                            wickets: Math.max(0, (Number(oldBowler.wickets) || 0) - wickets),
                            maidens: Math.max(0, (Number(oldBowler.maidens) || 0) - (wasMaiden ? 1 : 0))
                        };
                    }
                }

                // 2. Clear the card
                newOvers[overIndex] = {
                    over: newOvers[overIndex].over, // Keep over number
                    balls: Array(6).fill(""),
                    bowler: "",
                    extras: "",
                    wickets: "",
                    extras: "",
                    wickets: "",
                    savedStats: null, // Reset saved status
                    ballAssignments: {} // Reset assignments
                };
                return { ...prev, [key]: newOvers, [bowlingKey]: currentBowling };
            });
            // Also reset active over index if it was this one
            if (activeOverIndex === overIndex) {
                setActiveOverIndex(null);
                setShowOverSelector(false);
            }
        }
    };

    // State for Ball-by-Ball Batter Assignment
    const [showBallBatterSelector, setShowBallBatterSelector] = useState(false);
    const [pendingBallUpdate, setPendingBallUpdate] = useState(null);

    const handleBallInputChange = (overIdx, ballIdx, value) => {
        // 1. Update the visual state immediately
        const key = activeTab === 'innings1' ? 'innings1Overs' : 'innings2Overs';
        setFormData(prev => {
            const newOvers = [...(prev[key] || [])];
            const newBalls = [...newOvers[overIdx].balls];
            newBalls[ballIdx] = value;
            newOvers[overIdx] = { ...newOvers[overIdx], balls: newBalls };
            return { ...prev, [key]: newOvers };
        });

        // 2. If it's a numeric run value (0, 1, 2, 3, 4, 6), trigger batter selector
        const numericValue = Number(value);
        if (!isNaN(numericValue) && value.trim() !== "") {
            setPendingBallUpdate({ overIdx, ballIdx, value: numericValue });
            setShowBallBatterSelector(true);
        }
    };

    const handleBallBatterSelect = (batterName) => {
        if (!pendingBallUpdate) return;
        const { value, overIdx, ballIdx } = pendingBallUpdate;
        const battingKey = activeTab === 'innings1' ? 'batting' : 'secondInningsBatting';
        const oversKey = activeTab === 'innings1' ? 'innings1Overs' : 'innings2Overs';

        setFormData(prev => {
            let currentBatting = [...(prev[battingKey] || [])];
            const newOvers = [...(prev[oversKey] || [])];

            // Initialize assignments object if missing
            if (!newOvers[overIdx].ballAssignments) {
                newOvers[overIdx] = { ...newOvers[overIdx], ballAssignments: {} };
            }

            const assignments = { ...newOvers[overIdx].ballAssignments };
            const previousAssignment = assignments[ballIdx];

            // 1. REVERT previous assignment if exists
            if (previousAssignment) {
                const prevBatterIndex = currentBatting.findIndex(b => b.name === previousAssignment.batter);
                if (prevBatterIndex !== -1) {
                    const prevBatter = currentBatting[prevBatterIndex];
                    currentBatting[prevBatterIndex] = {
                        ...prevBatter,
                        runs: Math.max(0, (Number(prevBatter.runs) || 0) - previousAssignment.value),
                        balls: Math.max(0, (Number(prevBatter.balls) || 0) - 1),
                        fours: Math.max(0, (Number(prevBatter.fours) || 0) - (previousAssignment.value === 4 ? 1 : 0)),
                        sixes: Math.max(0, (Number(prevBatter.sixes) || 0) - (previousAssignment.value === 6 ? 1 : 0))
                    };
                }
            }

            // 2. APPLY new assignment
            const batterIndex = currentBatting.findIndex(b => b.name === batterName);
            if (batterIndex !== -1) {
                const batter = currentBatting[batterIndex];
                currentBatting[batterIndex] = {
                    ...batter,
                    runs: (Number(batter.runs) || 0) + value,
                    balls: (Number(batter.balls) || 0) + 1,
                    fours: (Number(batter.fours) || 0) + (value === 4 ? 1 : 0),
                    sixes: (Number(batter.sixes) || 0) + (value === 6 ? 1 : 0)
                };
            }

            // 3. Update Assignment Record
            assignments[ballIdx] = { batter: batterName, value: value };
            newOvers[overIdx] = { ...newOvers[overIdx], ballAssignments: assignments };

            return { ...prev, [battingKey]: currentBatting, [oversKey]: newOvers };
        });

        setShowBallBatterSelector(false);
        setPendingBallUpdate(null);
    };

    // State for Opposition Player Selector (Dismissals)
    const [showOppositionSelector, setShowOppositionSelector] = useState(false);
    const [pendingOppositionUpdate, setPendingOppositionUpdate] = useState(null);

    const handleOppositionPlayerSelect = (playerName) => {
        if (!pendingOppositionUpdate) return;
        const { batterIndex, field } = pendingOppositionUpdate;
        handleBattingChange(batterIndex, field, playerName);
        setShowOppositionSelector(false);
        setPendingOppositionUpdate(null);
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
                            <select
                                name="manOfTheMatch"
                                value={formData.manOfTheMatch || ''}
                                onChange={handleChange}
                                className="w-full glass-input p-2 rounded-lg text-white"
                            >
                                <option value="" className="bg-slate-900 text-gray-400">Select Player</option>
                                {formData.team1 && (
                                    <optgroup label={formData.team1} className="bg-slate-900 text-blue-300">
                                        {players && players
                                            .filter(p => p.team === formData.team1)
                                            .map((p, idx) => (
                                                <option key={`t1-${idx}`} value={p.name} className="text-white">{p.name}</option>
                                            ))}
                                    </optgroup>
                                )}
                                {formData.team2 && (
                                    <optgroup label={formData.team2} className="bg-slate-900 text-purple-300">
                                        {players && players
                                            .filter(p => p.team === formData.team2)
                                            .map((p, idx) => (
                                                <option key={`t2-${idx}`} value={p.name} className="text-white">{p.name}</option>
                                            ))}
                                    </optgroup>
                                )}
                            </select>
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
                                                    <option value="bowled" className="bg-slate-900">Bowled</option>
                                                    <option value="lbw" className="bg-slate-900">LBW</option>
                                                    <option value="caught" className="bg-slate-900">Caught</option>
                                                    <option value="stumping" className="bg-slate-900">Stumping</option>
                                                    <option value="runOut" className="bg-slate-900">Run Out</option>
                                                    <option value="nextToBat" className="bg-slate-900">Next-to-bat</option>
                                                </select>
                                            </div>

                                            {/* Conditional Dismissal Inputs */}
                                            <div className="col-span-3 space-y-2">
                                                {['lbw', 'caught', 'stumping', 'bowled'].includes(batter.dismissalType) && (
                                                    <input
                                                        type="text"
                                                        placeholder="Select Bowler"
                                                        value={batter.dismissalBowler || ""}
                                                        onClick={() => {
                                                            setPendingOppositionUpdate({ batterIndex: idx, field: 'dismissalBowler' });
                                                            setShowOppositionSelector(true);
                                                        }}
                                                        readOnly
                                                        className="w-full glass-input p-1.5 rounded text-xs border-l-2 border-red-500/50 cursor-pointer hover:bg-white/10"
                                                    />
                                                )}
                                                {['caught', 'stumping', 'runOut'].includes(batter.dismissalType) && (
                                                    <input
                                                        type="text"
                                                        placeholder={batter.dismissalType === 'runOut' ? "Select Fielder" : (batter.dismissalType === 'stumping' ? "Select Keeper" : "Select Fielder")}
                                                        value={batter.dismissalFielder || ""}
                                                        onClick={() => {
                                                            setPendingOppositionUpdate({ batterIndex: idx, field: 'dismissalFielder' });
                                                            setShowOppositionSelector(true);
                                                        }}
                                                        readOnly
                                                        className="w-full glass-input p-1.5 rounded text-xs border-l-2 border-yellow-500/50 cursor-pointer hover:bg-white/10"
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
                                    onChange={(e) => handleScoreChange(activeTab === 'innings1' ? 'team1' : 'team2', 'extras', e.target.value)}
                                    className="glass-input p-2 rounded text-center w-24 font-bold text-yellow-400"
                                    placeholder="0"
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
                                    <div className="col-span-3 text-left">Bowler Name</div>
                                    <div className="col-span-1">O</div>
                                    <div className="col-span-1">M</div>
                                    <div className="col-span-1">R</div>
                                    <div className="col-span-1">W</div>
                                    <div className="col-span-2">Econ</div>
                                    <div className="col-span-1"></div>
                                </div>
                                {currentBowling.map((bowler, idx) => (
                                    <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                                        <div className="col-span-1 text-gray-500 font-mono text-sm">{idx + 1}</div>
                                        <div className="col-span-3">
                                            <input
                                                type="text"
                                                placeholder={`Bowler ${idx + 1}`}
                                                value={bowler.name}
                                                onChange={(e) => handleBowlingChange(idx, 'name', e.target.value)}
                                                className="w-full glass-input p-2 rounded text-sm"
                                            />
                                        </div>
                                        <div className="col-span-1">
                                            <input
                                                type="number"
                                                step="0.1"
                                                value={bowler.overs}
                                                onChange={(e) => handleBowlingChange(idx, 'overs', e.target.value)}
                                                className="w-full glass-input p-2 rounded text-center text-sm"
                                            />
                                        </div>
                                        <div className="col-span-1">
                                            <input
                                                type="number"
                                                value={bowler.maidens}
                                                onChange={(e) => handleBowlingChange(idx, 'maidens', e.target.value)}
                                                className="w-full glass-input p-2 rounded text-center text-sm"
                                                placeholder="0"
                                            />
                                        </div>
                                        <div className="col-span-1">
                                            <input
                                                type="number"
                                                value={bowler.runs}
                                                onChange={(e) => handleBowlingChange(idx, 'runs', e.target.value)}
                                                className="w-full glass-input p-2 rounded text-center text-sm"
                                            />
                                        </div>
                                        <div className="col-span-1">
                                            <input
                                                type="number"
                                                value={bowler.wickets}
                                                onChange={(e) => handleBowlingChange(idx, 'wickets', e.target.value)}
                                                className="w-full glass-input p-2 rounded text-center text-sm font-bold text-red-400"
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <div className="w-full bg-black/20 p-2 rounded text-center text-sm font-mono text-gray-400">
                                                {(bowler.overs > 0 ? (bowler.runs / bowler.overs).toFixed(1) : '0.0')}
                                            </div>
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
                                <div key={overIdx} className="glass-card p-3 rounded-xl border border-white/10 group">
                                    <div className="flex justify-between items-center mb-2 border-b border-white/10 pb-1">
                                        <h4 className="font-bold text-sm text-gray-300">Over {overData.over}</h4>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-gray-500">Total:</span>
                                            <span className="text-xs font-mono bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded font-bold">
                                                {(overData.balls.reduce((sum, ball) => sum + (Number(ball) || 0), 0) + (Number(overData.extras) || 0))}
                                            </span>
                                            {/* Clear Button */}
                                            <button
                                                type="button"
                                                onClick={() => handleClearOver(overIdx)}
                                                className="text-[10px] bg-red-500/10 hover:bg-red-500/20 text-red-300 px-1.5 py-0.5 rounded transition-colors"
                                                title="Clear Over"
                                            >
                                                Clear
                                            </button>
                                        </div>
                                    </div>

                                    {/* Bowler Name Input (Read-only, triggers selector) */}
                                    <div className="mb-2">
                                        <input
                                            type="text"
                                            placeholder="Select Bowler..."
                                            value={overData.bowler || ""}
                                            onClick={() => handleOverBowlerClick(overIdx)}
                                            readOnly
                                            className="w-full glass-input p-1.5 rounded text-xs text-blue-300 font-bold placeholder-gray-600 mb-1 cursor-pointer hover:bg-white/10 transition-colors text-center"
                                        />
                                    </div>

                                    <div className="grid grid-cols-6 gap-1 mb-2">
                                        {overData.balls.map((ball, ballIdx) => (
                                            <input
                                                key={ballIdx}
                                                type="text"
                                                value={ball}
                                                onChange={(e) => handleBallInputChange(overIdx, ballIdx, e.target.value)}
                                                className="w-full glass-input p-1.5 rounded text-center text-xs font-bold"
                                                placeholder="0"
                                            />
                                        ))}
                                    </div>

                                    <div className="flex items-center justify-between gap-2 mb-2">
                                        <div className="flex items-center gap-2 bg-white/5 p-1.5 rounded flex-1">
                                            <label className="text-[10px] text-gray-400 font-bold uppercase">Extras</label>
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
                                                className="w-full glass-input p-1 rounded text-center text-xs font-bold text-yellow-400"
                                                placeholder="0"
                                            />
                                        </div>
                                        <div className="flex items-center gap-2 bg-white/5 p-1.5 rounded flex-1">
                                            <label className="text-[10px] text-gray-400 font-bold uppercase">Wkts</label>
                                            <input
                                                type="text"
                                                value={overData.wickets || ""}
                                                onChange={(e) => {
                                                    const key = activeTab === 'innings1' ? 'innings1Overs' : 'innings2Overs';
                                                    setFormData(prev => {
                                                        const newOvers = [...(prev[key] || [])];
                                                        newOvers[overIdx] = { ...newOvers[overIdx], wickets: e.target.value };
                                                        return { ...prev, [key]: newOvers };
                                                    });
                                                }}
                                                className="w-full glass-input p-1 rounded text-center text-xs font-bold text-red-400 border-red-500/30"
                                                placeholder="0"
                                            />
                                        </div>
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
                                            disabled={overData.balls.length <= 6}
                                            onClick={() => {
                                                const key = activeTab === 'innings1' ? 'innings1Overs' : 'innings2Overs';
                                                setFormData(prev => {
                                                    const newOvers = [...(prev[key] || [])];
                                                    if (newOvers[overIdx].balls.length > 6) { // Safety check
                                                        const newBalls = newOvers[overIdx].balls.slice(0, -1);
                                                        newOvers[overIdx] = { ...newOvers[overIdx], balls: newBalls };
                                                    }
                                                    return { ...prev, [key]: newOvers };
                                                });
                                            }}
                                            className={`w-full py-1 text-xs rounded transition-colors flex items-center justify-center gap-1 ${overData.balls.length <= 6
                                                ? 'bg-gray-800 text-gray-600 cursor-not-allowed opacity-50'
                                                : 'bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300'
                                                }`}
                                        >
                                            <span>- Delete</span>
                                        </button>
                                    </div>

                                    {/* Save Button for Over */}
                                    <button
                                        type="button"
                                        disabled={!overData.bowler || overData.balls.some(b => b === "")}
                                        onClick={() => handleSaveOver(overIdx)}
                                        className={`w-full mt-2 py-1.5 text-xs rounded transition-colors font-bold uppercase tracking-wider ${(!overData.bowler || overData.balls.some(b => b === ""))
                                            ? 'bg-gray-800 text-gray-500 cursor-not-allowed opacity-50'
                                            : overData.savedStats
                                                ? 'bg-green-600/20 hover:bg-green-600/30 text-green-300'
                                                : 'bg-blue-600/20 hover:bg-blue-600/30 text-blue-300'
                                            }`}
                                    >
                                        {overData.savedStats ? 'Update Over' : 'Save Over'}
                                    </button>
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

            {/* Modal for Selecting Batter for Ball Assignment */}
            {showBallBatterSelector && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-[60] p-4 animate-fade-in">
                    <div className="bg-slate-900 w-full max-w-sm rounded-2xl shadow-2xl relative border border-slate-700 p-6">
                        <h3 className="text-xl font-bold text-center mb-6 text-white">Who scored {pendingBallUpdate?.value} runs?</h3>
                        <div className="grid grid-cols-1 gap-3">
                            {/* Show Not Out Batters */}
                            {(() => {
                                const battingKey = activeTab === 'innings1' ? 'batting' : 'secondInningsBatting';
                                const activeBatters = (formData[battingKey] || []).filter(p => !p.dismissalType || p.dismissalType === 'notOut');

                                if (activeBatters.length === 0) return <div className="text-gray-500 text-center italic">No active batters found.</div>;

                                return activeBatters.map((batter, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleBallBatterSelect(batter.name)}
                                        className="bg-slate-800 hover:bg-slate-700 text-white p-4 rounded-xl font-bold text-lg transition-transform hover:scale-105 border border-slate-700 flex justify-between items-center group"
                                    >
                                        <span>{batter.name}</span>
                                        <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded group-hover:bg-blue-500/30">Select</span>
                                    </button>
                                ));
                            })()}
                        </div>
                        <button
                            onClick={() => { setShowBallBatterSelector(false); setPendingBallUpdate(null); }}
                            className="w-full mt-6 py-3 text-sm text-gray-400 hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Modal for Selecting Opposition Player (Dismissals) */}
            {showOppositionSelector && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-[60] p-4 animate-fade-in">
                    <div className="bg-slate-900 w-full max-w-sm rounded-2xl shadow-2xl relative border border-slate-700 p-6 max-h-[80vh] flex flex-col">
                        <h3 className="text-xl font-bold text-center mb-6 text-white">Select Opposition Player</h3>
                        <div className="grid grid-cols-1 gap-2 overflow-y-auto custom-scrollbar flex-1">
                            {(() => {
                                const oppositionTeam = activeTab === 'innings1' ? formData.team2 : formData.team1;
                                // Try to find the squad from allTeams context first
                                const teamData = allTeams.find(t => t.name === oppositionTeam);

                                // Fallback: If we can't find teamData, maybe use bowling list if populated?
                                // But bowling list only has *current* bowlers. We need full squad.
                                // Best bet: use players from context filtering by team name.

                                let oppositionPlayers = [];
                                if (teamData && teamData.players) {
                                    oppositionPlayers = teamData.players;
                                } else if (players) {
                                    // Fallback to global players list
                                    oppositionPlayers = players.filter(p => p.team === oppositionTeam);
                                }

                                if (oppositionPlayers.length === 0) return <div className="text-gray-500 text-center italic">No players found for {oppositionTeam}.</div>;

                                return oppositionPlayers.map((player, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleOppositionPlayerSelect(player.name)}
                                        className="bg-slate-800 hover:bg-slate-700 text-white p-3 rounded-xl font-bold text-sm transition-transform hover:scale-105 border border-slate-700 flex justify-between items-center group text-left"
                                    >
                                        <span>{player.name}</span>
                                        <span className="text-[10px] bg-red-500/20 text-red-300 px-2 py-1 rounded group-hover:bg-red-500/30">Select</span>
                                    </button>
                                ));
                            })()}
                        </div>
                        <button
                            onClick={() => { setShowOppositionSelector(false); setPendingOppositionUpdate(null); }}
                            className="w-full mt-6 py-3 text-sm text-gray-400 hover:text-white transition-colors border-t border-white/5"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

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
                    key={'bowler-list-' + bowlingTeam}
                    teamName={bowlingTeam}
                    availablePlayers={players || []}
                    onSave={handleBowlerSelect}
                    onCancel={() => { setShowBowlerSelector(false); setBowlingTeam(null); }}
                    maxSelection={1}
                    title="Select New Bowler"
                />
            )}

            {/* Squad Selector for Over-specific Bowler */}
            {showOverSelector && (
                <SquadSelector
                    key={'over-bowler-' + activeOverIndex}
                    teamName={bowlingTeam}
                    availablePlayers={players || []}
                    onSave={handleOverBowlerSelect}
                    onCancel={() => { setShowOverSelector(false); setBowlingTeam(null); setActiveOverIndex(null); }}
                    maxSelection={1}
                    title={`Select Bowler for Over ${activeOverIndex + 1}`}
                />
            )}
        </div>
    );
};

export default ScoreUpdateForm;
