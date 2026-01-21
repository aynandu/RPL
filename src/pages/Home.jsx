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
    const embedUrl3 = getEmbedUrl(liveStreamUrl3);
    const embedUrl4 = getEmbedUrl(liveStreamUrl4);
    const embedUrl5 = getEmbedUrl(liveStreamUrl5);

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
                        {/* Live Stream Players (No Headers/Labels as requested) */}
                        {[embedUrl, embedUrl2, embedUrl3, embedUrl4, embedUrl5].map((url, index) => url && (
                            <div key={index} className="glass-card overflow-hidden mb-4 border-l-4 border-l-cyan-500 shadow-xl shadow-cyan-500/10 animate-fade-in group">
                                <div className="aspect-video w-full bg-black relative">
                                    <iframe
                                        width="100%"
                                        height="100%"
                                        src={`${url}?autoplay=1&mute=1&rel=0`}
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
