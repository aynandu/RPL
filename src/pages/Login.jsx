import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useGame();
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (login(username, password)) {
            navigate('/admin/dashboard');
        } else {
            setError('Invalid credentials');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
            {/* Animated Background Orbs */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-10 left-10 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                <div className="absolute top-10 right-10 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-10 left-20 w-64 h-64 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
            </div>

            <div className="glass-card p-8 w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 relative z-10">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                        Admin Access
                    </h1>
                    <p className="text-gray-400 text-sm mt-2">Enter your credentials to manage the league</p>
                </div>

                {error && <div className="bg-red-500/10 border border-red-500/20 text-red-200 p-3 rounded-xl mb-6 text-sm flex items-center gap-2 animate-bounce"><span className="w-2 h-2 bg-red-500 rounded-full"></span> {error}</div>}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full glass-input p-3 rounded-xl transition-all outline-none"
                            placeholder="Enter username"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full glass-input p-3 rounded-xl transition-all outline-none"
                            placeholder="Enter password"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full py-3 px-4 border border-transparent rounded-full shadow-lg text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-blue-500/30 transition-all hover:scale-[1.02]"
                    >
                        Sign In Details
                    </button>
                    <div className="text-center text-xs text-gray-500 mt-4">
                        Revenue Premier League &copy; 2024
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
