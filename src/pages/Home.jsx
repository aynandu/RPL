import React, { useState } from 'react';
import Header from '../components/Header';
import Carousel from '../components/Carousel';
import MatchList from '../components/MatchList';
import ScoreCard from '../components/ScoreCard';
import PointsTable from '../components/PointsTable';
import AllTeams from '../components/AllTeams';
import LeadershipTables from '../components/LeadershipTables';
import Footer from '../components/Footer';
import { useGame } from '../context/GameContext';

const Home = () => {
    const { matches, liveStreamUrl, liveStreamUrl2, liveStreamUrl3, liveStreamUrl4, liveStreamUrl5, liveStreamMatchId } = useGame();
    const [selectedMatchId, setSelectedMatchId] = useState(null);

    // Derived state: Always get the latest match data from context
    const selectedMatch = selectedMatchId ? matches.find(m => m.id === selectedMatchId) : null;

    // Helper to extract Stream Info (YouTube or Instagram)
    const getStreamInfo = (url) => {
        if (!url) return null;
        try {
            // 1. YouTube
            if (url.includes('youtube.com') || url.includes('youtu.be')) {
                let videoId = null;
                if (url.includes('youtube.com/watch')) {
                    videoId = new URL(url).searchParams.get('v');
                } else if (url.includes('youtu.be/')) {
                    videoId = url.split('youtu.be/')[1]?.split('?')[0];
                } else if (url.includes('youtube.com/embed/')) {
                    videoId = url.split('embed/')[1]?.split('?')[0];
                } else if (url.includes('youtube.com/live/')) {
                    videoId = url.split('live/')[1]?.split('?')[0];
                }
                return videoId ? { type: 'youtube', src: `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1` } : null;
            }

            // 2. Instagram
            if (url.includes('instagram.com')) {
                // Handle /p/, /reel/, /tv/
                // Default regex to capture path
                // format: https://www.instagram.com/p/CODE/ or https://www.instagram.com/reel/CODE/
                const parts = url.split('/');
                const typeIndex = parts.findIndex(p => p === 'p' || p === 'reel' || p === 'tv');
                if (typeIndex !== -1 && parts[typeIndex + 1]) {
                    const code = parts[typeIndex + 1];
                    return { type: 'instagram', src: `https://www.instagram.com/${parts[typeIndex]}/${code}/embed` };
                }
                return null;
            }
        } catch (e) {
            return null;
        }
        return null; // unsupported
    };

    const streams = [
        getStreamInfo(liveStreamUrl),
        getStreamInfo(liveStreamUrl2),
        getStreamInfo(liveStreamUrl3),
        getStreamInfo(liveStreamUrl4),
        getStreamInfo(liveStreamUrl5)
    ];

    return (
        <div className="min-h-screen pb-10">
            <Header />
            <Carousel />

            {/* Scrolling News Ticker */}
            <div className="max-w-7xl mx-auto px-4 mt-6">
                {(() => {
                    const { scrollingText } = useGame();
                    if (!scrollingText) return null;
                    return (
                        <div className="glass-card flex items-center overflow-hidden h-12 border-l-4 border-l-orange-500 relative">
                            {/* Static Badge */}
                            <div className="bg-orange-600 text-white font-black px-4 h-full flex items-center z-10 shrink-0 shadow-lg uppercase tracking-wider text-sm">
                                Latest
                            </div>
                            {/* Scrolling Text */}
                            <div className="flex-1 overflow-hidden relative h-full flex items-center">
                                <div className="animate-marquee whitespace-nowrap text-yellow-300 font-bold text-base md:text-lg tracking-wider drop-shadow-[0_0_10px_rgba(253,224,71,0.8)] absolute min-w-full pl-4 uppercase">
                                    {scrollingText}
                                </div>
                            </div>
                        </div>
                    );
                })()}
            </div>

            <div className="max-w-7xl mx-auto px-4 mt-8">
                <div className="flex flex-col md:flex-row gap-6">
                    {/* Left Column: Matches (65%) */}
                    <div className="w-full md:w-[65%]">
                        <div className="mb-6">
                            <MatchList onSelectMatch={(m) => setSelectedMatchId(m.id)} />
                        </div>
                    </div>

                    {/* Right Column: Sidebar (35%) */}
                    <div className="w-full md:w-[35%]">
                        {/* Live Stream Players (No Headers/Labels as requested) */}
                        {streams.map((stream, index) => stream && (
                            <div key={index} className="glass-card overflow-hidden mb-4 border-l-4 border-l-cyan-500 shadow-xl shadow-cyan-500/10 animate-fade-in group relative">
                                <div className={`w-full bg-black relative ${stream.type === 'instagram' ? 'h-[500px]' : 'aspect-video'}`}>
                                    <iframe
                                        width="100%"
                                        height="100%"
                                        src={stream.src}
                                        title={`Live Stream ${index + 1}`}
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                        className="absolute inset-0 w-full h-full"
                                    ></iframe>

                                    {/* Score Overlay for Stream 1 (index 0) */}
                                    {index === 0 && liveStreamMatchId && (() => {
                                        const overlayMatch = matches.find(m => m.id === parseInt(liveStreamMatchId));
                                        if (!overlayMatch) return null;

                                        const { team1, team2, score, status, oversChoosen } = overlayMatch;
                                        const t1s = score.team1;
                                        const t2s = score.team2;

                                        // --- LOGIC FROM MatchList.jsx ---
                                        let overlayText = "";

                                        // 1. Calculate Status Checks
                                        const matchOvers = parseInt(oversChoosen) || 20;
                                        const isTeam1AllOut = (t1s.wickets || 0) >= 10;
                                        const isTeam1OversDone = (t1s.overs || 0) >= matchOvers;
                                        const isTeam2ActuallyPlaying = (t2s.overs || 0) > 0 || (t2s.balls || 0) > 0 || (t2s.runs || 0) > 0;
                                        const isFirstInningsDone = isTeam1AllOut || isTeam1OversDone || isTeam2ActuallyPlaying;

                                        // 2. LIVE STATUS: Show Equation "Need X runs in Y balls"
                                        if (status === 'live' && isFirstInningsDone) {
                                            const target = (t1s.runs || 0) + 1;
                                            const runsNeeded = Math.max(0, target - (t2s.runs || 0));

                                            // Balls Left Calculation (Fallback Logic)
                                            // Ideally we use detailed over data if available, but simple calc is:
                                            const totalBalls = matchOvers * 6;
                                            const currentOvers = Number(t2s.overs || 0);
                                            const completedOvers = Math.floor(currentOvers);
                                            const ballsInCurrentOver = Math.round((currentOvers - completedOvers) * 10);
                                            const ballsBowled = (completedOvers * 6) + ballsInCurrentOver;
                                            const ballsLeft = Math.max(0, totalBalls - ballsBowled);

                                            overlayText = `Need ${runsNeeded} runs in ${ballsLeft} balls`;
                                        }
                                        // 3. COMPLETED STATUS: Show Result
                                        else if (status === 'completed') {
                                            if (t1s.runs > t2s.runs) {
                                                overlayText = `${team1} won by ${t1s.runs - t2s.runs} runs`;
                                            } else if (t2s.runs > t1s.runs) {
                                                overlayText = `${team2} won by ${10 - t2s.wickets} wickets`;
                                            } else {
                                                overlayText = "Match Tied";
                                            }
                                        }

                                        return (
                                            <div className="absolute bottom-4 left-4 right-4 animate-fade-in pointer-events-none">
                                                {/* Broadcast Style Overlay Container */}
                                                <div className="flex items-center justify-between bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-t-2 border-yellow-500 shadow-2xl rounded-lg overflow-hidden relative h-12">

                                                    {/* Background Pattern/Texture (Optional) */}
                                                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>

                                                    {/* Team 1 Section (Left) */}
                                                    <div className="flex items-center h-full pl-3 pr-4 bg-gradient-to-r from-blue-900/80 to-transparent relative z-10 min-w-[30%]">
                                                        <div className="flex flex-col">
                                                            <span className="text-yellow-400 font-black text-xs uppercase tracking-wider shadow-black drop-shadow-md leading-none mb-0.5">{team1}</span>
                                                            <div className="flex items-baseline gap-1">
                                                                <span className="text-white font-mono font-bold text-lg leading-none shadow-black drop-shadow-lg">{t1s.runs}/{t1s.wickets}</span>
                                                                <span className="text-gray-400 text-[10px] font-bold">({t1s.overs})</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Center Status / Equation */}
                                                    <div className="flex-1 flex items-center justify-center h-full relative z-10 px-2">
                                                        {overlayText ? (
                                                            <div className={`px-3 py-1 rounded bg-black/40 border border-white/5 backdrop-blur-sm`}>
                                                                <span className={`text-[10px] md:text-xs font-black uppercase tracking-widest ${status === 'live' ? 'text-red-400 animate-pulse' : 'text-green-400'}`}>
                                                                    {overlayText}
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest bg-black/30 px-2 py-0.5 rounded">
                                                                {status === 'live' ? '1st Innings' : status}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Team 2 Section (Right) */}
                                                    <div className="flex items-center justify-end h-full pr-3 pl-4 bg-gradient-to-l from-purple-900/80 to-transparent relative z-10 min-w-[30%] text-right">
                                                        <div className="flex flex-col items-end">
                                                            <span className="text-cyan-400 font-black text-xs uppercase tracking-wider shadow-black drop-shadow-md leading-none mb-0.5">{team2}</span>
                                                            <div className="flex items-baseline gap-1 justify-end">
                                                                <span className="text-gray-400 text-[10px] font-bold">({t2s.overs})</span>
                                                                <span className="text-white font-mono font-bold text-lg leading-none shadow-black drop-shadow-lg">{t2s.runs}/{t2s.wickets}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Decorative Divider Lines */}
                                                    <div className="absolute left-[30%] top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent"></div>
                                                    <div className="absolute right-[30%] top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent"></div>
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>
                            </div>
                        ))}

                        <PointsTable />
                        <AllTeams />
                        <LeadershipTables />
                    </div>
                </div>
            </div>

            {/* Modal for Scorecard */}
            {selectedMatch && (
                <ScoreCard
                    match={selectedMatch}
                    onClose={() => setSelectedMatchId(null)}
                />
            )}

            <Footer />
        </div>
    );
};

export default Home;
