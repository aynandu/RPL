import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import Toast from '../components/ui/Toast';
import ConfirmModal from '../components/ui/ConfirmModal';

const UIContext = createContext();

export const useUI = () => {
    const context = useContext(UIContext);
    if (!context) {
        throw new Error('useUI must be used within a UIProvider');
    }
    return context;
};

export const UIProvider = ({ children }) => {
    // --- Toast State ---
    const [toasts, setToasts] = useState([]);

    // Using a ref for toast ID counter to avoid re-renders
    const toastIdRef = useRef(0);

    const addToast = useCallback((message, type = 'info', duration = 3000) => {
        const id = toastIdRef.current++;
        setToasts(prev => [...prev, { id, message, type, duration }]);
        return id;
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const toast = {
        success: (msg, duration) => addToast(msg, 'success', duration),
        error: (msg, duration) => addToast(msg, 'error', duration),
        info: (msg, duration) => addToast(msg, 'info', duration),
        warning: (msg, duration) => addToast(msg, 'warning', duration),
        custom: (msg, type, duration) => addToast(msg, type, duration)
    };

    // --- Modal State ---
    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        message: '',
        title: 'Confirm',
        resolve: null,
        reject: null
    });

    const confirm = useCallback((message, title = 'Confirm Action') => {
        return new Promise((resolve, reject) => {
            setModalConfig({
                isOpen: true,
                message,
                title,
                resolve,
                reject
            });
        });
    }, []);

    const handleConfirm = () => {
        if (modalConfig.resolve) modalConfig.resolve(true);
        setModalConfig(prev => ({ ...prev, isOpen: false }));
    };

    const handleCancel = () => {
        if (modalConfig.resolve) modalConfig.resolve(false);
        setModalConfig(prev => ({ ...prev, isOpen: false }));
    };

    return (
        <UIContext.Provider value={{ toast, confirm }}>
            {children}

            {/* Render Toasts */}
            <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-3 pointer-events-none">
                {toasts.map(t => (
                    <Toast
                        key={t.id}
                        {...t}
                        onClose={removeToast}
                    />
                ))}
            </div>

            {/* Render Modal */}
            <ConfirmModal
                isOpen={modalConfig.isOpen}
                message={modalConfig.message}
                title={modalConfig.title}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
            />
        </UIContext.Provider>
    );
};
