import React from 'react';
import { useGame } from '../context/GameContext';
import { Trophy, Medal, Target } from 'lucide-react';

const LeadershipTables = () => {
    const { players } = useGame();

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
        </div>
    );
};

export default LeadershipTables;
