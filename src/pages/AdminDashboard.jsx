import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Plus, Trash2, Edit2, Upload } from 'lucide-react';
import ScoreUpdateForm from '../components/ScoreUpdateForm'; // We will create this next

const AdminDashboard = () => {
    const { matches, images, addMatch, deleteMatch, updateImages } = useGame();
    const [editingMatch, setEditingMatch] = useState(null);
    const [newImageUrl, setNewImageUrl] = useState('');

    const handleAddImage = (e) => {
        e.preventDefault();
        if (newImageUrl) {
            updateImages([...images, newImageUrl]);
            setNewImageUrl('');
        }
    };

    const handleRemoveImage = (index) => {
        const newImages = images.filter((_, i) => i !== index);
        updateImages(newImages);
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                updateImages([...images, reader.result]);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCreateMatch = () => {
        const newMatch = {
            team1: "Team A",
            team2: "Team B",
            status: "upcoming",
            score: {
                team1: { runs: 0, wickets: 0, overs: 0 },
                team2: { runs: 0, wickets: 0, overs: 0 },
            },
            batting: null,
            bowling: null,
        };
        addMatch(newMatch);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <h1 className="text-3xl font-bold mb-8 text-gray-800">Admin Dashboard</h1>

            {/* Carousel Management */}
            <div className="bg-white p-6 rounded-lg shadow mb-8 border-2 border-cyan-500">
                <h2 className="text-xl font-bold mb-4 text-gray-800">Manage Carousel Images</h2>
                <div className="flex gap-4 mb-4 flex-wrap">
                    <form onSubmit={handleAddImage} className="flex gap-2 flex-1 min-w-[300px]">
                        <input
                            type="text"
                            value={newImageUrl}
                            onChange={(e) => setNewImageUrl(e.target.value)}
                            placeholder="Image URL"
                            className="flex-1 border p-2 rounded"
                        />
                        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2">
                            <Plus size={16} /> Add URL
                        </button>
                    </form>

                    <div className="flex items-center gap-2">
                        <span className="text-gray-500 font-bold">OR</span>
                        <label className="bg-green-600 text-white px-4 py-2 rounded cursor-pointer hover:bg-green-700 flex items-center gap-2">
                            <Upload size={16} /> Upload Image
                            <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                        </label>
                    </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {images.map((img, idx) => (
                        <div key={idx} className="relative group aspect-video">
                            <img src={img} alt="" className="w-full h-full object-cover rounded" />
                            <button
                                onClick={() => handleRemoveImage(idx)}
                                className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Match Management */}
            <div className="bg-slate-900 p-6 rounded-lg shadow border border-slate-800">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white">Matches</h2>
                    <button onClick={handleCreateMatch} className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-500 transition-colors">
                        <Plus size={16} /> Create Match
                    </button>
                </div>

                <div className="space-y-4">
                    {matches.map(match => (
                        <div key={match.id} className="border border-slate-700 bg-slate-800/50 p-4 rounded-lg flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-lg text-gray-100">{match.team1} vs {match.team2}</h3>
                                <div className="text-sm text-gray-400">
                                    Status: <span className="font-semibold uppercase text-gray-300">{match.status}</span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setEditingMatch(match)}
                                    className="bg-indigo-600 text-white px-3 py-1.5 rounded flex items-center gap-1 hover:bg-indigo-700"
                                >
                                    <Edit2 size={16} /> Update Score
                                </button>
                                <button
                                    onClick={() => deleteMatch(match.id)}
                                    className="bg-red-500 text-white px-3 py-1.5 rounded flex items-center gap-1 hover:bg-red-600"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Score Update Modal */}
            {editingMatch && (
                <ScoreUpdateForm
                    match={editingMatch}
                    onClose={() => setEditingMatch(null)}
                />
            )}
        </div>
    );
};

export default AdminDashboard;
