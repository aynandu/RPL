import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Users } from 'lucide-react';
import PlayerManager from './PlayerManager';

const AllTeams = () => {
    const { allTeams } = useGame();
    const [selectedTeam, setSelectedTeam] = useState(null);

    return (
        <div className="bg-slate-900 rounded-xl shadow-md overflow-hidden border border-slate-800">
            <div className="bg-slate-800 p-3 text-white font-bold flex items-center gap-2 border-b border-slate-700">
                <Users size={18} />
                All Teams
            </div>
            <div className="p-4">
                <ul className="space-y-2">
                    {allTeams.map((team, idx) => (
                        <li
                            key={idx}
                            onClick={() => setSelectedTeam(team)}
                            className="p-2 bg-slate-800 rounded border border-slate-700 font-medium text-gray-300 hover:bg-slate-700 transition-colors cursor-pointer hover:text-white"
                        >
                            {team}
                        </li>
                    ))}
                </ul>
            </div>

            {selectedTeam && (
                <PlayerManager
                    teamName={selectedTeam}
                    onClose={() => setSelectedTeam(null)}
                    readOnly={true}
                />
            )}
        </div>
    );
};

export default AllTeams;
