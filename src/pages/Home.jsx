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
    const { matches, liveStreamUrl, liveStreamUrl2, liveStreamUrl3, liveStreamUrl4, liveStreamUrl5 } = useGame();
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
                            <div key={index} className="glass-card overflow-hidden mb-4 border-l-4 border-l-cyan-500 shadow-xl shadow-cyan-500/10 animate-fade-in group">
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
