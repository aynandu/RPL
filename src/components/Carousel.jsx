import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';

const Carousel = () => {
    const { images } = useGame();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    // Auto-scroll logic
    useEffect(() => {
        if (!images || images.length === 0 || isPaused) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % images.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [images, isPaused]);

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
        setIsPaused(true);
        setTimeout(() => setIsPaused(false), 5000); // Resume after 5s
    };

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
        setIsPaused(true);
        setTimeout(() => setIsPaused(false), 5000);
    };

    if (!images || images.length === 0) {
        return <div className="h-[60vh] w-full bg-slate-900 flex items-center justify-center text-gray-500">No Images Available</div>;
    }

    const getSlideStyles = (index) => {
        // Handle cyclic logic for Previous and Next
        const length = images.length;
        const prevIndex = (currentIndex - 1 + length) % length;
        const nextIndex = (currentIndex + 1) % length;

        if (index === currentIndex) {
            // Center Active Slide
            return "z-30 scale-100 opacity-100 translate-x-0 shadow-[0_20px_50px_rgba(0,0,0,0.5)] ring-1 ring-white/10";
        } else if (index === prevIndex) {
            // Previous Slide (Left)
            return "z-20 scale-90 opacity-60 -translate-x-[60%] brightness-50 hover:opacity-80 hover:brightness-75 cursor-pointer";
        } else if (index === nextIndex) {
            // Next Slide (Right)
            return "z-20 scale-90 opacity-60 translate-x-[60%] brightness-50 hover:opacity-80 hover:brightness-75 cursor-pointer";
        } else {
            // Hidden Slides
            return "z-10 scale-75 opacity-0 translate-x-0 brightness-0 pointer-events-none";
        }
    };

    return (
        <div className="h-[65vh] w-full relative flex items-center justify-center overflow-hidden bg-slate-950 group border-b border-white/5">

            {/* Ambient Background Glow */}
            <div className={`absolute inset-0 bg-slate-950 transition-colors duration-1000`}>
                <div className="absolute inset-0 opacity-30 bg-gradient-to-br from-blue-900/20 via-slate-900 to-purple-900/20"></div>
            </div>

            {/* Slides Container */}
            <div className="relative w-full max-w-[1400px] h-[80%] flex items-center justify-center perspective-[1000px]">
                {images.map((img, index) => {
                    const isPrev = index === (currentIndex - 1 + images.length) % images.length;
                    const isNext = index === (currentIndex + 1) % images.length;

                    return (
                        <div
                            key={index}
                            onClick={() => {
                                if (isPrev) handlePrev();
                                if (isNext) handleNext();
                            }}
                            className={`absolute w-[70%] md:w-[60%] lg:w-[50%] aspect-video rounded-3xl overflow-hidden transition-all duration-700 ease-out will-change-transform ${getSlideStyles(index)}`}
                        >
                            <img
                                src={img}
                                alt={`Slide ${index}`}
                                className="w-full h-full object-cover"
                            />
                            {/* Glass overlay for inactive slides */}
                            {index !== currentIndex && <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[1px]"></div>}

                            {/* Gradient Overlay for active slide text (optional) */}
                            {index === currentIndex && (
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"></div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Navigation Buttons (Floating) */}
            <button
                onClick={handlePrev}
                className="absolute left-4 md:left-10 z-40 bg-white/10 hover:bg-white/20 text-white p-3 md:p-4 rounded-full backdrop-blur-md border border-white/10 transition-all hover:scale-110 active:scale-95 group/btn"
            >
                <ChevronLeft size={24} className="group-hover/btn:-translate-x-1 transition-transform" />
            </button>
            <button
                onClick={handleNext}
                className="absolute right-4 md:right-10 z-40 bg-white/10 hover:bg-white/20 text-white p-3 md:p-4 rounded-full backdrop-blur-md border border-white/10 transition-all hover:scale-110 active:scale-95 group/btn"
            >
                <ChevronRight size={24} className="group-hover/btn:translate-x-1 transition-transform" />
            </button>

            {/* Pagination Lines */}
            <div className="absolute bottom-6 flex gap-2 z-40">
                {images.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrentIndex(idx)}
                        className={`h-1.5 rounded-full transition-all duration-500 ${idx === currentIndex ? 'w-12 bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 'w-2 bg-white/20 hover:bg-white/40'
                            }`}
                    />
                ))}
            </div>

            {/* Play Button Indicator (Decorative, matches template) */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-40 pointer-events-none opacity-0 transition-opacity duration-300">
                {/* Could add a 'Play' icon here if it was video content, kept hidden for now as per 'photos' req */}
            </div>
        </div>
    );
};

export default Carousel;
