import React, { createContext, useContext, useState } from 'react';
import { CheckCircle, AlertCircle, X, Info } from 'lucide-react';

const UIContext = createContext();

export const useUI = () => useContext(UIContext);

export const UIProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = (message, type = 'info') => {
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev, { id, message, type }]);
        // Auto remove
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 3000);
    };

    const removeToast = (id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    const toast = {
        success: (msg) => addToast(msg, 'success'),
        error: (msg) => addToast(msg, 'error'),
        info: (msg) => addToast(msg, 'info')
    };

    return (
        <UIContext.Provider value={{ toast }}>
            {children}
            {/* Toast Container */}
            <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
                {toasts.map(t => (
                    <div key={t.id} className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl backdrop-blur-md border animate-fade-in transition-all ${t.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' :
                            t.type === 'error' ? 'bg-red-500/10 border-red-500/50 text-red-400' :
                                'bg-blue-500/10 border-blue-500/50 text-blue-400'
                        }`}>
                        {t.type === 'success' && <CheckCircle size={20} />}
                        {t.type === 'error' && <AlertCircle size={20} />}
                        {t.type === 'info' && <Info size={20} />}
                        <span className="text-sm font-bold">{t.message}</span>
                        <button onClick={() => removeToast(t.id)} className="opacity-50 hover:opacity-100 ml-2 p-1 hover:bg-white/10 rounded-full transition-colors">
                            <X size={14} />
                        </button>
                    </div>
                ))}
            </div>
        </UIContext.Provider>
    );
};
