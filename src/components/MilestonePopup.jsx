import React, { useEffect, useState } from 'react';
import { Award, Zap, Star, Crown } from 'lucide-react';

const MilestonePopup = ({ player, onClose, type = '50' }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
        }, 3000);

        return () => clearTimeout(timer);
    }, [onClose]);

    const isCentury = type === '100';
    const isWicket = type === 'wickets';

    // Theme Configuration
    let theme;
    if (isCentury) {
        theme = {
            border: 'border-cyan-500/50',
            shadow: 'shadow-[0_0_50px_rgba(6,182,212,0.5)]',
            glow: 'bg-cyan-500',
            textGradient: 'from-cyan-200 via-cyan-400 to-cyan-200',
            iconColor: 'text-cyan-400',
            divider: 'bg-cyan-500',
            subText: 'text-cyan-500/80',
            Icon: Crown
        };
    } else if (isWicket) {
        theme = {
            border: 'border-purple-500/50',
            shadow: 'shadow-[0_0_50px_rgba(168,85,247,0.5)]',
            glow: 'bg-purple-500',
            textGradient: 'from-purple-200 via-purple-400 to-purple-200',
            iconColor: 'text-purple-400',
            divider: 'bg-purple-500',
            subText: 'text-purple-500/80',
            Icon: Zap // Or Target/Crosshair/Gavel? Zap is good for "Strikes".
        };
    } else {
        // Default 50 Runs
        theme = {
            border: 'border-yellow-500/50',
            shadow: 'shadow-[0_0_50px_rgba(234,179,8,0.5)]',
            glow: 'bg-yellow-500',
            textGradient: 'from-yellow-200 via-yellow-400 to-yellow-200',
            iconColor: 'text-yellow-400',
            divider: 'bg-yellow-500',
            subText: 'text-yellow-500/80',
            Icon: Award
        };
    }

    const ThemeIcon = theme.Icon;

    // Dynamic Content
    let titleText = '50 RUNS!';
    if (isCentury) titleText = 'CENTURY!';
    if (isWicket) titleText = `${player.wickets} WICKETS!`;

    const mainStat = isWicket ? player.wickets : player.runs;
    const subStat = isWicket ? `${player.runsConceded}` : `(${player.balls})`;
    const subStatLabel = isWicket ? 'Runs' : '';

    return (
        <div
            onClick={() => { setIsVisible(false); setTimeout(onClose, 300); }}
            className={`fixed inset-0 flex items-center justify-center z-[100] cursor-pointer transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        >
            <div
                onClick={(e) => {
                    // Optional: Prevent closing if clicking on the card itself?
                    // User said "click anywere in the screen". Usually this means clicking the card also closes it.
                    // So I will NOT stop propagation.
                }}
                className={`
                relative bg-black/90 backdrop-blur-xl p-6 rounded-2xl border ${theme.border} ${theme.shadow}
                transform transition-all duration-500 flex flex-col items-center gap-3 min-w-[300px]
                ${isVisible ? 'scale-100 translate-y-0' : 'scale-90 translate-y-10'}
            `}>
                {/* Decorative Elements */}
                <div className="absolute -top-10 left-1/2 -translate-x-1/2">
                    <div className="relative">
                        <div className={`absolute inset-0 ${theme.glow} blur-xl opacity-50 animate-pulse`}></div>
                        <ThemeIcon size={64} className={`${theme.iconColor} drop-shadow-lg relative z-10`} />
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <h2 className={`text-transparent bg-clip-text bg-gradient-to-r ${theme.textGradient} font-black text-3xl uppercase tracking-widest animate-shine`}>
                        {titleText}
                    </h2>
                    <div className={`w-16 h-1 ${theme.divider} rounded-full mx-auto my-2`}></div>
                </div>

                <div className="text-center space-y-1">
                    <h3 className="text-white font-bold text-xl">{player.name}</h3>
                    <p className={`${theme.subText} text-sm font-medium uppercase tracking-wider`}>{player.team}</p>
                </div>

                <div className="bg-white/10 rounded-lg px-6 py-2 mt-2 border border-white/10">
                    <span className="text-2xl font-mono font-bold text-white">
                        {mainStat}
                        <span className="text-lg text-gray-400 ml-1">{subStat}</span>
                    </span>
                </div>
            </div>
        </div>
    );
};

export default MilestonePopup;
