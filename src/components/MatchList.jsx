import React from 'react';
import { useGame } from '../context/GameContext';
import { ChevronRight } from 'lucide-react';
import MilestonePopup from './MilestonePopup';

const MatchCard = ({ match, onClick }) => {
    const isLive = match.status === 'live';

    return (
        <div
            onClick={onClick}
            className={`glass-card group overflow-hidden transition-all duration-300 transform hover:-translate-y-1 cursor-pointer mb-6 border-l-4 ${isLive ? 'border-l-red-500 hover:shadow-[0_0_20px_rgba(239,68,68,0.3)]' : match.status === 'completed' ? 'border-l-green-500 hover:shadow-[0_0_20px_rgba(34,197,94,0.3)]' : 'border-l-blue-500'}`}
        >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shine z-0"></div>

            <div className="p-5 relative z-10">
                {/* Status Badge */}
                <div className="flex justify-between items-center mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest shadow-lg ${isLive
                        ? 'bg-red-600 text-white animate-pulse shadow-red-500/50'
                        : match.status === 'completed'
                            ? 'bg-green-600/20 text-green-400 border border-green-500/30'
                            : 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                        }`}>
                        {match.status}
                    </span>
                    <span className="text-xs text-gray-500 font-mono flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-600"></span>
                        Match #{match.id}
                    </span>
                </div>

                {/* Date & Time & Stadium */}
                <div className="text-center mb-4 border-b border-white/5 pb-2">
                    {match.matchType && match.matchType !== 'Group Stage' && (
                        <div className="mb-2">
                            <span className="bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-300 text-xs font-black uppercase tracking-widest px-3 py-1 rounded shadow-[0_0_10px_rgba(251,191,36,0.2)] border border-amber-500/30">
                                {match.matchType}
                            </span>
                        </div>
                    )}
                    <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                        {match.date ? new Date(match.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                    </div>
                    <div className="text-[10px] text-blue-400/80 font-medium uppercase tracking-widest mt-1 flex items-center justify-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-blue-500"></span>
                        {match.stadium || 'Indoor Stadium, Pramdom'}
                    </div>
                </div>

                {/* Live/Completed Toss Result */}
                {(isLive || match.status === 'completed') && match.tossResult && (
                    <div className={`mb-4 text-center text-sm font-medium ${isLive ? 'text-cyan-300 animate-pulse' : 'text-gray-400 italic'}`}>
                        {match.tossResult}
                    </div>
                )}

                {/* Teams & Scores */}
                <div className="flex flex-col md:flex-row justify-between items-center py-4 bg-black/20 rounded-xl px-4 border border-white/5 backdrop-blur-sm gap-4">
                    <div className="flex flex-col items-center md:items-start gap-1 w-1/3">
                        <div className="font-black text-lg md:text-xl text-white tracking-tight">{match.team1}</div>
                        <div className="text-2xl font-mono font-bold text-transparent bg-clip-text bg-gradient-to-b from-blue-300 to-blue-600">
                            {match.score.team1.runs}/{match.score.team1.wickets}
                        </div>
                        <span className="text-xs text-blue-400/70 font-bold">({match.score.team1.overs} ov)</span>
                    </div>

                    <div className="text-gray-600 font-black text-2xl px-4 opacity-30 italic flex flex-col items-center">
                        <span>VS</span>
                        {(() => {
                            // Check if 1st Innings is complete: All configured overs have savedStats
                            // We assume match.innings1Overs matches the configured total overs.
                            // Better check: If 2nd innings has started (overs > 0) OR if all 1st innings overs are saved.
                            // User specific request: "when 1st inning completed as per no more over card left"
                            // This implies we rely on innings1Overs.every(o => o.savedStats).

                            const isFirstInningsDone = match.innings1Overs &&
                                match.innings1Overs.length > 0 &&
                                match.innings1Overs.every(o => o.savedStats);

                            if (isFirstInningsDone && match.status !== 'completed') {
                                const target = (match.score.team1.runs || 0) + 1;
                                return (
                                    <span className="text-[10px] text-yellow-500 font-bold mt-1 bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/20 whitespace-nowrap">
                                        Target: {target}
                                    </span>
                                );
                            }
                            return null;
                        })()}
                        {(() => {
                            // Show equation: "Need X runs in Y balls"
                            // Condition: Live match, 1st innings done (target exists)
                            const isFirstInningsDone = match.innings1Overs && match.innings1Overs.length > 0 && match.innings1Overs.every(o => o.savedStats);
                            const t2Stats = match.score.team2;

                            if (match.status === 'live' && isFirstInningsDone && t2Stats.overs > 0) {
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
                                    // Fallback: Standard calculation if detailed data missing
                                    const totalOversMatch = parseInt(match.oversChoosen) || 20;
                                    const totalBalls = totalOversMatch * 6;
                                    const currentOvers = Number(t2Stats.overs || 0);
                                    const completedOvers = Math.floor(currentOvers);
                                    const ballsInCurrentOver = Math.round((currentOvers - completedOvers) * 10);
                                    const ballsBowled = (completedOvers * 6) + ballsInCurrentOver;
                                    ballsLeft = totalBalls - ballsBowled;
                                }

                                // runsNeeded was already calculated above: const runsNeeded = target - (t2Stats.runs || 0);
                                // We need to update it or use a new variable for display.
                                const displayRunsNeeded = Math.max(0, runsNeeded);

                                if (displayRunsNeeded >= 0 && ballsLeft >= 0) {
                                    return (
                                        <span className="text-[10px] text-red-400 font-bold mt-1 bg-red-900/30 px-2 py-0.5 rounded border border-red-500/20 whitespace-nowrap animate-pulse">
                                            Need {displayRunsNeeded} runs in {ballsLeft} balls
                                        </span>
                                    );
                                }
                            }
                            return null;
                        })()}
                    </div>

                    <div className="flex flex-col items-center md:items-end gap-1 w-1/3 text-right">
                        <div className="font-black text-lg md:text-xl text-white tracking-tight">{match.team2}</div>
                        <div className="text-2xl font-mono font-bold text-transparent bg-clip-text bg-gradient-to-b from-purple-300 to-purple-600">
                            {match.score.team2.runs}/{match.score.team2.wickets}
                        </div>
                        <span className="text-xs text-purple-400/70 font-bold">({match.score.team2.overs} ov)</span>
                    </div>
                </div>

                {/* Man of the Match */}
                {match.status === 'completed' && match.manOfTheMatch && (
                    <div className="mt-4 text-center border-t border-white/5 pt-3">
                        <span className="text-xs text-gray-500 uppercase tracking-widest block mb-1">Man of the Match</span>
                        <span className="text-yellow-400 font-bold text-lg drop-shadow-[0_0_5px_rgba(250,204,21,0.5)]">{match.manOfTheMatch}</span>
                    </div>
                )}

                {/* Result Text */}
                {match.status === 'completed' && (
                    <div className="mt-3 pt-2 text-center font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">
                        {(() => {
                            const t1 = match.score.team1;
                            const t2 = match.score.team2;
                            if (t1.runs > t2.runs) {
                                return `${match.team1} won by ${t1.runs - t2.runs} runs`;
                            } else if (t2.runs > t1.runs) {
                                return `${match.team2} won by ${10 - t2.wickets} wickets`;
                            } else {
                                return "Match Tied";
                            }
                        })()}
                    </div>
                )}

                {/* Live Indicator Text */}
                {isLive && (
                    <div className="mt-3 pt-3 border-t border-white/5 flex justify-between items-center text-sm text-gray-300 font-medium">
                        <span className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                            {(() => {
                                // Determine active innings data (could be batting or secondInningsBatting)
                                const isSecondInnings = match.score.team2.overs > 0 || (match.secondInningsBatting && match.secondInningsBatting.length > 0 && match.score.team1.overs > 0);
                                const currentBatting = isSecondInnings ? (match.secondInningsBatting || []) : (match.batting || []);

                                // Filter for Not Out / Next to Bat (but usually we show Not Out i.e. on crease)
                                const activeBatters = currentBatting.filter(p => !p.dismissalType || p.dismissalType === 'notOut').slice(0, 2); // Show max 2

                                if (activeBatters.length > 0) {
                                    return activeBatters.map(p => `${p.name} ${p.runs || 0}(${p.balls || 0}) *`).join('  |  ');
                                }
                                return 'Match in Progress';
                            })()}
                        </span>
                        <ChevronRight className="w-4 h-4 text-blue-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                )}
            </div>
        </div>
    );
};

const MatchList = ({ onSelectMatch }) => {
    const { matches } = useGame();
    const [activeMilestone, setActiveMilestone] = React.useState(null);

    // Milestone Monitoring
    React.useEffect(() => {
        // Load processed milestones to prevent duplicates
        const getProcessedMilestones = () => {
            const saved = sessionStorage.getItem('rpl_milestones_session');
            return new Set(saved ? JSON.parse(saved) : []);
        };

        const processed = getProcessedMilestones();
        let foundNewMilestone = null;

        matches.forEach(match => {
            if (match.status !== 'live') return;
            if (foundNewMilestone) return; // Exit early if we found one to show

            // 1. Batting Milestones (50, 100)
            const checkPlayers = (players) => {
                if (!players || foundNewMilestone) return;
                players.forEach(p => {
                    if (foundNewMilestone) return;
                    const runs = Number(p.runs) || 0;

                    // Check Century (100) - Priority
                    if (runs >= 100) {
                        const key100 = `${match.id}_${p.name}_100`;
                        if (!processed.has(key100)) {
                            foundNewMilestone = {
                                ...p,
                                team: p.team || (p.name ? 'Player' : 'Unknown'),
                                matchId: match.id,
                                key: key100,
                                type: '100'
                            };
                            return;
                        }
                    }

                    // Check Half-Century (50)
                    if (runs >= 50) {
                        const key50 = `${match.id}_${p.name}_50`;
                        if (!processed.has(key50)) {
                            foundNewMilestone = {
                                ...p,
                                team: p.team || (p.name ? 'Player' : 'Unknown'),
                                matchId: match.id,
                                key: key50,
                                type: '50'
                            };
                            return;
                        }
                    }
                });
            };

            checkPlayers(match.batting);
            checkPlayers(match.secondInningsBatting);

            // 2. Wicket Milestones (Recursive: 3, 4, 5+ wickets)
            const checkBowlers = (bowlers) => {
                if (!bowlers || foundNewMilestone) return;

                bowlers.forEach(b => {
                    if (foundNewMilestone) return;
                    const wickets = Number(b.wickets) || 0;

                    if (wickets >= 3) {
                        // Check specifically for THIS wicket count (e.g. 3, then 4, then 5)
                        // We iterate down or just check the current count.
                        // Actually, we just check if the current count has been celebrated.
                        // But if a user jumps from 2 to 4 (unlikely but possible), should we celebrate 3?
                        // The prompt says "repeat that function every time took added more wickets".
                        // So checking just the current count is enough. if they jump 2->4, celebrating "4 Wickets" is fine.

                        const keyWicket = `${match.id}_${b.name}_${wickets}_wickets`;

                        if (!processed.has(keyWicket)) {
                            foundNewMilestone = {
                                ...b,
                                team: b.team || 'Bowling Team',
                                matchId: match.id,
                                key: keyWicket,
                                type: 'wickets',
                                runsConceded: b.runs || 0
                            };
                        }
                    }
                });
            };

            checkBowlers(match.bowling);
            checkBowlers(match.secondInningsBowling);
        });

        if (foundNewMilestone) {
            // Infer Team Name if missing
            if (!foundNewMilestone.team || foundNewMilestone.team === 'Player' || foundNewMilestone.team === 'Bowling Team') {
                if (foundNewMilestone.type === 'wickets') {
                    // Bowler is from the fielding team. 
                    // Loop through matches to find which team this player is NOT in batting list? Or check bowling lists.
                    // Simple heuristic: If in `match.score.team1.bowling`, they are Team 1? No, usually bowling arrays track bowlers associated with the innings.
                    // The `bowling` prop on player objects in `match.bowling` typically comes from the `players` list which has team info.
                    // Let's rely on global player list lookup if needed, but for now fallback is okay.
                } else {
                    const isTeam1 = (foundNewMilestone.matchId && matches.find(m => m.id === foundNewMilestone.matchId)?.batting || []).some(b => b.name === foundNewMilestone.name);
                    // foundNewMilestone might not have full match context here easily.
                }
            }

            setActiveMilestone(foundNewMilestone);
            processed.add(foundNewMilestone.key);
            sessionStorage.setItem('rpl_milestones_session', JSON.stringify([...processed]));
        }
    }, [matches]);

    return (
        <div className="w-full relative">
            {activeMilestone && (
                <MilestonePopup
                    player={activeMilestone}
                    type={activeMilestone.type}
                    onClose={() => setActiveMilestone(null)}
                />
            )}
            <h2 className="text-2xl font-black mb-6 text-white flex items-center gap-3">
                <span className="w-1.5 h-8 bg-gradient-to-b from-blue-500 to-cyan-400 rounded-full"></span>
                League Matches
            </h2>
            <div className="space-y-6">
                {[...matches].sort((a, b) => b.id - a.id).map(match => (
                    <MatchCard
                        key={match.id}
                        match={match}
                        onClick={() => onSelectMatch(match)}
                    />
                ))}
            </div>
        </div>
    );
};

export default MatchList;
