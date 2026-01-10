import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_MATCHES, INITIAL_IMAGES, INITIAL_POINTS, ALL_TEAMS } from '../lib/initialData';

const GameContext = createContext();

export const useGame = () => useContext(GameContext);

export const GameProvider = ({ children }) => {
    // Initialize state from LocalStorage or fallback to initial data
    const [matches, setMatches] = useState(() => {
        const saved = localStorage.getItem('rpl_matches');
        return saved ? JSON.parse(saved) : INITIAL_MATCHES;
    });

    const [images, setImages] = useState(() => {
        const saved = localStorage.getItem('rpl_images');
        return saved ? JSON.parse(saved) : INITIAL_IMAGES;
    });

    const [pointsTable, setPointsTable] = useState(() => {
        const saved = localStorage.getItem('rpl_points');
        return saved ? JSON.parse(saved) : INITIAL_POINTS;
    });

    const [isAdmin, setIsAdmin] = useState(() => {
        return localStorage.getItem('rpl_is_admin') === 'true';
    });

    // Persist changes
    useEffect(() => {
        localStorage.setItem('rpl_matches', JSON.stringify(matches));
    }, [matches]);

    useEffect(() => {
        localStorage.setItem('rpl_images', JSON.stringify(images));
    }, [images]);

    useEffect(() => {
        localStorage.setItem('rpl_points', JSON.stringify(pointsTable));
    }, [pointsTable]);

    useEffect(() => {
        localStorage.setItem('rpl_is_admin', isAdmin);
    }, [isAdmin]);

    // Derived state
    const allTeams = pointsTable.map(team => team.team);

    // Actions
    const login = (username, password) => {
        if (username === 'admin' && password === 'admin') {
            setIsAdmin(true);
            return true;
        }
        return false;
    };

    const logout = () => {
        setIsAdmin(false);
    };

    const updateMatch = (id, updates) => {
        setMatches(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
    };

    const addMatch = (match) => {
        setMatches(prev => {
            const maxId = prev.length > 0 ? Math.max(...prev.map(m => m.id)) : 0;
            // Ensure nextId is reasonable. If maxId is huge (timestamp), this will continue being huge.
            // But for new clean starts, it works.
            // If we want to force small numbers even if timestamps exist, we'd need to re-index, which is dangerous.
            // Let's stick to safe increment.
            return [...prev, { ...match, id: maxId + 1 }];
        });
    };

    const deleteMatch = (id) => {
        setMatches(prev => prev.filter(m => m.id !== id));
    };

    const updateImages = (newImages) => {
        setImages(newImages);
    };

    const updatePointsTable = (updatedTable) => {
        setPointsTable(updatedTable);
    };

    return (
        <GameContext.Provider value={{
            matches,
            images,
            isAdmin,
            login,
            logout,
            updateMatch,
            addMatch,
            deleteMatch,
            updateImages,
            pointsTable,
            updatePointsTable,
            allTeams
        }}>
            {children}
        </GameContext.Provider>
    );
};
