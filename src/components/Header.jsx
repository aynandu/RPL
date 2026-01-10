import React from 'react';

const Header = () => {
    return (
        <header className="h-[10vh] w-full sticky top-0 z-50 glass-card rounded-none border-b border-white/10 backdrop-blur-xl bg-slate-950/80 shadow-2xl flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 via-purple-900/20 to-pink-900/20 animate-pulse-slow"></div>

            <div className="relative z-10 flex flex-col items-center">
                <h1 className="text-3xl md:text-5xl font-black uppercase tracking-widest font-mono text-center">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                        Revenue Premier League
                    </span>
                    <span className="ml-3 text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)] animate-pulse">S2</span>
                </h1>
                <div className="w-full h-0.5 mt-2 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50"></div>
            </div>

            {/* Premium Decorative elements */}
            <div className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-blue-500/10 to-transparent skew-x-12 -ml-16"></div>
            <div className="absolute bottom-0 right-0 w-32 h-full bg-gradient-to-l from-purple-500/10 to-transparent skew-x-12 -mr-16"></div>
        </header>
    );
};

export default Header;
