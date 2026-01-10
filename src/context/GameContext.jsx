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

    const [allTeams, setAllTeams] = useState(ALL_TEAMS);

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
        setMatches(prev => [...prev, { ...match, id: Date.now() }]);
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
