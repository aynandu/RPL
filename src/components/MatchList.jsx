import React from 'react';
import { useGame } from '../context/GameContext';
import { ChevronRight } from 'lucide-react';

const MatchCard = ({ match, onClick }) => {
    const isLive = match.status === 'live';

    return (
        <div
            onClick={onClick}
            className="bg-slate-900 rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer border-l-4 border-l-blue-500 mb-4 border-y border-r border-slate-800"
        >
            <div className="p-4">
                {/* Status Badge */}
                <div className="flex justify-between items-center mb-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${isLive ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-700 text-gray-300'
                        }`}>
                        {match.status}
                    </span>
                    <span className="text-xs text-gray-400 font-mono">Match #{match.id}</span>
                </div>

                {/* Date & Time */}
                <div className="text-center text-sm text-gray-400 font-medium mb-3 bg-slate-800 py-1 rounded border border-slate-700">
                    {match.date ? new Date(match.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : ''}
                </div>

                {/* Teams & Scores */}
                <div className="flex flex-row justify-between items-center py-2 bg-slate-800 rounded-lg px-3 border border-slate-700">
                    <div className="flex items-center gap-2">
                        <div className="font-bold text-lg text-gray-100">{match.team1}</div>
                        <div className="text-xl font-mono font-bold text-blue-400">
                            {match.score.team1.runs}/{match.score.team1.wickets} <span className="text-sm text-gray-500 font-normal">({match.score.team1.overs})</span>
                        </div>
                    </div>

                    <div className="text-gray-600 font-bold px-4">VS</div>

                    <div className="flex items-center gap-2">
                        <div className="text-xl font-mono font-bold text-blue-400">
                            {match.score.team2.runs}/{match.score.team2.wickets} <span className="text-sm text-gray-500 font-normal">({match.score.team2.overs})</span>
                        </div>
                        <div className="font-bold text-lg text-gray-100">{match.team2}</div>
                    </div>
                </div>

                {/* Man of the Match */}
                {match.status === 'completed' && match.manOfTheMatch && (
                    <div className="mt-3 text-center text-sm border-t border-slate-800 pt-2">
                        <span className="text-gray-400 block mb-1">Man of the Match</span>
                        <span className="text-yellow-400 font-bold text-base">{match.manOfTheMatch}</span>
                    </div>
                )}

                {/* Result Text */}
                {match.status === 'completed' && (
                    <div className="mt-3 pt-2 border-t border-slate-800 text-center font-bold text-blue-400">
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
                    <div className="mt-3 pt-3 border-t border-slate-800 flex justify-between items-center text-sm text-gray-400">
                        <span>{match.batting ? `${match.batting.striker.name} batting` : 'In Progress'}</span>
                        <ChevronRight className="w-4 h-4" />
                    </div>
                )}
            </div>
        </div>
    );
};

const MatchList = ({ onSelectMatch }) => {
    const { matches } = useGame();

    return (
        <div className="w-full">
            <h2 className="text-2xl font-bold mb-6 text-white bg-blue-600 py-2 px-4 rounded-lg inline-block shadow-lg">
                All Matches
            </h2>
            <div className="space-y-4">
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
