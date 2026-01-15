import React from 'react';
import { AlertCircle } from 'lucide-react';

const ConfirmModal = ({ isOpen, message, onConfirm, onCancel, title = "Confirm Action" }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onCancel}
            ></div>

            {/* Modal Card */}
            <div className="relative bg-[#0f172a] border border-white/10 rounded-2xl shadow-2xl p-6 max-w-sm w-full animate-zoom-in overflow-hidden">
                {/* Glow Effect */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>

                <div className="relative flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4 text-red-400 border border-red-500/20">
                        <AlertCircle size={24} />
                    </div>

                    <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
                    <p className="text-gray-400 mb-6 text-sm leading-relaxed">
                        {message}
                    </p>

                    <div className="flex gap-3 w-full">
                        <button
                            onClick={onCancel}
                            className="flex-1 py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-semibold transition-colors border border-white/5 hover:border-white/10"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-semibold shadow-lg shadow-orange-500/20 transition-all hover:scale-[1.02]"
                        >
                            Confirm
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
