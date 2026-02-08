import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUI } from './UIContext';
import { INITIAL_MATCHES, INITIAL_IMAGES, INITIAL_POINTS, ALL_TEAMS } from '../lib/initialData';

const GameContext = createContext();

export const useGame = () => useContext(GameContext);

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const GameProvider = ({ children }) => {
    const { toast } = useUI();
    // State
    const [matches, setMatches] = useState([]);
    const [images, setImages] = useState(INITIAL_IMAGES); // Still local/stub for now or fetch if implemented
    const [pointsTable, setPointsTable] = useState([]);
    const [players, setPlayers] = useState([]);
    const [tournamentTitle, setTournamentTitle] = useState({ name: 'Revenue Premier League', season: 'S2' });
    const [stadiums, setStadiums] = useState(['Indoor Stadium, Pramdom', 'Turf, Pathanamthitta']);
    const [oversOptions, setOversOptions] = useState(['6 Over', '8 Over', '10 Over']);
    const [liveStreamUrl, setLiveStreamUrl] = useState('');
    const [liveStreamUrl2, setLiveStreamUrl2] = useState('');
    const [liveStreamUrl3, setLiveStreamUrl3] = useState('');
    const [liveStreamUrl4, setLiveStreamUrl4] = useState('');
    const [liveStreamUrl5, setLiveStreamUrl5] = useState('');
    const [scrollingText, setScrollingText] = useState('');
    const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem('rpl_is_admin') === 'true'); // Keep auth local for now

    // Fetch Data on Mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Matches
                const matchesRes = await fetch(`${API_BASE}/matches`);
                const matchesData = await matchesRes.json();
                setMatches(matchesData);

                // 2. Teams (Points Table)
                const teamsRes = await fetch(`${API_BASE}/teams`);
                const teamsData = await teamsRes.json();
                setPointsTable(teamsData);

                // 3. Players
                const playersRes = await fetch(`${API_BASE}/players`);
                const playersData = await playersRes.json();
                setPlayers(playersData);

                // 4. Settings
                const settingsRes = await fetch(`${API_BASE}/settings`);
                const settingsData = await settingsRes.json();
                if (settingsData) {
                    if (settingsData.tournamentTitle) setTournamentTitle(settingsData.tournamentTitle);
                    if (settingsData.stadiums && settingsData.stadiums.length) setStadiums(settingsData.stadiums);
                    if (settingsData.oversOptions && settingsData.oversOptions.length) setOversOptions(settingsData.oversOptions);
                    // Packed Storage for Live Streams (Fixes persistence for 3,4,5)
                    if (settingsData.liveStreamUrl) {
                        const parts = settingsData.liveStreamUrl.split('|');
                        setLiveStreamUrl(parts[0] || '');
                        // Check if packed string is used, otherwise fall back to discrete field for 2
                        setLiveStreamUrl2(parts[1] !== undefined ? parts[1] : (settingsData.liveStreamUrl2 || ''));
                        setLiveStreamUrl3(parts[2] || '');
                        setLiveStreamUrl4(parts[3] || '');
                        setLiveStreamUrl5(parts[4] || '');
                    } else if (settingsData.liveStreamUrl2) {
                        // Legacy fallback
                        setLiveStreamUrl2(settingsData.liveStreamUrl2);
                    }
                    if (settingsData.images && settingsData.images.length > 0) {
                        setImages(settingsData.images);
                    }
                    if (settingsData.scrollingText) setScrollingText(settingsData.scrollingText);
                }

                // Initial Seeding Logic (Simplistic)
                if (matchesData.length === 0 && teamsData.length === 0) {
                    // console.log("Seeding initial data..."); 
                    // Ideally call a seed API, but for now we start empty or manual entry
                }

            } catch (error) {
                console.error("Failed to fetch initial data:", error);
            }
        };

        fetchData();

        // Polling for live updates (Optional but good for multi-user)
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, []);

    // Auth Persist
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

    // Helper: Recalculate Points Table based on Completed Matches
    const recalculateStandings = (currentMatches, currentTable) => {
        // 1. Reset current table stats (keep team names and initial structure)
        // Or better, map over allTeams to ensure we cover everyone
        // But currentTable might have teams not in matches yet.
        // Let's create a map for O(1) access
        const teamStats = {};

        // Initialize from existing table (to keep teams that haven't played yet)
        currentTable.forEach(t => {
            teamStats[t.team] = {
                team: t.team,
                played: 0,
                won: 0,
                lost: 0,
                tied: 0,
                points: 0,
                nrr: 0,
                runsFor: 0,
                oversFor: 0,
                runsAgainst: 0,
                oversAgainst: 0
            };
        });

        // 2. Process Completed Matches
        currentMatches.forEach(m => {
            if (m.status !== 'completed') return;

            const t1 = m.team1;
            const t2 = m.team2;

            // Ensure teams exist in our stats map (if added via match but not in table yet - rare but possible)
            if (!teamStats[t1]) teamStats[t1] = { team: t1, played: 0, won: 0, lost: 0, tied: 0, points: 0, nrr: 0, runsFor: 0, oversFor: 0, runsAgainst: 0, oversAgainst: 0 };
            if (!teamStats[t2]) teamStats[t2] = { team: t2, played: 0, won: 0, lost: 0, tied: 0, points: 0, nrr: 0, runsFor: 0, oversFor: 0, runsAgainst: 0, oversAgainst: 0 };

            const s1 = m.score.team1;
            const s2 = m.score.team2;

            // Ensure values are numbers for comparison
            const r1 = Number(s1.runs) || 0;
            const r2 = Number(s2.runs) || 0;
            const w1 = Number(s1.wickets) || 0;
            const w2 = Number(s2.wickets) || 0;
            const o1 = Number(s1.overs) || 0;
            const o2 = Number(s2.overs) || 0;

            // Update Played
            teamStats[t1].played += 1;
            teamStats[t2].played += 1;

            // Determine Result
            if (r1 > r2) {
                teamStats[t1].won += 1;
                teamStats[t1].points += 2;
                teamStats[t2].lost += 1;
            } else if (r2 > r1) {
                teamStats[t2].won += 1;
                teamStats[t2].points += 2;
                teamStats[t1].lost += 1;
            } else {
                teamStats[t1].tied += 1;
                teamStats[t1].points += 1;
                teamStats[t2].tied += 1;
                teamStats[t2].points += 1;
            }

            // NRR Calculation Data
            // Logic: If team is All Out (10 wkts or max wkts), use full overs quota.
            // But max wickets depends on team size? User said "11 Players" in task.md, so 10 wickets.
            // However, typically all out means balls bowled doesn't matter, we divide by full quota.
            // Quota is in `m.oversChoosen` (e.g. "6 Over").
            const matchOvers = parseInt(m.oversChoosen) || 6;

            const getOversVal = (overs, wickets) => {
                if (wickets >= 10) return matchOvers;
                return overs;
            };

            // Team 1 Batting / Team 2 Bowling
            teamStats[t1].runsFor += r1;
            teamStats[t1].oversFor += getOversVal(o1, w1);
            teamStats[t2].runsAgainst += r1;
            teamStats[t2].oversAgainst += getOversVal(o1, w1);

            // Team 2 Batting / Team 1 Bowling
            teamStats[t2].runsFor += r2;
            teamStats[t2].oversFor += getOversVal(o2, w2);
            teamStats[t1].runsAgainst += r2;
            teamStats[t1].oversAgainst += getOversVal(o2, w2);
        });

        // 3. Final NRR Calc & Array Conversion
        const updatedTable = Object.values(teamStats).map(t => {
            const runRateFor = t.oversFor > 0 ? t.runsFor / t.oversFor : 0;
            const runRateAgainst = t.oversAgainst > 0 ? t.runsAgainst / t.oversAgainst : 0;
            t.nrr = (runRateFor - runRateAgainst).toFixed(3);

            // Clean up temp props
            delete t.runsFor;
            delete t.oversFor;
            delete t.runsAgainst;
            delete t.oversAgainst;

            return t;
        });

        return updatedTable;
    };

    const updateMatch = async (id, updates) => {
        // Optimistic Update
        let updatedMatches = [];
        setMatches(prev => {
            updatedMatches = prev.map(m => m.id === id ? { ...m, ...updates } : m);
            return updatedMatches;
        });

        // Trigger Points Table Recalculation if status is 'completed' or changed
        // We just run it always on match update to be safe and simple (re-syncs everything)
        // But only if we have pointsTable loaded
        if (pointsTable.length > 0) {
            const newTable = recalculateStandings(updatedMatches, pointsTable);
            // Optimistic update of table
            setPointsTable(newTable);
            // We should persist this table update too, but `updatePointsTable` does that.
            // Let's call it.
            // Wait, `updatePointsTable` calls API. We should probably do that.
            // Check if actual values changed to avoid loop/spam? 
            // For now, let's just fire it. The user wants the update.

            // NOTE: calling updatePointsTable(newTable) inside here might be async race condition 
            // with the setMatches if we rely on `matches` state there, but we passed `updatedMatches` manually.
            // The issue is `updatePointsTable` also sets state. 
            // Let's call the API directly or use the helper but be careful.
            // To avoid complexity, we'll just fire-and-forget the table update via the helper 
            // which handles both state and API.
            updatePointsTable(newTable);
        }

        try {
            await fetch(`${API_BASE}/matches/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });
        } catch (err) { console.error("Update Match failed:", err); }
    };
    const forceRecalculatePoints = () => {
        if (matches.length > 0 && pointsTable.length > 0) {
            const newTable = recalculateStandings(matches, pointsTable);
            updatePointsTable(newTable);
            toast.success("Points Table recalculated successfully!");
        } else {
            toast.error("Not enough data to recalculate.");
        }
    };


    const addMatch = async (match) => {
        // Optimistic
        const maxId = matches.length > 0 ? Math.max(...matches.map(m => m.id)) : 0;
        const newMatch = { ...match, id: maxId + 1 };
        setMatches(prev => [...prev, newMatch]);

        try {
            await fetch(`${API_BASE}/matches`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newMatch)
            });
        } catch (err) { console.error("Add Match failed", err); }
    };

    const deleteMatch = async (id) => {
        setMatches(prev => prev.filter(m => m.id !== id));
        try {
            await fetch(`${API_BASE}/matches/${id}`, { method: 'DELETE' });
        } catch (err) { console.error("Delete Match failed", err); }
    };

    const updateImages = (newImages) => {
        setImages(newImages);
        updateSettings({ images: newImages });
    };

    const updatePointsTable = async (updatedTable) => {
        setPointsTable(updatedTable);
        try {
            await fetch(`${API_BASE}/teams/batch`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedTable)
            });
        } catch (err) { console.error("Update Table failed", err); }
    };

    const deleteTeam = async (teamName) => {
        setPointsTable(prev => prev.filter(t => t.team !== teamName));
        try {
            await fetch(`${API_BASE}/teams/${encodeURIComponent(teamName)}`, { method: 'DELETE' });
        } catch (err) { console.error("Delete Team failed", err); }
    };

    const addPlayer = async (player) => {
        const maxId = players.length > 0 ? Math.max(...players.map(p => p.id || 0)) : 0;
        const newPlayer = { ...player, id: maxId + 1 };
        setPlayers(prev => [...prev, newPlayer]);
        try {
            await fetch(`${API_BASE}/players`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newPlayer)
            });
        } catch (err) { console.error("Add Player failed", err); }
    };

    const updatePlayer = async (id, updates) => {
        setPlayers(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
        try {
            await fetch(`${API_BASE}/players/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });
        } catch (err) { console.error("Update Player failed", err); }
    };

    const batchUpdatePlayers = async (updates) => {
        // updates: [{ playerId, stats: { runs: 0, ... } }]
        // Optimistic State Update
        const updatedPlayers = players.map(p => {
            const update = updates.find(u => u.playerId === p.id);
            if (update) {
                const s = update.stats;
                return {
                    ...p,
                    matches: (p.matches || 0) + (s.matches || 0),
                    runs: (p.runs || 0) + (s.runs || 0),
                    balls: (p.balls || 0) + (s.balls || 0),
                    fours: (p.fours || 0) + (s.fours || 0),
                    sixes: (p.sixes || 0) + (s.sixes || 0),
                    fifties: (p.fifties || 0) + (s.fifties || 0),
                    hundreds: (p.hundreds || 0) + (s.hundreds || 0),
                    overs: (Number(p.overs) || 0) + (Number(s.overs) || 0),
                    maidens: (Number(p.maidens) || 0) + (Number(s.maidens) || 0),
                    runsConceded: (Number(p.runsConceded) || 0) + (Number(s.runsConceded) || 0),
                    wickets: (Number(p.wickets) || 0) + (Number(s.wickets) || 0),
                    highestScore: Math.max(Number(p.highestScore) || 0, Number(s.highestScore) || 0)
                };
            }
            return p;
        });
        setPlayers(updatedPlayers);

        // Prepare payload for backend (Full player objects or partials? Backend expects full Objects for bulk update in my impl)
        // Let's send the FULL updated player objects that changed
        const changedPlayers = updatedPlayers.filter(p => updates.some(u => u.playerId === p.id));
        try {
            await fetch(`${API_BASE}/players/batch`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(changedPlayers)
            });
        } catch (err) { console.error("Batch Update failed", err); }
    };

    const deletePlayer = async (id) => {
        setPlayers(prev => prev.filter(p => p.id !== id));
        try {
            await fetch(`${API_BASE}/players/${id}`, { method: 'DELETE' });
        } catch (err) { console.error("Delete Player failed", err); }
    };

    // Helper to update Settings
    const updateSettings = async (newSettings) => {
        try {
            await fetch(`${API_BASE}/settings`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newSettings)
            });
        } catch (err) { console.error("Settings Update failed", err); }
    };

    const addStadium = (stadium) => {
        if (!stadiums.includes(stadium)) {
            const newStadiums = [...stadiums, stadium];
            setStadiums(newStadiums);
            updateSettings({ stadiums: newStadiums });
        }
    };

    const deleteStadium = (stadium) => {
        const newStadiums = stadiums.filter(s => s !== stadium);
        setStadiums(newStadiums);
        updateSettings({ stadiums: newStadiums });
    };

    const addOverOption = (over) => {
        if (!oversOptions.includes(over)) {
            const newOpts = [...oversOptions, over];
            setOversOptions(newOpts);
            updateSettings({ oversOptions: newOpts });
        }
    };

    const deleteOverOption = (over) => {
        const newOpts = oversOptions.filter(o => o !== over);
        setOversOptions(newOpts);
        updateSettings({ oversOptions: newOpts });
    };

    // Helper to save all streams as one packed string
    const savePackedStreams = (u1, u2, u3, u4, u5) => {
        const packed = [u1, u2, u3, u4, u5].join('|');
        updateSettings({ liveStreamUrl: packed });
    };

    const wrappedSetLiveStreamMs1 = (url) => {
        setLiveStreamUrl(url);
        savePackedStreams(url, liveStreamUrl2, liveStreamUrl3, liveStreamUrl4, liveStreamUrl5);
    };
    const wrappedSetLiveStreamMs2 = (url) => {
        setLiveStreamUrl2(url);
        savePackedStreams(liveStreamUrl, url, liveStreamUrl3, liveStreamUrl4, liveStreamUrl5);
    };
    const wrappedSetLiveStreamMs3 = (url) => {
        setLiveStreamUrl3(url);
        savePackedStreams(liveStreamUrl, liveStreamUrl2, url, liveStreamUrl4, liveStreamUrl5);
    };
    const wrappedSetLiveStreamMs4 = (url) => {
        setLiveStreamUrl4(url);
        savePackedStreams(liveStreamUrl, liveStreamUrl2, liveStreamUrl3, url, liveStreamUrl5);
    };
    const wrappedSetLiveStreamMs5 = (url) => {
        setLiveStreamUrl5(url);
        savePackedStreams(liveStreamUrl, liveStreamUrl2, liveStreamUrl3, liveStreamUrl4, url);
    };
    const wrappedSetTournamentTitle = (title) => {
        setTournamentTitle(title);
        updateSettings({ tournamentTitle: title });
    };
    const wrappedSetScrollingText = (text) => {
        setScrollingText(text);
        updateSettings({ scrollingText: text });
    };


    const resetData = async () => {
        setMatches([]);
        setPointsTable([]);
        setPlayers([]);
        setImages(INITIAL_IMAGES); // Force client-side default immediately
        try {
            await fetch(`${API_BASE}/wipe`, { method: 'DELETE' });
            // FORCE UPDATE BACKEND with correct defaults immediately after wipe
            // This prevents the backend from serving its own (old) defaults on next fetch
            await updateSettings({ images: INITIAL_IMAGES });
            toast.success("All data wiped. Images reset to Cloudinary defaults.");
        } catch (err) { console.error("Wipe failed", err); }
    };

    // Derived state
    const allTeams = pointsTable.map(team => team.team);

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
            deleteTeam,
            allTeams,
            players,
            addPlayer,
            updatePlayer,
            batchUpdatePlayers,
            deletePlayer,
            tournamentTitle,
            updateTournamentTitle: wrappedSetTournamentTitle,
            stadiums,
            addStadium,
            deleteStadium,
            oversOptions,
            addOverOption,
            deleteOverOption,
            liveStreamUrl,
            setLiveStreamUrl: wrappedSetLiveStreamMs1,
            liveStreamUrl2,
            setLiveStreamUrl2: wrappedSetLiveStreamMs2,
            liveStreamUrl3,
            setLiveStreamUrl3: wrappedSetLiveStreamMs3,
            liveStreamUrl4,
            setLiveStreamUrl4: wrappedSetLiveStreamMs4,
            liveStreamUrl5,
            setLiveStreamUrl5: wrappedSetLiveStreamMs5,
            scrollingText,
            setScrollingText: wrappedSetScrollingText,
            resetData,
            forceRecalculatePoints
        }}>
            {children}
        </GameContext.Provider>
    );
};