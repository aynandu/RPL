import React from 'react';
import { useGame } from '../context/GameContext';
import { Trophy, Medal, Target, Zap, Award, Hexagon, Component } from 'lucide-react';

const LeadershipTables = () => {
    const { players, matches } = useGame();

    // Process Top Run Scorers (Orange Cap)
    const topRunScorers = [...(players || [])]
        .filter(p => p.runs > 0)
        .sort((a, b) => b.runs - a.runs)
        .slice(0, 5);

    // Process Top Wicket Takers (Purple Cap)
    const topWicketTakers = [...(players || [])]
        .filter(p => p.wickets > 0)
        .sort((a, b) => b.wickets - a.wickets)
        .slice(0, 5);

    // Process Most Runs in an Over
    const topOverScorers = React.useMemo(() => {
        const overScores = [];

        (matches || []).forEach(match => {
            // Helper to process overs
            const processOvers = (overs, teamName) => {
                if (!overs) return;
                overs.forEach(over => {
                    let topName = over.topScorerName;
                    let topRuns = over.topScorerRuns ? parseInt(over.topScorerRuns) : 0;

                    // Auto-calc if manual is missing, just like ScoreCard
                    if (!topName && over.ballAssignments) {
                        const scores = {};
                        Object.values(over.ballAssignments).forEach(assignment => {
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

                    if (topName && topRuns > 0) {
                        overScores.push({
                            name: topName,
                            team: teamName,
                            runs: topRuns,
                            matchId: match.id
                        });
                    }
                });
            };

            processOvers(match.innings1Overs, match.team1);
            processOvers(match.innings2Overs, match.team2);
        });

        return overScores
            .sort((a, b) => b.runs - a.runs)
            .slice(0, 5);
    }, [matches]);

    const topHighestScorers = React.useMemo(() => {
        return [...(players || [])]
            .filter(p => (p.highestScore || 0) > 0)
            .sort((a, b) => (b.highestScore || 0) - (a.highestScore || 0))
            .slice(0, 5);
    }, [players]);

    const topFourHitters = React.useMemo(() => {
        return [...(players || [])]
            .filter(p => (p.fours || 0) > 0)
            .sort((a, b) => (b.fours || 0) - (a.fours || 0))
            .slice(0, 5);
    }, [players]);

    const topSixHitters = React.useMemo(() => {
        return [...(players || [])]
            .filter(p => (p.sixes || 0) > 0)
            .sort((a, b) => (b.sixes || 0) - (a.sixes || 0))
            .slice(0, 5);
    }, [players]);

    const RankIcon = ({ rank }) => {
        if (rank === 0) return <Trophy size={16} className="text-yellow-400" />;
        if (rank === 1) return <Medal size={16} className="text-gray-300" />;
        if (rank === 2) return <Medal size={16} className="text-amber-700" />;
        return <span className="font-mono font-bold text-gray-500">#{rank + 1}</span>;
    };

    return (
        <div className="flex flex-col gap-6 mb-8 mt-8">
            {/* Batting Leaderboard */}
            <div className="glass-card p-0 overflow-hidden border border-white/10 flex flex-col h-full animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                <div className="bg-gradient-to-r from-orange-900/40 to-red-900/40 p-4 border-b border-white/10 flex items-center gap-3">
                    <div className="bg-orange-500/20 p-2 rounded-lg">
                        <Trophy size={20} className="text-orange-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white leading-none">Most Runs</h3>
                        <span className="text-xs text-orange-300 font-medium uppercase tracking-wider">Orange Cap Contenders</span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-black/20 text-xs uppercase text-gray-400 font-bold tracking-wider">
                                <th className="p-3 text-center w-12">Rank</th>
                                <th className="p-3">Player</th>
                                <th className="p-3 text-center">Runs</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {topRunScorers.length === 0 ? (
                                <tr>
                                    <td colSpan="3" className="p-6 text-center text-gray-500 text-sm">No batting records yet</td>
                                </tr>
                            ) : (
                                topRunScorers.map((player, index) => (
                                    <tr key={index} className={`hover:bg-white/5 transition-colors ${index === 0 ? 'bg-orange-500/5' : ''}`}>
                                        <td className="p-3 text-center flex justify-center items-center h-full">
                                            <div className="w-6 h-6 flex items-center justify-center">
                                                <RankIcon rank={index} />
                                            </div>
                                        </td>
                                        <td className="p-3">
                                            <div className="font-bold text-gray-200">{player.name}</div>
                                            <div className="text-[10px] text-gray-500 uppercase">{player.team}</div>
                                        </td>
                                        <td className="p-3 text-center font-mono font-bold text-orange-400 text-lg">
                                            {player.runs}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Bowling Leaderboard */}
            <div className="glass-card p-0 overflow-hidden border border-white/10 flex flex-col h-full animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <div className="bg-gradient-to-r from-purple-900/40 to-indigo-900/40 p-4 border-b border-white/10 flex items-center gap-3">
                    <div className="bg-purple-500/20 p-2 rounded-lg">
                        <Target size={20} className="text-purple-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white leading-none">Most Wickets</h3>
                        <span className="text-xs text-purple-300 font-medium uppercase tracking-wider">Purple Cap Contenders</span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-black/20 text-xs uppercase text-gray-400 font-bold tracking-wider">
                                <th className="p-3 text-center w-12">Rank</th>
                                <th className="p-3">Player</th>
                                <th className="p-3 text-center">Wkts</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {topWicketTakers.length === 0 ? (
                                <tr>
                                    <td colSpan="3" className="p-6 text-center text-gray-500 text-sm">No bowling records yet</td>
                                </tr>
                            ) : (
                                topWicketTakers.map((player, index) => (
                                    <tr key={index} className={`hover:bg-white/5 transition-colors ${index === 0 ? 'bg-purple-500/5' : ''}`}>
                                        <td className="p-3 text-center flex justify-center items-center h-full">
                                            <div className="w-6 h-6 flex items-center justify-center">
                                                <RankIcon rank={index} />
                                            </div>
                                        </td>
                                        <td className="p-3">
                                            <div className="font-bold text-gray-200">{player.name}</div>
                                            <div className="text-[10px] text-gray-500 uppercase">{player.team}</div>
                                        </td>
                                        <td className="p-3 text-center font-mono font-bold text-purple-400 text-lg">
                                            {player.wickets}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Most Runs in Over Leaderboard */}
            <div className="glass-card p-0 overflow-hidden border border-white/10 flex flex-col h-full animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                <div className="bg-gradient-to-r from-yellow-900/40 to-amber-900/40 p-4 border-b border-white/10 flex items-center gap-3">
                    <div className="bg-yellow-500/20 p-2 rounded-lg">
                        <Zap size={20} className="text-yellow-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white leading-none">Power Hitter</h3>
                        <span className="text-xs text-yellow-300 font-medium uppercase tracking-wider">Most Runs in an Over</span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-black/20 text-xs uppercase text-gray-400 font-bold tracking-wider">
                                <th className="p-3 text-center w-12">Rank</th>
                                <th className="p-3">Player</th>
                                <th className="p-3 text-center">Runs</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {topOverScorers.length === 0 ? (
                                <tr>
                                    <td colSpan="3" className="p-6 text-center text-gray-500 text-sm">No power hitting records yet</td>
                                </tr>
                            ) : (
                                topOverScorers.map((player, index) => (
                                    <tr key={index} className={`hover:bg-white/5 transition-colors ${index === 0 ? 'bg-yellow-500/5' : ''}`}>
                                        <td className="p-3 text-center flex justify-center items-center h-full">
                                            <div className="w-6 h-6 flex items-center justify-center">
                                                <RankIcon rank={index} />
                                            </div>
                                        </td>
                                        <td className="p-3">
                                            <div className="font-bold text-gray-200">{player.name}</div>
                                            <div className="text-[10px] text-gray-500 uppercase">{player.team}</div>
                                        </td>
                                        <td className="p-3 text-center font-mono font-bold text-yellow-400 text-lg">
                                            {player.runs}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            {/* Highest Score Leaderboard */}
            <div className="glass-card p-0 overflow-hidden border border-white/10 flex flex-col h-full animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                <div className="bg-gradient-to-r from-emerald-900/40 to-teal-900/40 p-4 border-b border-white/10 flex items-center gap-3">
                    <div className="bg-emerald-500/20 p-2 rounded-lg">
                        <Award size={20} className="text-emerald-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white leading-none">Highest Stats</h3>
                        <span className="text-xs text-emerald-300 font-medium uppercase tracking-wider">Highest Individual Score</span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-black/20 text-xs uppercase text-gray-400 font-bold tracking-wider">
                                <th className="p-3 text-center w-12">Rank</th>
                                <th className="p-3">Player</th>
                                <th className="p-3 text-center">HS</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {topHighestScorers.length === 0 ? (
                                <tr>
                                    <td colSpan="3" className="p-6 text-center text-gray-500 text-sm">No records yet</td>
                                </tr>
                            ) : (
                                topHighestScorers.map((player, index) => (
                                    <tr key={index} className={`hover:bg-white/5 transition-colors ${index === 0 ? 'bg-emerald-500/5' : ''}`}>
                                        <td className="p-3 text-center flex justify-center items-center h-full">
                                            <div className="w-6 h-6 flex items-center justify-center">
                                                <RankIcon rank={index} />
                                            </div>
                                        </td>
                                        <td className="p-3">
                                            <div className="font-bold text-gray-200">{player.name}</div>
                                            <div className="text-[10px] text-gray-500 uppercase">{player.team}</div>
                                        </td>
                                        <td className="p-3 text-center font-mono font-bold text-emerald-400 text-lg">
                                            {player.highestScore}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>


            {/* Most 4s Leaderboard */}
            <div className="glass-card p-0 overflow-hidden border border-white/10 flex flex-col h-full animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
                <div className="bg-gradient-to-r from-blue-900/40 to-cyan-900/40 p-4 border-b border-white/10 flex items-center gap-3">
                    <div className="bg-blue-500/20 p-2 rounded-lg">
                        <Hexagon size={20} className="text-blue-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white leading-none">Boundary Kings</h3>
                        <span className="text-xs text-blue-300 font-medium uppercase tracking-wider">Most 4s</span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-black/20 text-xs uppercase text-gray-400 font-bold tracking-wider">
                                <th className="p-3 text-center w-12">Rank</th>
                                <th className="p-3">Player</th>
                                <th className="p-3 text-center">4s</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {topFourHitters.length === 0 ? (
                                <tr>
                                    <td colSpan="3" className="p-6 text-center text-gray-500 text-sm">No records yet</td>
                                </tr>
                            ) : (
                                topFourHitters.map((player, index) => (
                                    <tr key={index} className={`hover:bg-white/5 transition-colors ${index === 0 ? 'bg-blue-500/5' : ''}`}>
                                        <td className="p-3 text-center flex justify-center items-center h-full">
                                            <div className="w-6 h-6 flex items-center justify-center">
                                                <RankIcon rank={index} />
                                            </div>
                                        </td>
                                        <td className="p-3">
                                            <div className="font-bold text-gray-200">{player.name}</div>
                                            <div className="text-[10px] text-gray-500 uppercase">{player.team}</div>
                                        </td>
                                        <td className="p-3 text-center font-mono font-bold text-blue-400 text-lg">
                                            {player.fours}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Most 6s Leaderboard */}
            <div className="glass-card p-0 overflow-hidden border border-white/10 flex flex-col h-full animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
                <div className="bg-gradient-to-r from-rose-900/40 to-pink-900/40 p-4 border-b border-white/10 flex items-center gap-3">
                    <div className="bg-rose-500/20 p-2 rounded-lg">
                        <Component size={20} className="text-rose-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white leading-none">Maximums</h3>
                        <span className="text-xs text-rose-300 font-medium uppercase tracking-wider">Most 6s</span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-black/20 text-xs uppercase text-gray-400 font-bold tracking-wider">
                                <th className="p-3 text-center w-12">Rank</th>
                                <th className="p-3">Player</th>
                                <th className="p-3 text-center">6s</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {topSixHitters.length === 0 ? (
                                <tr>
                                    <td colSpan="3" className="p-6 text-center text-gray-500 text-sm">No records yet</td>
                                </tr>
                            ) : (
                                topSixHitters.map((player, index) => (
                                    <tr key={index} className={`hover:bg-white/5 transition-colors ${index === 0 ? 'bg-rose-500/5' : ''}`}>
                                        <td className="p-3 text-center flex justify-center items-center h-full">
                                            <div className="w-6 h-6 flex items-center justify-center">
                                                <RankIcon rank={index} />
                                            </div>
                                        </td>
                                        <td className="p-3">
                                            <div className="font-bold text-gray-200">{player.name}</div>
                                            <div className="text-[10px] text-gray-500 uppercase">{player.team}</div>
                                        </td>
                                        <td className="p-3 text-center font-mono font-bold text-rose-400 text-lg">
                                            {player.sixes}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div >
    );
};

export default LeadershipTables;
