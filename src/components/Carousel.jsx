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
        <div className="h-[60vh] w-full relative overflow-hidden group">
            {images.map((img, index) => (
                <div
                    key={index}
                    className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${index === currentIndex ? 'opacity-100' : 'opacity-0'
                        }`}
                >
                    {/* Blurred Background (Dim Glossy Black Effect) */}
                    <div className="absolute inset-0 overflow-hidden bg-black">
                        <img
                            src={img}
                            alt=""
                            className="w-full h-full object-cover blur-3xl scale-125 opacity-30"
                        />
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"></div>
                    </div>

                    {/* Main Image */}
                    <img
                        src={img}
                        alt={`Slide ${index}`}
                        className="w-full h-full object-contain relative z-10 drop-shadow-2xl"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-20"></div>
                </div>
            ))}

            {/* Dots indicator */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
                {images.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrentIndex(idx)}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${idx === currentIndex ? 'bg-yellow-400 w-6' : 'bg-white/50 hover:bg-white'
                            }`}
                    />
                ))}
            </div>
        </div>
    );
};

export default Carousel;
