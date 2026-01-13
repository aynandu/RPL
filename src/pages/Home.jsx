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
    const { matches, liveStreamUrl, liveStreamUrl2 } = useGame();
    const [selectedMatchId, setSelectedMatchId] = useState(null);

    // Derived state: Always get the latest match data from context
    const selectedMatch = selectedMatchId ? matches.find(m => m.id === selectedMatchId) : null;

    // Helper to extract YouTube Embed ID
    const getEmbedUrl = (url) => {
        if (!url) return null;
        try {
            // Handle standard watch URLs, short URLs, and embed URLs
            let videoId = null;
            if (url.includes('youtube.com/watch')) {
                videoId = new URL(url).searchParams.get('v');
            } else if (url.includes('youtu.be/')) {
                videoId = url.split('youtu.be/')[1]?.split('?')[0];
            } else if (url.includes('youtube.com/embed/')) {
                videoId = url.split('embed/')[1]?.split('?')[0];
            }
            return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
        } catch (e) {
            return null;
        }
    };

    const embedUrl = getEmbedUrl(liveStreamUrl);
    const embedUrl2 = getEmbedUrl(liveStreamUrl2);

    return (
        <div className="min-h-screen pb-10">
            <Header />
            <Carousel />

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
                        {/* Live Stream Player 1 */}
                        {embedUrl && (
                            <div className="glass-card overflow-hidden mb-4 border-l-4 border-l-red-600 shadow-xl shadow-red-500/10 animate-fade-in relative group">
                                <div className="p-4 bg-gradient-to-r from-red-600/20 to-transparent border-b border-white/10 flex justify-between items-center">
                                    <h3 className="font-bold text-white flex items-center gap-2">
                                        <span className="relative flex h-3 w-3">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                        </span>
                                        LIVE ACTION 1
                                    </h3>
                                    <span className="text-[10px] font-bold bg-red-600 px-2 py-0.5 rounded text-white tracking-widest uppercase">
                                        Streaming
                                    </span>
                                </div>
                                <div className="aspect-video w-full bg-black relative">
                                    <iframe
                                        width="100%"
                                        height="100%"
                                        src={`${embedUrl}?autoplay=1&mute=1&rel=0`}
                                        title="Live Stream 1"
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                        className="absolute inset-0 w-full h-full"
                                    ></iframe>
                                </div>
                            </div>
                        )}

                        {/* Live Stream Player 2 */}
                        {embedUrl2 && (
                            <div className="glass-card overflow-hidden mb-8 border-l-4 border-l-orange-500 shadow-xl shadow-orange-500/10 animate-fade-in relative group">
                                <div className="p-4 bg-gradient-to-r from-orange-600/20 to-transparent border-b border-white/10 flex justify-between items-center">
                                    <h3 className="font-bold text-white flex items-center gap-2">
                                        <span className="relative flex h-3 w-3">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
                                        </span>
                                        LIVE ACTION 2
                                    </h3>
                                    <span className="text-[10px] font-bold bg-orange-600 px-2 py-0.5 rounded text-white tracking-widest uppercase">
                                        Streaming
                                    </span>
                                </div>
                                <div className="aspect-video w-full bg-black relative">
                                    <iframe
                                        width="100%"
                                        height="100%"
                                        src={`${embedUrl2}?autoplay=1&mute=1&rel=0`}
                                        title="Live Stream 2"
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                        className="absolute inset-0 w-full h-full"
                                    ></iframe>
                                </div>
                            </div>
                        )}

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
