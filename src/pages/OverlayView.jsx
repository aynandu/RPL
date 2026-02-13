import React from 'react';
import { useParams } from 'react-router-dom';
import BroadcastOverlay from '../components/BroadcastOverlay';

const OverlayView = () => {
    const { matchId } = useParams();

    return (
        <div className="w-full h-screen bg-transparent overflow-hidden flex items-end justify-center">
            {/* 
                OBS Browser Source usually has a transparent background by default if body is transparent.
                We ensure the container pushes content to the bottom.
            */}
            <BroadcastOverlay matchId={matchId} />
        </div>
    );
};

export default OverlayView;
