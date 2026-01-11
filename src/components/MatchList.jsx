import React from 'react';
import { useGame } from '../context/GameContext';
import { ChevronRight } from 'lucide-react';

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

                    <div className="text-gray-600 font-black text-2xl px-4 opacity-30 italic">VS</div>

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
                            {match.batting && Array.isArray(match.batting) && match.batting[0] ? `${match.batting[0].name} *` : (match.batting && match.batting.striker ? `${match.batting.striker.name} *` : 'Match in Progress')}
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

    return (
        <div className="w-full">
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
