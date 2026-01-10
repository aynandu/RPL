import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';

const Carousel = () => {
    const { images } = useGame();
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (!images || images.length === 0) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % images.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [images]);

    if (!images || images.length === 0) {
        return <div className="h-[60vh] w-full bg-gray-200 flex items-center justify-center">No Images Available</div>;
    }

    return (
        <div className="h-[60vh] w-full relative overflow-hidden group border-b-4 border-cyan-500/50 shadow-[0_10px_50px_rgba(6,182,212,0.15)]">
            {images.map((img, index) => (
                <div
                    key={index}
                    className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${index === currentIndex ? 'opacity-100' : 'opacity-0'
                        }`}
                >
                    {/* Blurred Background (Deep Space Effect) */}
                    <div className="absolute inset-0 overflow-hidden bg-slate-950">
                        <img
                            src={img}
                            alt=""
                            className="w-full h-full object-cover blur-3xl scale-110 opacity-40 mix-blend-overlay"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-transparent to-slate-950/90"></div>
                    </div>

                    {/* Main Image Container */}
                    <div className="relative h-full w-full flex items-center justify-center p-4 md:p-10">
                        <div className="relative max-w-7xl w-full h-full rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 group-hover:ring-cyan-500/50 transition-all duration-500">
                            <img
                                src={img}
                                alt={`Slide ${index}`}
                                className="w-full h-full object-cover md:object-contain relative z-10 drop-shadow-2xl transition-transform duration-[10s] ease-linear hover:scale-105"
                                style={{ transform: index === currentIndex ? 'scale(1.05)' : 'scale(1)' }}
                            />

                            {/* Overlay Gradient for Text Readability */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-20"></div>
                        </div>
                    </div>
                </div>
            ))}

            {/* Custom Navigation Dots (Neon Glints) */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3 z-30">
                {images.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrentIndex(idx)}
                        className={`group relative transition-all duration-300 ${idx === currentIndex ? 'w-12' : 'w-3'}`}
                    >
                        <div className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex
                            ? 'bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]'
                            : 'bg-white/30 hover:bg-white/60'
                            }`}></div>
                    </button>
                ))}
            </div>

            {/* Side Navigation Gradients */}
            <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-slate-950/80 to-transparent pointer-events-none"></div>
            <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-slate-950/80 to-transparent pointer-events-none"></div>
        </div>
    );
};

export default Carousel;
