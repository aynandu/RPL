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

                                        // Simple Equation Logic
                                        let equation = "";
                                        const isSecondInnings = t2s.runs > 0 || t2s.balls > 0 || t2s.overs > 0 || overlayMatch.batting === team2;

                                        if (status === 'live' && isSecondInnings) {
                                            const target = t1s.runs + 1;
                                            const runsNeed = Math.max(0, target - t2s.runs);
                                            // Balls Remaining
                                            const maxOvers = parseInt(oversChoosen, 10) || 6; // Default to 6 if missing
                                            const totalBalls = maxOvers * 6;
                                            const ballsBowled = (Math.floor(t2s.overs) * 6) + Math.round((t2s.overs % 1) * 10);
                                            const ballsLeft = Math.max(0, totalBalls - ballsBowled);
                                            equation = `Need ${runsNeed} off ${ballsLeft} balls`;
                                            if (t2s.runs >= target) equation = `${team2} Wins!`;
                                            if (t2s.wickets >= 10 || ballsLeft === 0 && runsNeed > 0) equation = `${team1} Wins!`;
                                        } else if (status === 'completed') {
                                            if (t1s.runs > t2s.runs) equation = `${team1} Won`;
                                            else if (t2s.runs > t1s.runs) equation = `${team2} Won`;
                                            else equation = "Match Tied";
                                        }

                                        return (
                                            <div className="absolute top-4 left-4 right-4 bg-black/70 backdrop-blur-sm p-3 rounded-xl border border-white/10 text-white shadow-lg animate-fade-in pointer-events-none">
                                                <div className="flex justify-between items-center mb-1">
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-yellow-400 text-sm whitespace-nowrap">{team1}</span>
                                                        <span className="font-mono text-xs font-bold">{t1s.runs}/{t1s.wickets} <span className="text-gray-400 font-normal">({t1s.overs})</span></span>
                                                    </div>
                                                    <div className="h-8 w-px bg-white/20 mx-2"></div>
                                                    <div className="flex flex-col text-right">
                                                        <span className="font-bold text-cyan-400 text-sm whitespace-nowrap">{team2}</span>
                                                        <span className="font-mono text-xs font-bold">{t2s.runs}/{t2s.wickets} <span className="text-gray-400 font-normal">({t2s.overs})</span></span>
                                                    </div>
                                                </div>
                                                {equation && (
                                                    <div className="mt-1 pt-1 border-t border-white/10 text-center">
                                                        <span className="text-xs font-bold text-green-400 uppercase tracking-wide animate-pulse">{equation}</span>
                                                    </div>
                                                )}
                                                {!equation && status === 'live' && (
                                                    <div className="mt-1 pt-1 border-t border-white/10 text-center">
                                                        <span className="text-[10px] uppercase tracking-widest text-gray-400">1st Innings</span>
                                                    </div>
                                                )}
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
