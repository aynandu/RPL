import React from 'react';

const Header = () => {
    return (
        <header className="h-[10vh] w-full bg-slate-900 text-white flex items-center justify-center shadow-lg relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/50 to-purple-900/50"></div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold uppercase tracking-wider z-10 text-center px-4 font-mono animate-fade-in-down">
                Revenue Premier League <span className="text-yellow-400">S2</span>
            </h1>
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-20 h-full bg-white/5 skew-x-12 -ml-10"></div>
            <div className="absolute bottom-0 right-0 w-20 h-full bg-white/5 skew-x-12 -mr-10"></div>
        </header>
    );
};

export default Header;
