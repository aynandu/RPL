import React from 'react';
import { useGame } from '../context/GameContext';

const BroadcastOverlay = ({ matchId }) => {
    const { matches, liveStreamMatchId } = useGame();

    // Determine which ID to use: Prop (OBS mode) > Context (Home mode)
    const targetId = matchId || liveStreamMatchId;

    if (!targetId) return null;

    const overlayMatch = matches.find(m => m.id === parseInt(targetId));
    if (!overlayMatch) return null;

    /* -------------------------------------------------------------------------- */
    /*                       Logic Extracted from Home.jsx                        */
    /* -------------------------------------------------------------------------- */
    const { team1, team2, score, status, oversChoosen } = overlayMatch;
    const t1s = score.team1;
    const t2s = score.team2;

    // Equation Logic
    let overlayText = "";
    const isSecondInnings = t2s.runs > 0 || t2s.balls > 0 || t2s.overs > 0 || overlayMatch.batting === team2;

    if (status === 'live' && isSecondInnings) {
        const target = t1s.runs + 1;
        const runsNeed = Math.max(0, target - t2s.runs);

        // Balls Remaining
        const maxOvers = parseInt(oversChoosen, 10) || 6;
        const totalBalls = maxOvers * 6;
        const ballsBowled = (Math.floor(t2s.overs) * 6) + Math.round((t2s.overs % 1) * 10);
        const ballsLeft = Math.max(0, totalBalls - ballsBowled);

        overlayText = `Need ${runsNeed} off ${ballsLeft} balls`;

        if (t2s.runs >= target) overlayText = `${team2} Wins!`;
        if (t1s.wickets >= 10 || (ballsLeft === 0 && runsNeed > 0)) overlayText = `${team1} Wins!`;

    } else if (status === 'completed') {
        if (t1s.runs > t2s.runs) overlayText = `${team1} Won`;
        else if (t2s.runs > t1s.runs) overlayText = `${team2} Won`;
        else overlayText = "Match Tied";
    }

    /* -------------------------------------------------------------------------- */
    /*                                   Render                                   */
    /* -------------------------------------------------------------------------- */
    return (
        <div className="w-full h-full flex items-end justify-center pb-4 animate-fade-in pointer-events-none">
            {/* Broadcast Style Overlay Container */}
            <div className="flex items-center justify-between bg-black border-t-2 border-yellow-500 shadow-2xl rounded-lg overflow-hidden relative h-12 w-full max-w-[95%] mx-auto">

                {/* Background Pattern/Texture (Optional) */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>

                {/* Team 1 Section (Left) */}
                <div className="flex items-center h-full pl-3 pr-2 bg-gradient-to-r from-black via-black/80 to-transparent relative z-10 min-w-[25%]">
                    <div className="flex flex-col">
                        <span className="text-yellow-400 font-black text-[10px] uppercase tracking-wider shadow-black drop-shadow-md leading-none mb-0.5">{team1}</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-white font-mono font-bold text-sm leading-none shadow-black drop-shadow-lg">{t1s.runs}/{t1s.wickets}</span>
                            <span className="text-gray-400 text-[9px] font-bold">({t1s.overs})</span>
                        </div>
                    </div>
                </div>

                {/* Center Status / Equation */}
                <div className="flex-1 flex items-center justify-center h-full relative z-10 px-1">
                    {overlayText ? (
                        <div className={`px-2 py-0.5 rounded bg-black/40 border border-white/5 backdrop-blur-sm w-full max-w-[220px] flex justify-center`}>
                            <span className={`text-[8px] md:text-[9px] font-bold uppercase tracking-wide leading-tight whitespace-normal break-words text-center ${status === 'live' ? 'text-red-400 animate-pulse' : 'text-green-400'}`}>
                                {overlayText}
                            </span>
                        </div>
                    ) : (
                        <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest bg-black/30 px-2 py-0.5 rounded">
                            {status === 'live' ? '1st Innings' : status}
                        </span>
                    )}
                </div>

                {/* Team 2 Section (Right) */}
                <div className="flex items-center justify-end h-full pr-3 pl-2 bg-gradient-to-l from-black via-black/80 to-transparent relative z-10 min-w-[25%] text-right">
                    <div className="flex flex-col items-end">
                        <span className="text-cyan-400 font-black text-[10px] uppercase tracking-wider shadow-black drop-shadow-md leading-none mb-0.5">{team2}</span>
                        <div className="flex items-baseline gap-1 justify-end">
                            <span className="text-gray-400 text-[9px] font-bold">({t2s.overs})</span>
                            <span className="text-white font-mono font-bold text-sm leading-none shadow-black drop-shadow-lg">{t2s.runs}/{t2s.wickets}</span>
                        </div>
                    </div>
                </div>

                {/* Decorative Divider Lines */}
                <div className="absolute left-[25%] top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent"></div>
                <div className="absolute right-[25%] top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent"></div>
            </div>
        </div>
    );
};

export default BroadcastOverlay;
