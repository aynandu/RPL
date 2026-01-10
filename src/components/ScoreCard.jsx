import React from 'react';
import { X } from 'lucide-react';

const ScoreCard = ({ match, onClose }) => {
    if (!match) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in">
            <div className="bg-white w-full max-w-4xl h-[90vh] overflow-y-auto rounded-2xl shadow-2xl relative">
                {/* Header */}
                <div className="sticky top-0 bg-blue-900 text-white p-4 flex justify-between items-center z-10">
                    <div>
                        <h2 className="text-xl font-bold">{match.team1} vs {match.team2}</h2>
                        <div className="flex flex-col">
                            <p className="text-sm opacity-80">{match.status === 'live' ? 'Create Live' : 'Match Details'}</p>
                            <p className="text-xs opacity-70 mt-1 font-mono">
                                {match.date ? new Date(match.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6 space-y-8">
                    {/* Main Score Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-center bg-gray-50 p-6 rounded-xl border border-gray-100 shadow-inner">
                        <div>
                            <h3 className="text-2xl font-bold text-gray-800">{match.team1}</h3>
                            <p className="text-4xl font-mono font-black text-blue-600 my-2">
                                {match.score.team1.runs}/{match.score.team1.wickets}
                            </p>
                            <p className="text-gray-500">{match.score.team1.overs} Overs</p>
                        </div>
                        <div className="flex items-center justify-center">
                            <div className="w-px h-full bg-gray-200 hidden md:block"></div>
                            <div className="h-px w-full bg-gray-200 md:hidden"></div>
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-gray-800">{match.team2}</h3>
                            <p className="text-4xl font-mono font-black text-blue-600 my-2">
                                {match.score.team2.runs}/{match.score.team2.wickets}
                            </p>
                            <p className="text-gray-500">{match.score.team2.overs} Overs</p>
                        </div>
                    </div>

                    {/* Batting Card */}
                    {match.batting && (
                        <div className="animate-slide-up">
                            <h3 className="text-lg font-bold text-gray-800 mb-3 border-b pb-2">Batting Scorecard (Live)</h3>
                            <div className="bg-white rounded-lg border overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-100 text-gray-600">
                                        <tr>
                                            <th className="p-3 text-left">Batter</th>
                                            <th className="p-3 text-right">R</th>
                                            <th className="p-3 text-right">B</th>
                                            <th className="p-3 text-right">4s</th>
                                            <th className="p-3 text-right">6s</th>
                                            <th className="p-3 text-right">SR</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {[match.batting.striker, match.batting.nonStriker].filter(Boolean).map((batter, idx) => (
                                            <tr key={idx} className={idx === 0 ? "bg-blue-50/50" : ""}>
                                                <td className="p-3 font-medium flex items-center">
                                                    {batter.name} {idx === 0 && <span className="ml-2 text-blue-600">*</span>}
                                                </td>
                                                <td className="p-3 text-right font-bold">{batter.runs}</td>
                                                <td className="p-3 text-right">{batter.balls}</td>
                                                <td className="p-3 text-right">{batter.fours}</td>
                                                <td className="p-3 text-right">{batter.sixes}</td>
                                                <td className="p-3 text-right">{((batter.runs / batter.balls) * 100).toFixed(1)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Bowling Card */}
                    {match.bowling && (
                        <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
                            <h3 className="text-lg font-bold text-gray-800 mb-3 border-b pb-2">Bowling Scorecard (Live)</h3>
                            <div className="bg-white rounded-lg border overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-100 text-gray-600">
                                        <tr>
                                            <th className="p-3 text-left">Bowler</th>
                                            <th className="p-3 text-right">O</th>
                                            <th className="p-3 text-right">M</th>
                                            <th className="p-3 text-right">R</th>
                                            <th className="p-3 text-right">W</th>
                                            <th className="p-3 text-right">ECO</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        <tr>
                                            <td className="p-3 font-medium text-gray-800">
                                                {match.bowling.bowler.name}
                                            </td>
                                            <td className="p-3 text-right">{match.bowling.bowler.overs}</td>
                                            <td className="p-3 text-right">0</td>
                                            <td className="p-3 text-right">{match.bowling.bowler.runs}</td>
                                            <td className="p-3 text-right font-bold text-blue-600">{match.bowling.bowler.wickets}</td>
                                            <td className="p-3 text-right">{(match.bowling.bowler.runs / match.bowling.bowler.overs).toFixed(1)}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ScoreCard;
