import React, { useState } from 'react';
import Header from '../components/Header';
import Carousel from '../components/Carousel';
import MatchList from '../components/MatchList';
import ScoreCard from '../components/ScoreCard';
import PointsTable from '../components/PointsTable';
import AllTeams from '../components/AllTeams';
import LeadershipTables from '../components/LeadershipTables';
import { useGame } from '../context/GameContext';

const Home = () => {
    const { matches } = useGame();
    const [selectedMatchId, setSelectedMatchId] = useState(null);

    // Derived state: Always get the latest match data from context
    const selectedMatch = selectedMatchId ? matches.find(m => m.id === selectedMatchId) : null;

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
        </div>
    );
};

export default Home;
