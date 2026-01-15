import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { useUI } from '../context/UIContext';
import { Plus, Trash2, Edit2, Upload } from 'lucide-react';
import ScoreUpdateForm from '../components/ScoreUpdateForm';
import PointsTableEditor from '../components/PointsTableEditor';
import TeamManager from '../components/TeamManager';
import Footer from '../components/Footer';

const AdminDashboard = () => {
    const { matches, images, addMatch, deleteMatch, updateImages, tournamentTitle, updateTournamentTitle, resetData, stadiums, addStadium, deleteStadium, oversOptions, addOverOption, deleteOverOption, liveStreamUrl, setLiveStreamUrl, liveStreamUrl2, setLiveStreamUrl2 } = useGame();
    const { toast } = useUI();
    const [editingMatch, setEditingMatch] = useState(null);
    const [newImageUrl, setNewImageUrl] = useState('');
    const [newStadium, setNewStadium] = useState('');
    const [newOverOption, setNewOverOption] = useState('');
    const [showResetModal, setShowResetModal] = useState(false);
    const [securityKey, setSecurityKey] = useState('');

    const handleResetData = () => {
        if (securityKey === '1015') {
            resetData();
            setShowResetModal(false);
            setSecurityKey('');
            toast.success('All data has been wiped successfully.');
        } else {
            toast.error('Wrong security key!');
            // We stay on the modal/dashboard as requested "show message and take him to admin dashboard"
            // The modal stays open or closes? "take hi, to admin dashboard" implies leaving the modal or just staying on screen.
            // I'll leave modal open or close it? "take him to admin dashboard" usually means redirect. 
            // If inside modal, closing it effectively takes him to dashboard.
            // But if key is wrong, better to let him try again or just alert?
            // "if security key is wrong show the wrong security key mesage and take hi, to admin dashboard."
            // Simple interpretation: Alert and Close Modal.
            setShowResetModal(false);
            setSecurityKey('');
        }
    };

    // Title Settings State
    const [titleSettings, setTitleSettings] = useState(tournamentTitle || { name: '', season: '' });

    // Sync state when context loads
    React.useEffect(() => {
        if (tournamentTitle) setTitleSettings(tournamentTitle);
    }, [tournamentTitle]);

    const handleUpdateTitle = () => {
        updateTournamentTitle(titleSettings);
        toast.success('Website Title Updated Successfully!');
    };

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
            manOfTheMatch: '',
            manOfTheMatch: '',
            tossResult: '',
            stadium: 'Indoor Stadium, Pramdom',
        };
        addMatch(newMatch);
    };

    return (
        <div className="min-h-screen p-6 space-y-8">
            <h1 className="text-4xl font-black mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 drop-shadow-lg">
                Admin Dashboard
            </h1>

            {/* Website Settings */}
            <div className="glass-card p-6 border-l-4 border-l-yellow-500">
                <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
                    <span className="w-2 h-8 bg-yellow-500 rounded-full inline-block"></span>
                    Website Settings
                </h2>
                <div className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 w-full">
                        <label className="block text-xs font-bold mb-1 text-gray-400 uppercase tracking-wider">Tournament Name</label>
                        <input
                            type="text"
                            value={titleSettings.name}
                            onChange={(e) => setTitleSettings({ ...titleSettings, name: e.target.value })}
                            className="w-full glass-input p-3 rounded-xl text-white placeholder-gray-600"
                            placeholder="e.g. Revenue Premier League"
                        />
                    </div>
                    <div className="w-full md:w-32">
                        <label className="block text-xs font-bold mb-1 text-gray-400 uppercase tracking-wider">Season Tag</label>
                        <input
                            type="text"
                            value={titleSettings.season}
                            onChange={(e) => setTitleSettings({ ...titleSettings, season: e.target.value })}
                            className="w-full glass-input p-3 rounded-xl text-white placeholder-gray-600"
                            placeholder="e.g. S2"
                        />
                    </div>
                    <button onClick={handleUpdateTitle} className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-yellow-500/20 transition-all whitespace-nowrap">
                        Update Title
                    </button>
                </div>
            </div>

            {/* Minimal Settings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {/* Danger Zone (Minimal) */}
                <div className="glass-card p-4 border-l-4 border-l-red-500 flex flex-col justify-between h-full">
                    <div>
                        <h2 className="text-lg font-bold mb-2 text-white flex items-center gap-2">
                            <span className="w-1.5 h-6 bg-red-500 rounded-full inline-block"></span>
                            Danger Zone
                        </h2>
                        <p className="text-gray-500 text-xs mb-4">
                            Wipe matches, points & players. No Undo.
                        </p>
                    </div>
                    <button
                        onClick={() => setShowResetModal(true)}
                        className="w-full bg-red-500/10 text-red-400 py-2 rounded-lg font-bold text-sm hover:bg-red-500/20 transition-all border border-red-500/20 flex items-center justify-center gap-2"
                    >
                        <Trash2 size={16} />
                        Wipe Data
                    </button>
                </div>

                {/* Stadium Management (Minimal) */}
                <div className="glass-card p-4 border-l-4 border-l-lime-500 h-full">
                    <h2 className="text-lg font-bold mb-3 text-white flex items-center gap-2">
                        <span className="w-1.5 h-6 bg-lime-500 rounded-full inline-block"></span>
                        Stadiums
                    </h2>
                    <div className="flex gap-2 mb-3">
                        <input
                            type="text"
                            value={newStadium}
                            onChange={(e) => setNewStadium(e.target.value)}
                            placeholder="Add Stadium"
                            className="flex-1 glass-input p-2 rounded-lg text-sm text-white outline-none focus:border-lime-500/50 placeholder-gray-600"
                        />
                        <button
                            onClick={() => {
                                if (newStadium.trim()) {
                                    addStadium(newStadium.trim());
                                    setNewStadium('');
                                }
                            }}
                            className="bg-lime-600 hover:bg-lime-500 text-white p-2 rounded-lg transition-colors"
                        >
                            <Plus size={18} />
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2 max-h-[100px] overflow-y-auto custom-scrollbar">
                        {stadiums && stadiums.map((stadium, idx) => (
                            <div key={idx} className="bg-white/5 border border-white/10 px-2 py-1 rounded text-xs flex items-center gap-2 group hover:bg-white/10 transition-colors">
                                <span className="text-gray-300">{stadium}</span>
                                <button
                                    onClick={() => deleteStadium(stadium)}
                                    className="text-gray-600 hover:text-red-400"
                                >
                                    <Trash2 size={12} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Over Options Management (Minimal) */}
                <div className="glass-card p-4 border-l-4 border-l-cyan-500 h-full">
                    <h2 className="text-lg font-bold mb-3 text-white flex items-center gap-2">
                        <span className="w-1.5 h-6 bg-cyan-500 rounded-full inline-block"></span>
                        Overs List
                    </h2>
                    <div className="flex gap-2 mb-3">
                        <input
                            type="text"
                            value={newOverOption}
                            onChange={(e) => setNewOverOption(e.target.value)}
                            placeholder="e.g. 10 Over"
                            className="flex-1 glass-input p-2 rounded-lg text-sm text-white outline-none focus:border-cyan-500/50 placeholder-gray-600"
                        />
                        <button
                            onClick={() => {
                                if (newOverOption.trim()) {
                                    addOverOption(newOverOption.trim());
                                    setNewOverOption('');
                                }
                            }}
                            className="bg-cyan-600 hover:bg-cyan-500 text-white p-2 rounded-lg transition-colors"
                        >
                            <Plus size={18} />
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2 max-h-[100px] overflow-y-auto custom-scrollbar">
                        {oversOptions && oversOptions.map((over, idx) => (
                            <div key={idx} className="bg-white/5 border border-white/10 px-2 py-1 rounded text-xs flex items-center gap-2 group hover:bg-white/10 transition-colors">
                                <span className="text-gray-300">{over}</span>
                                <button
                                    onClick={() => deleteOverOption(over)}
                                    className="text-gray-600 hover:text-red-400"
                                >
                                    <Trash2 size={12} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Live Stream Management (Minimal) */}
                <div className="glass-card p-4 border-l-4 border-l-purple-500 h-full">
                    <h2 className="text-lg font-bold mb-3 text-white flex items-center gap-2">
                        <span className="w-1.5 h-6 bg-purple-500 rounded-full inline-block"></span>
                        Live Stream
                    </h2>
                    <div className="space-y-3">
                        {/* Stream 1 */}
                        <div className="space-y-1">
                            <label className="text-white text-xs ml-1 opacity-70">Stream 1</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={liveStreamUrl}
                                    onChange={(e) => setLiveStreamUrl(e.target.value)}
                                    placeholder="Paste YouTube URL 1"
                                    className="flex-1 glass-input p-2 rounded-lg text-sm text-white outline-none focus:border-purple-500/50 placeholder-gray-600"
                                />
                                <button
                                    onClick={() => setLiveStreamUrl('')}
                                    className="bg-red-500/20 text-red-400 p-2 rounded-lg hover:bg-red-500 hover:text-white transition-colors"
                                    title="Clear Stream"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Stream 2 */}
                        <div className="space-y-1">
                            <label className="text-white text-xs ml-1 opacity-70">Stream 2</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={liveStreamUrl2}
                                    onChange={(e) => setLiveStreamUrl2(e.target.value)}
                                    placeholder="Paste YouTube URL 2"
                                    className="flex-1 glass-input p-2 rounded-lg text-sm text-white outline-none focus:border-purple-500/50 placeholder-gray-600"
                                />
                                <button
                                    onClick={() => setLiveStreamUrl2('')}
                                    className="bg-red-500/20 text-red-400 p-2 rounded-lg hover:bg-red-500 hover:text-white transition-colors"
                                    title="Clear Stream"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                    <p className="text-gray-500 text-xs mt-3">
                        Paste full YouTube URL to show player. Clear to hide.
                    </p>
                </div>
            </div>

            {/* Carousel Management */}
            <div className="glass-card p-6 border-l-4 border-l-cyan-500">
                <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
                    <span className="w-2 h-8 bg-cyan-500 rounded-full inline-block"></span>
                    Manage Carousel Images
                </h2>
                <div className="flex gap-4 mb-6 flex-wrap">
                    <form onSubmit={handleAddImage} className="flex gap-2 flex-1 min-w-[300px]">
                        <input
                            type="text"
                            value={newImageUrl}
                            onChange={(e) => setNewImageUrl(e.target.value)}
                            placeholder="Image URL"
                            className="flex-1 glass-input p-3 rounded-xl"
                        />
                        <button type="submit" className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-6 py-2 rounded-full flex items-center gap-2 hover:shadow-lg hover:shadow-cyan-500/20 transition-all font-semibold">
                            <Plus size={18} /> Add URL
                        </button>
                    </form>

                    <div className="flex items-center gap-2">
                        <span className="text-gray-500 font-bold px-2">OR</span>
                        <label className="bg-gradient-to-r from-emerald-600 to-green-600 text-white px-6 py-2 rounded-full cursor-pointer hover:shadow-lg hover:shadow-green-500/20 flex items-center gap-2 transition-all font-semibold">
                            <Upload size={18} /> Upload Image
                            <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                        </label>
                    </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {images.map((img, idx) => (
                        <div key={idx} className="relative group aspect-video rounded-xl overflow-hidden shadow-lg border border-white/10">
                            <img src={img} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button
                                    onClick={() => handleRemoveImage(idx)}
                                    className="bg-red-500/80 hover:bg-red-600 text-white p-3 rounded-full backdrop-blur-sm transition-transform hover:scale-110"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Points Table & Teams Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-8">
                    <PointsTableEditor />
                    <TeamManager />
                </div>

                {/* Match Management */}
                <div className="glass-card p-6 border-l-4 border-l-purple-500 h-fit">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                            <span className="w-2 h-8 bg-purple-500 rounded-full inline-block"></span>
                            Matches
                        </h2>
                        <button onClick={handleCreateMatch} className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-5 py-2.5 rounded-full flex items-center gap-2 hover:shadow-lg hover:shadow-purple-500/20 transition-all font-semibold">
                            <Plus size={18} /> Create Match
                        </button>
                    </div>

                    <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
                        {[...matches].sort((a, b) => b.id - a.id).map(match => (
                            <div key={match.id} className="bg-white/5 border border-white/5 hover:border-purple-500/30 p-5 rounded-2xl flex flex-col gap-4 transition-all hover:bg-white/[0.07]">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Match #{match.id}</div>
                                        <h3 className="font-bold text-xl text-white mb-1">{match.team1} <span className="text-gray-500 text-sm">vs</span> {match.team2}</h3>
                                        <div className="text-sm space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className={`w-2 h-2 rounded-full ${match.status === 'live' ? 'bg-red-500 animate-pulse' : match.status === 'completed' ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                                                <span className="font-medium text-gray-300 uppercase tracking-wider text-xs">{match.status}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setEditingMatch(match)}
                                            className="bg-indigo-500/20 text-indigo-300 p-2.5 rounded-full hover:bg-indigo-500 hover:text-white transition-all"
                                            title="Update Score"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button
                                            onClick={() => deleteMatch(match.id)}
                                            className="bg-red-500/20 text-red-400 p-2.5 rounded-full hover:bg-red-500 hover:text-white transition-all"
                                            title="Delete Match"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {matches.length === 0 && (
                            <div className="text-center text-gray-500 py-12">No matches scheduled</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Score Update Modal */}
            {editingMatch && (
                <ScoreUpdateForm
                    match={editingMatch}
                    onClose={() => setEditingMatch(null)}
                />
            )}


            {/* Reset Modal */}
            {
                showResetModal && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-[60] p-4 animate-fade-in">
                        <div className="bg-slate-900 w-full max-w-sm rounded-2xl shadow-2xl relative border border-red-500/50 p-6">
                            <h3 className="text-xl font-bold text-center mb-6 text-white flex flex-col items-center gap-2">
                                <Trash2 className="text-red-500 w-12 h-12" />
                                <span>Security Check</span>
                            </h3>

                            <p className="text-gray-400 text-sm text-center mb-4">
                                Enter the security key to wipe all data.
                            </p>

                            <input
                                type="password"
                                value={securityKey}
                                onChange={(e) => setSecurityKey(e.target.value)}
                                placeholder="Enter Security Key"
                                className="w-full glass-input p-3 rounded-xl text-center text-white mb-6 font-mono text-xl tracking-widest"
                                autoFocus
                            />

                            <div className="flex gap-3">
                                <button
                                    onClick={() => { setShowResetModal(false); setSecurityKey(''); }}
                                    className="flex-1 py-3 rounded-xl bg-slate-800 text-gray-300 font-bold hover:bg-slate-700 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleResetData}
                                    className="flex-1 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-500 transition-colors shadow-lg shadow-red-500/20"
                                >
                                    Wipe Data
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
            <Footer />
        </div>
    );
};

export default AdminDashboard;
