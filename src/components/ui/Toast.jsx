import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';

const Toast = ({ id, message, type = 'info', onClose, duration = 3000 }) => {
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            handleClose();
        }, duration);
        return () => clearTimeout(timer);
    }, [duration]);

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(() => onClose(id), 300); // Wait for exit animation
    };

    const icons = {
        success: <CheckCircle className="text-emerald-400" size={20} />,
        error: <XCircle className="text-red-400" size={20} />,
        info: <Info className="text-blue-400" size={20} />,
        warning: <AlertTriangle className="text-yellow-400" size={20} />
    };

    const bgColors = {
        success: 'bg-emerald-500/10 border-emerald-500/20',
        error: 'bg-red-500/10 border-red-500/20',
        info: 'bg-blue-500/10 border-blue-500/20',
        warning: 'bg-yellow-500/10 border-yellow-500/20'
    };

    return (
        <div
            className={`
                flex items-center gap-3 p-4 rounded-xl border backdrop-blur-md shadow-lg pointer-events-auto min-w-[300px] max-w-md
                transition-all duration-300 transform
                ${bgColors[type] || bgColors.info}
                ${isExiting ? 'opacity-0 translate-x-full scale-90' : 'opacity-100 translate-x-0 scale-100 animate-slide-in-right'}
            `}
            role="alert"
        >
            <div className="flex-shrink-0">{icons[type]}</div>
            <div className="flex-1 text-sm font-medium text-gray-100">{message}</div>
            <button
                onClick={handleClose}
                className="text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
            >
                <X size={16} />
            </button>
        </div>
    );
};

export default Toast;
