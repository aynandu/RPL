import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { X } from 'lucide-react';

const ScoreCard = ({ match, onClose }) => {
    const { players } = useGame();
    const [activeTab, setActiveTab] = useState('innings1');

    if (!match) return null;

    // Helper to get current innings data
    const getBattingData = () => {
        if (activeTab === 'innings1') return match.batting;
        return match.secondInningsBatting || [];
    };

    const getBowlingData = () => {
        if (activeTab === 'innings1') return match.bowling;
        // The bowling team for 2nd innings is Team 1, so we might store it in secondInningsBowling
        // But wait, usually 'bowling' in match object corresponds to the bowling of the team currently bowling.
        // In the update form:
        // Tab 1 (Team 1 batting): Batting = Team 1, Bowling = Team 2
        // Tab 2 (Team 2 batting): Batting = Team 2, Bowling = Team 1
        // So I just need to access the stored keys.
        return match.secondInningsBowling || [];
    };

    const currentBatting = getBattingData();
    const currentBowling = getBowlingData();

    // Determine which team is batting/bowling for the label
    const battingTeam = activeTab === 'innings1' ? match.team1 : match.team2;
    const bowlingTeam = activeTab === 'innings1' ? match.team2 : match.team1;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in">
            <div className="bg-slate-900 w-full max-w-4xl h-[90vh] overflow-y-auto no-scrollbar rounded-2xl shadow-2xl relative border border-slate-700">
                {/* Header */}
                <div className="sticky top-0 bg-slate-800 text-white p-4 flex justify-between items-center z-10 border-b border-slate-700">
                    <div>
                        <h2 className="text-xl font-bold">{match.team1} vs {match.team2}</h2>
                        <div className="flex flex-col">
                            <p className="text-sm opacity-80">{match.status === 'live' ? 'Create Live' : 'Match Details'}</p>
                            {match.matchType && match.matchType !== 'Group Stage' && (
                                <span className="bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-300 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded shadow-[0_0_10px_rgba(251,191,36,0.2)] border border-amber-500/30 w-fit mt-1">
                                    {match.matchType}
                                </span>
                            )}
                            <p className="text-xs opacity-70 mt-1 font-mono">
                                {match.date ? new Date(match.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                            </p>
                            <div className="flex items-center gap-1.5 mt-1 opacity-70">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                                <p className="text-xs font-medium uppercase tracking-wider text-blue-300">
                                    {match.stadium || 'Indoor Stadium, Pramdom'}
                                </p>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6 space-y-8">
                    {/* Main Score Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-center bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-inner">
                        <div>
                            <h3 className="text-2xl font-bold text-gray-100">{match.team1}</h3>
                            <p className="text-4xl font-mono font-black text-blue-400 my-2">
                                {match.score.team1.runs}/{match.score.team1.wickets}
                            </p>
                            <p className="text-gray-400">{match.score.team1.overs} Overs</p>
                        </div>
                        <div className="flex items-center justify-center relative">
                            <div className="w-px h-full bg-slate-700 hidden md:block"></div>
                            <div className="h-px w-full bg-slate-700 md:hidden"></div>

                            {(() => {
                                // Check if 1st Innings is complete
                                const isFirstInningsDone = match.innings1Overs &&
                                    match.innings1Overs.length > 0 &&
                                    match.innings1Overs.every(o => o.savedStats);

                                if (isFirstInningsDone && match.status !== 'completed') {
                                    return (
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900 px-4 py-2 rounded-xl border border-yellow-500/30 shadow-[0_0_15px_rgba(234,179,8,0.2)] flex flex-col items-center gap-1">
                                            <div className="flex flex-col items-center">
                                                <p className="text-yellow-500 text-[10px] font-bold uppercase tracking-widest leading-none mb-1">Target</p>
                                                <p className="text-xl font-mono font-black text-white leading-none">{(match.score.team1.runs || 0) + 1}</p>
                                            </div>
                                            {(() => {
                                                // Calculate match equation for 2nd innings
                                                const t2Stats = match.score.team2;
                                                const isSecondInningsStarted = t2Stats.overs > 0 || (match.batting && match.batting.length > 0 && match.status === 'live');

                                                if (match.status === 'live' && isSecondInningsStarted) {
                                                    const target = (match.score.team1.runs || 0) + 1;
                                                    const runsNeeded = target - (t2Stats.runs || 0);

                                                    // Balls Left Calculation (Assuming 20 overs match)
                                                    const totalBalls = 120; // 20 overs * 6
                                                    const currentOvers = Number(t2Stats.overs || 0);
                                                    const completedOvers = Math.floor(currentOvers);
                                                    const ballsInCurrentOver = Math.round((currentOvers - completedOvers) * 10);
                                                    const ballsBowled = (completedOvers * 6) + ballsInCurrentOver;
                                                    const ballsLeft = totalBalls - ballsBowled;

                                                    if (runsNeeded > 0 && ballsLeft >= 0) {
                                                        return null;
                                                    }
                                                }
                                                return null;
                                            })()}
                                        </div>
                                    )
                                }
                                return null;
                            })()}
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-gray-100">{match.team2}</h3>
                            <p className="text-4xl font-mono font-black text-blue-400 my-2">
                                {match.score.team2.runs}/{match.score.team2.wickets}
                            </p>
                            <p className="text-gray-400">{match.score.team2.overs} Overs</p>
                        </div>
                    </div>

                    {/* Match Equation Banner (Outside Target Table) */}
                    {(() => {
                        const t2Stats = match.score.team2;
                        const isSecondInningsStarted = t2Stats.overs > 0 || (match.batting && match.batting.length > 0 && match.status === 'live');
                        const isFirstInningsDone = match.innings1Overs && match.innings1Overs.length > 0 && match.innings1Overs.every(o => o.savedStats);

                        if (match.status === 'live' && isSecondInningsStarted && isFirstInningsDone) {
                            const target = (match.score.team1.runs || 0) + 1;
                            const runsNeeded = target - (t2Stats.runs || 0);

                            // Balls Left Calculation
                            let ballsLeft;
                            if (match.innings2Overs && match.innings2Overs.length > 0) {
                                // Calculate by counting all empty cells in the over cards
                                const totalEmpty = match.innings2Overs.reduce((acc, over) => {
                                    return acc + (over.balls ? over.balls.filter(b => b === "" || b === null).length : 6);
                                }, 0);
                                ballsLeft = totalEmpty;
                            } else {
                                // Fallback
                                const totalOversMatch = parseInt(match.oversChoosen) || 20;
                                const totalBalls = totalOversMatch * 6;
                                const currentOvers = Number(t2Stats.overs || 0);
                                const completedOvers = Math.floor(currentOvers);
                                const ballsInCurrentOver = Math.round((currentOvers - completedOvers) * 10);
                                const ballsBowled = (completedOvers * 6) + ballsInCurrentOver;
                                ballsLeft = totalBalls - ballsBowled;
                            }

                            // runsNeeded calculated above: const runsNeeded = target - (t2Stats.runs || 0);
                            const displayRunsNeeded = Math.max(0, runsNeeded);

                            if (displayRunsNeeded >= 0 && ballsLeft >= 0) {
                                return (
                                    <div className="bg-gradient-to-r from-red-900/40 via-red-900/20 to-red-900/40 border-y border-red-500/20 py-3 text-center -mt-4 mb-6 relative z-0">
                                        <p className="text-lg md:text-xl font-black text-red-300 tracking-wider uppercase animate-pulse">
                                            Need <span className="text-white">{displayRunsNeeded}</span> runs in <span className="text-white">{ballsLeft}</span> balls
                                        </p>
                                    </div>
                                );
                            }
                        }

                        // Result Text for Completed Matches
                        if (match.status === 'completed') {
                            const t1 = match.score.team1;
                            const t2 = match.score.team2;
                            let resultText = "Match Tied";
                            if (t1.runs > t2.runs) {
                                resultText = `${match.team1} won by ${t1.runs - t2.runs} runs`;
                            } else if (t2.runs > t1.runs) {
                                resultText = `${match.team2} won by ${10 - t2.wickets} wickets`;
                            }

                            return (
                                <div className="bg-gradient-to-r from-green-900/40 via-green-900/20 to-green-900/40 border-y border-green-500/20 py-3 text-center -mt-4 mb-6 relative z-0">
                                    <p className="text-lg md:text-xl font-black text-green-400 tracking-wider uppercase drop-shadow-lg">
                                        {resultText}
                                    </p>
                                </div>
                            );
                        }

                        return null;
                    })()}

                    {/* Toss Result */}
                    {(match.status === 'live' || match.status === 'completed') && match.tossResult && (
                        <div className={`text-center p-2 rounded font-bold mb-4 ${match.status === 'live' ? 'bg-cyan-900/30 border border-cyan-800 text-cyan-200' : 'bg-slate-800 border border-slate-700 text-gray-300'}`}>
                            {match.tossResult}
                        </div>
                    )}

                    {/* Innings Tabs */}
                    <div className="flex gap-4 border-b border-slate-700">
                        <button
                            onClick={() => setActiveTab('innings1')}
                            className={`pb-2 px-4 font-bold transition-colors border-b-2 ${activeTab === 'innings1'
                                ? 'border-yellow-500 text-yellow-500'
                                : 'border-transparent text-gray-400 hover:text-gray-300'
                                }`}
                        >
                            1st Innings ({match.team1})
                        </button>
                        <button
                            onClick={() => setActiveTab('innings2')}
                            className={`pb-2 px-4 font-bold transition-colors border-b-2 ${activeTab === 'innings2'
                                ? 'border-yellow-500 text-yellow-500'
                                : 'border-transparent text-gray-400 hover:text-gray-300'
                                }`}
                        >
                            2nd Innings ({match.team2})
                        </button>
                    </div>

                    {/* Batting Card */}
                    <div className="animate-slide-up">
                        <h3 className="text-lg font-bold text-gray-200 mb-3 border-b border-slate-700 pb-2 flex justify-between items-center">
                            <span>Batting: {battingTeam}</span>
                            <span className="text-xs font-normal text-gray-400 uppercase tracking-wider">Innings {activeTab === 'innings1' ? '1' : '2'}</span>
                        </h3>
                        <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
                            <table className="w-full text-sm text-gray-300">
                                <thead className="bg-slate-700 text-gray-300">
                                    <tr>
                                        <th className="p-3 text-left">Batter</th>
                                        <th className="p-3 text-right">R</th>
                                        <th className="p-3 text-right">B</th>
                                        <th className="p-3 text-right">4s</th>
                                        <th className="p-3 text-right">6s</th>
                                        <th className="p-3 text-right">SR</th>
                                        <th className="p-3 text-right text-yellow-500/70">HS</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700">
                                    {(currentBatting && Array.isArray(currentBatting)
                                        ? currentBatting.filter(b => b && b.name)
                                        : (currentBatting ? [currentBatting.striker, currentBatting.nonStriker] : []
                                        ).filter(Boolean)).map((batter, idx) => (
                                            <tr key={idx} className={idx % 2 === 0 ? "bg-slate-800" : "bg-slate-800/50"}>
                                                <td className="p-3">
                                                    <div className="font-medium text-gray-100">{batter.name}</div>
                                                    <div className="text-xs text-gray-400">
                                                        {(!batter.dismissalType || batter.dismissalType === 'notOut') && <span className="text-blue-400 font-bold">Not Out</span>}
                                                        {batter.dismissalType === 'lbw' && `lbw b ${batter.dismissalBowler}`}
                                                        {batter.dismissalType === 'caught' && `c ${batter.dismissalFielder} b ${batter.dismissalBowler}`}
                                                        {batter.dismissalType === 'stumping' && `st ${batter.dismissalFielder} b ${batter.dismissalBowler}`}
                                                        {batter.dismissalType === 'bowled' && `b ${batter.dismissalBowler}`}
                                                        {batter.dismissalType === 'runOut' && `run out (${batter.dismissalFielder})`}
                                                        {batter.dismissalType === 'nextToBat' && <span className="text-yellow-400 font-bold">Next-to-bat</span>}
                                                    </div>
                                                </td>
                                                <td className="p-3 text-right font-bold text-white">{batter.runs || 0}</td>
                                                <td className="p-3 text-right">{batter.balls || 0}</td>
                                                <td className="p-3 text-right">{batter.fours || 0}</td>
                                                <td className="p-3 text-right">{batter.sixes || 0}</td>
                                                <td className="p-3 text-right">{(batter.balls > 0 ? ((batter.runs / batter.balls) * 100).toFixed(1) : '0.0')}</td>
                                                <td className="p-3 text-right font-mono text-yellow-500/80">
                                                    {(() => {
                                                        const p = players?.find(p => p.name === batter.name && p.team === battingTeam);
                                                        return p ? (p.highestScore || '-') : '-';
                                                    })()}
                                                </td>
                                            </tr>
                                        ))}
                                    {(!currentBatting || (Array.isArray(currentBatting) && currentBatting.length === 0)) && (
                                        <tr>
                                            <td colSpan="7" className="p-4 text-center text-gray-500 italic">No batting data available yet.</td>
                                        </tr>
                                    )}
                                    {/* Extras Row */}
                                    <tr className="bg-slate-700/50 font-bold border-t border-slate-600">
                                        <td colSpan="5" className="p-3 text-right text-gray-300">Extras</td>
                                        <td colSpan="2" className="p-3 text-left text-yellow-500">
                                            {activeTab === 'innings1' ? (match.score.team1.extras || 0) : (match.score.team2.extras || 0)}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Bowling Card */}
                    <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
                        <h3 className="text-lg font-bold text-gray-200 mb-3 border-b border-slate-700 pb-2 flex justify-between items-center">
                            <span>Bowling: {bowlingTeam}</span>
                            <span className="text-xs font-normal text-gray-400 uppercase tracking-wider">Innings {activeTab === 'innings1' ? '1' : '2'}</span>
                        </h3>
                        <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
                            <table className="w-full text-sm text-gray-300">
                                <thead className="bg-slate-700 text-gray-300">
                                    <tr>
                                        <th className="p-3 text-left">Bowler</th>
                                        <th className="p-3 text-right">O</th>
                                        <th className="p-3 text-right">M</th>
                                        <th className="p-3 text-right">R</th>
                                        <th className="p-3 text-right">W</th>
                                        <th className="p-3 text-right">ECO</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700">
                                    {(currentBowling && Array.isArray(currentBowling)
                                        ? currentBowling.filter(b => b && b.name)
                                        : (currentBowling ? [currentBowling.bowler] : []
                                        ).filter(Boolean)).map((bowler, idx) => (
                                            <tr key={idx} className={idx % 2 === 0 ? "bg-slate-800" : "bg-slate-800/50"}>
                                                <td className="p-3 font-medium text-gray-100">
                                                    {bowler.name}
                                                </td>
                                                <td className="p-3 text-right">{bowler.overs || 0}</td>
                                                <td className="p-3 text-right">{bowler.maidens || 0}</td>
                                                <td className="p-3 text-right">{bowler.runs || 0}</td>
                                                <td className="p-3 text-right font-bold text-blue-400">{bowler.wickets || 0}</td>
                                                <td className="p-3 text-right">{(bowler.overs > 0 ? (bowler.runs / bowler.overs).toFixed(1) : '0.0')}</td>
                                            </tr>
                                        ))}
                                    {(!currentBowling || (Array.isArray(currentBowling) && currentBowling.length === 0)) && (
                                        <tr>
                                            <td colSpan="6" className="p-4 text-center text-gray-500 italic">No bowling data available yet.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Over-by-Over Scoring Display */}
                    <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
                        <h3 className="text-lg font-bold text-gray-200 mb-3 border-b border-slate-700 pb-2 flex justify-between items-center">
                            <span>Over-by-Over Analysis</span>
                            <span className="text-xs font-normal text-gray-400 uppercase tracking-wider">Innings {activeTab === 'innings1' ? '1' : '2'}</span>
                        </h3>
                        {((activeTab === 'innings1' ? match.innings1Overs : match.innings2Overs) || []).length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {(activeTab === 'innings1' ? match.innings1Overs : match.innings2Overs).map((overData, idx) => (
                                    <div key={idx} className="bg-slate-800 rounded-lg border border-slate-700 p-3">
                                        <div className="flex justify-between items-center mb-2 border-b border-slate-700 pb-1">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-gray-400 uppercase">Over {overData.over}</span>
                                                {overData.savedStats && overData.savedStats.bowlerName && (
                                                    <span className="text-[10px] text-gray-500 font-medium truncate max-w-[80px]" title={overData.savedStats.bowlerName}>
                                                        {overData.savedStats.bowlerName}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <span className="text-xs font-mono font-bold text-blue-400">
                                                    {overData.balls.reduce((sum, ball) => sum + (Number(ball) || 0), 0)} runs
                                                </span>
                                                {(overData.savedStats?.wickets > 0 || overData.balls.filter(b => b === 'W' || b === 'w').length > 0) && (
                                                    <span className="text-[10px] font-bold text-red-400">
                                                        {overData.savedStats?.wickets || overData.balls.filter(b => b === 'W' || b === 'w').length} Wkts
                                                    </span>
                                                )}



                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-1">
                                            {overData.balls.map((ball, bIdx) => (
                                                <div key={bIdx} className={`
                                                    w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                                                    ${ball === 'W' || ball === 'w'
                                                        ? 'bg-red-500/20 text-red-400 border border-red-500/50'
                                                        : (ball === '4' || ball === '6'
                                                            ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                                                            : 'bg-slate-700 text-gray-300')
                                                    }
                                                `}>
                                                    {ball}
                                                </div>
                                            ))}
                                        </div>


                                        {(() => {
                                            let topName = overData.topScorerName;
                                            let topRuns = overData.topScorerRuns || 0;

                                            // Attempt auto-calculation if manual override is missing
                                            if (!topName && overData.ballAssignments) {
                                                const scores = {};
                                                Object.values(overData.ballAssignments).forEach(assignment => {
                                                    if (assignment.batter) {
                                                        scores[assignment.batter] = (scores[assignment.batter] || 0) + (Number(assignment.value) || 0);
                                                    }
                                                });

                                                let maxRuns = -1;
                                                Object.entries(scores).forEach(([name, runs]) => {
                                                    if (runs > maxRuns) {
                                                        maxRuns = runs;
                                                        topName = name;
                                                        topRuns = runs;
                                                    }
                                                });
                                            }

                                            return topName ? (
                                                <div className="mt-2 pt-2 border-t border-slate-700/50 text-center">
                                                    <span className="text-[9px] text-gray-500 uppercase font-bold block mb-0.5">Most Runs</span>
                                                    <span className="text-xs text-yellow-500 font-bold">
                                                        {topName} <span className="text-white/60 text-[10px] font-normal">({topRuns})</span>
                                                    </span>
                                                </div>
                                            ) : null;
                                        })()}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 text-center bg-slate-800/50 rounded-lg border border-slate-700/50 text-gray-500 italic">
                                No over-by-over data available.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div >
    );
};

export default ScoreCard;
