import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increase limit for images

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://rpls2_db:rpls2%401015@rpls2.kek0jap.mongodb.net/?appName=rpls2';

mongoose.connect(MONGODB_URI)
    .then(() => console.log('MongoDB Atlas Connected Successfully'))
    .catch(err => console.error('MongoDB Connection Error:', err));

// Schemas

// 1. Matches Schema
const MatchSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true }, // Keeping numeric ID for frontend compatibility
    status: { type: String, default: 'upcoming' },
    date: Date,
    matchType: String, // Group Stage, Final, etc.
    team1: String,
    team2: String,
    stadium: String,
    oversChoosen: String,
    manOfTheMatch: String,
    tossResult: String,
    score: {
        team1: { runs: Number, wickets: Number, overs: Number, extras: Number },
        team2: { runs: Number, wickets: Number, overs: Number, extras: Number }
    },
    innings1Overs: Array, // Free-form array for complex nested objects
    innings2Overs: Array,
    batting: Array,
    bowling: Array,
    secondInningsBatting: Array,
    secondInningsBowling: Array,
    pointsProcessed: { type: Boolean, default: false },
    statsProcessed: { type: Boolean, default: false }
});
const Match = mongoose.model('Match', MatchSchema);

// 2. Teams (Points Table) Schema
const TeamSchema = new mongoose.Schema({
    team: { type: String, required: true, unique: true },
    played: { type: Number, default: 0 },
    won: { type: Number, default: 0 },
    lost: { type: Number, default: 0 },
    tied: { type: Number, default: 0 },
    nrr: { type: Number, default: 0 },
    points: { type: Number, default: 0 },
    logo: String // Base64 or URL
});
const Team = mongoose.model('Team', TeamSchema);

// 3. Players Schema
const PlayerSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    name: String,
    team: String,
    role: String,
    isCaptain: { type: Boolean, default: false },
    isViceCaptain: { type: Boolean, default: false },
    image: String,
    matches: { type: Number, default: 0 },
    runs: { type: Number, default: 0 },
    balls: { type: Number, default: 0 },
    fours: { type: Number, default: 0 },
    sixes: { type: Number, default: 0 },
    fifties: { type: Number, default: 0 },
    hundreds: { type: Number, default: 0 },
    overs: { type: Number, default: 0 }, // Store as total balls if preferred, but existing is numeric float
    maidens: { type: Number, default: 0 },
    runsConceded: { type: Number, default: 0 },
    wickets: { type: Number, default: 0 },
    highestScore: { type: Number, default: 0 },
    bestBowling: String
});
const Player = mongoose.model('Player', PlayerSchema);

// 4. Settings Schema (Singleton)
const SettingsSchema = new mongoose.Schema({
    key: { type: String, default: 'global' }, // Use a fixed key to find it
    tournamentTitle: { name: String, season: String },
    stadiums: [String],
    oversOptions: [String],
    images: { type: Object, default: {} }, // carousel: [], etc.
    liveStreamUrl: String,
    liveStreamUrl2: String
});
const Settings = mongoose.model('Settings', SettingsSchema);


// API Routes



// Helper: Recalculate Logic
async function recalculateTournamentStats() {
    try {
        // 1. Reset Teams
        await Team.updateMany({}, { $set: { played: 0, won: 0, lost: 0, tied: 0, nrr: 0, points: 0 } });

        // 2. Reset Players (Keep basic info, reset stats)
        await Player.updateMany({}, {
            $set: {
                matches: 0, runs: 0, balls: 0, fours: 0, sixes: 0,
                fifties: 0, hundreds: 0,
                overs: 0, maidens: 0, runsConceded: 0, wickets: 0,
                highestScore: 0 // Resetting creates issue if old HS was better than this tournament, but user implies tournament stats
            }
        });

        // 3. Fetch Completed Matches
        const matches = await Match.find({ status: 'completed' });
        const teams = await Team.find();
        const players = await Player.find();

        const teamMap = new Map();
        teams.forEach(t => teamMap.set(t.team, t));

        const playerMap = new Map();
        players.forEach(p => playerMap.set(p.id, p));

        for (const m of matches) {
            // A. Update Teams (Points Table)
            const t1 = teamMap.get(m.team1);
            const t2 = teamMap.get(m.team2);

            if (t1 && t2) {
                t1.played += 1;
                t2.played += 1;

                const r1 = m.score.team1.runs;
                const r2 = m.score.team2.runs;

                if (r1 > r2) {
                    t1.won += 1; t1.points += 2;
                    t2.lost += 1;
                } else if (r2 > r1) {
                    t2.won += 1; t2.points += 2;
                    t1.lost += 1;
                } else {
                    t1.tied += 1; t1.points += 1;
                    t2.tied += 1; t2.points += 1;
                }
                // NRR Logic omitted for simplicity unless requested, requires complexity
            }

            // B. Update Players
            // Helper to add stats
            const addStats = (list, type) => {
                if (!list) return;
                list.forEach(entry => {
                    const p = players.find(pl => pl.name === entry.name && (pl.team === m.team1 || pl.team === m.team2));
                    // Note: Matching by name/team is risky if transfers occur, but match data doesn't store IDs typically in this app's form. 
                    // Ideally check ID if stored. Existing form saves 'name'.
                    // Let's try to match by Name + Team context

                    if (p) {
                        // Update in-memory map/obj
                        if (type === 'batting') {
                            const r = Number(entry.runs) || 0;
                            p.matches += 1; // Count match participation once? No, this runs for both innings. 
                            // Wait, if a player bats AND bowls, matches shouldn't increment twice.
                            // We need a Set of playerIDs for this match to increment participation once.
                            p.runs += r;
                            p.balls += Number(entry.balls) || 0;
                            p.fours += Number(entry.fours) || 0;
                            p.sixes += Number(entry.sixes) || 0;
                            if (r >= 50 && r < 100) p.fifties += 1;
                            if (r >= 100) p.hundreds += 1;
                            if (r > p.highestScore) p.highestScore = r;
                        } else {
                            p.overs += Number(entry.overs) || 0;
                            p.maidens += Number(entry.maidens) || 0;
                            p.runsConceded += Number(entry.runs) || 0;
                            p.wickets += Number(entry.wickets) || 0;
                        }
                    }
                });
            };

            // Process Participation Unique Set
            const participatingIDs = new Set();
            const findAndMark = (list, teamName) => {
                if (!list) return;
                list.forEach(entry => {
                    if (!entry.name) return;
                    const p = players.find(pl => pl.name === entry.name && pl.team === teamName);
                    if (p) participatingIDs.add(p.id);
                });
            };
            findAndMark(m.batting, m.team1);
            findAndMark(m.bowling, m.team2);
            findAndMark(m.secondInningsBatting, m.team2);
            findAndMark(m.secondInningsBowling, m.team1);

            participatingIDs.forEach(pid => {
                const p = playerMap.get(pid);
                if (p) p.matches += 1;
            });

            // Add raw stats
            // Batting (Team 1)
            if (m.batting) m.batting.forEach(entry => {
                const p = players.find(pl => pl.name === entry.name && pl.team === m.team1);
                if (p) {
                    const r = Number(entry.runs) || 0;
                    p.runs += r;
                    p.balls += Number(entry.balls) || 0;
                    p.fours += Number(entry.fours) || 0;
                    p.sixes += Number(entry.sixes) || 0;
                    if (r >= 50 && r < 100) p.fifties += 1;
                    if (r >= 100) p.hundreds += 1;
                    if (r > p.highestScore) p.highestScore = r;
                }
            });
            // Batting (Team 2)
            if (m.secondInningsBatting) m.secondInningsBatting.forEach(entry => {
                const p = players.find(pl => pl.name === entry.name && pl.team === m.team2);
                if (p) {
                    const r = Number(entry.runs) || 0;
                    p.runs += r;
                    p.balls += Number(entry.balls) || 0;
                    p.fours += Number(entry.fours) || 0;
                    p.sixes += Number(entry.sixes) || 0;
                    if (r >= 50 && r < 100) p.fifties += 1;
                    if (r >= 100) p.hundreds += 1;
                    if (r > p.highestScore) p.highestScore = r;
                }
            });
            // Bowling (Team 2 bowling to T1)
            if (m.bowling) m.bowling.forEach(entry => {
                const p = players.find(pl => pl.name === entry.name && pl.team === m.team2);
                if (p) {
                    p.overs += Number(entry.overs) || 0;
                    p.maidens += Number(entry.maidens) || 0;
                    p.runsConceded += Number(entry.runs) || 0;
                    p.wickets += Number(entry.wickets) || 0;
                }
            });
            // Bowling (Team 1 bowling to T2)
            if (m.secondInningsBowling) m.secondInningsBowling.forEach(entry => {
                const p = players.find(pl => pl.name === entry.name && pl.team === m.team1);
                if (p) {
                    p.overs += Number(entry.overs) || 0;
                    p.maidens += Number(entry.maidens) || 0;
                    p.runsConceded += Number(entry.runs) || 0;
                    p.wickets += Number(entry.wickets) || 0;
                }
            });
        }

        // 4. Save All (Bulk Write)
        const teamOps = teams.map(t => ({
            updateOne: {
                filter: { _id: t._id },
                update: { $set: { played: t.played, won: t.won, lost: t.lost, tied: t.tied, points: t.points, nrr: t.nrr } }
            }
        }));
        if (teamOps.length > 0) await Team.bulkWrite(teamOps);

        const playerOps = players.map(p => ({
            updateOne: {
                filter: { _id: p._id },
                update: {
                    $set: {
                        matches: p.matches, runs: p.runs, balls: p.balls, fours: p.fours, sixes: p.sixes,
                        fifties: p.fifties, hundreds: p.hundreds, highestScore: p.highestScore,
                        overs: p.overs, maidens: p.maidens, runsConceded: p.runsConceded, wickets: p.wickets
                    }
                }
            }
        }));
        if (playerOps.length > 0) await Player.bulkWrite(playerOps);

        console.log("Stats Recalculated Successfully");

    } catch (err) {
        console.error("Recalculation Failed:", err);
    }
}

// ---------------------------------------------------------------------

// API Routes Updates for Hooks

// Matches Routes
app.get('/api/matches', async (req, res) => {
    try {
        const matches = await Match.find().sort({ id: 1 });
        res.json(matches);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/matches', async (req, res) => {
    try {
        const newMatch = new Match(req.body);
        await newMatch.save();

        // Trigger if completed
        if (newMatch.status === 'completed') {
            await recalculateTournamentStats();
        }

        res.status(201).json(newMatch);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.put('/api/matches/:id', async (req, res) => {
    try {
        const updatedMatch = await Match.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });

        // Trigger always if status involved or just generally safe to trigger
        await recalculateTournamentStats();

        res.json(updatedMatch);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/matches/:id', async (req, res) => {
    try {
        await Match.findOneAndDelete({ id: req.params.id });
        await recalculateTournamentStats(); // Recalc to remove match stats
        res.json({ message: 'Deleted' });
    } catch (err) { res.status(400).json({ error: err.message }); }
});


// Teams Routes
app.get('/api/teams', async (req, res) => {
    try {
        const teams = await Team.find().sort({ points: -1 });
        res.json(teams);
    } catch (err) { res.status(500).json({ error: err.message }); }
});
app.post('/api/teams/batch', async (req, res) => { // For updatePointsTable
    try {
        // Full replace logic for points table is complex via API, 
        // usually we update specific teams. But context sends whole table.
        // We will perform bulkWrite upside
        const operations = req.body.map(team => ({
            updateOne: {
                filter: { team: team.team },
                update: { $set: team },
                upsert: true
            }
        }));
        if (operations.length > 0) {
            await Team.bulkWrite(operations);
        }
        const teams = await Team.find();
        res.json(teams);
    } catch (err) { res.status(400).json({ error: err.message }); }
});
app.delete('/api/teams/:teamName', async (req, res) => {
    try {
        // Find by team name
        const result = await Team.findOneAndDelete({ team: req.params.teamName });
        if (!result) return res.status(404).json({ message: 'Team not found' });
        res.json({ message: 'Deleted', team: result });
    } catch (err) { res.status(400).json({ error: err.message }); }
});


// Players Routes
app.get('/api/players', async (req, res) => {
    try {
        const players = await Player.find();
        res.json(players);
    } catch (err) { res.status(500).json({ error: err.message }); }
});
app.post('/api/players', async (req, res) => {
    try {
        const newPlayer = new Player(req.body);
        await newPlayer.save();
        res.status(201).json(newPlayer);
    } catch (err) { res.status(400).json({ error: err.message }); }
});
app.put('/api/players/:id', async (req, res) => {
    try {
        const updated = await Player.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
        res.json(updated);
    } catch (err) { res.status(400).json({ error: err.message }); }
});
app.post('/api/players/batch', async (req, res) => { // For batch stats updates
    try {
        const operations = req.body.map(p => ({
            updateOne: {
                filter: { id: p.id },
                update: { $set: p },
                upsert: true
            }
        }));
        if (operations.length > 0) {
            await Player.bulkWrite(operations);
        }
        res.json({ message: 'Batch updated' });
    } catch (err) { res.status(400).json({ error: err.message }); }
});
app.delete('/api/players/:id', async (req, res) => {
    try {
        await Player.findOneAndDelete({ id: req.params.id });
        res.json({ message: 'Deleted' });
    } catch (err) { res.status(400).json({ error: err.message }); }
});


// Settings Routes
app.get('/api/settings', async (req, res) => {
    try {
        let settings = await Settings.findOne({ key: 'global' });
        if (!settings) {
            settings = new Settings({ key: 'global' });
            await settings.save();
        }
        res.json(settings);
    } catch (err) { res.status(500).json({ error: err.message }); }
});
app.put('/api/settings', async (req, res) => {
    try {
        const settings = await Settings.findOneAndUpdate({ key: 'global' }, req.body, { new: true, upsert: true });
        res.json(settings);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

// Wipe Data
app.delete('/api/wipe', async (req, res) => {
    try {
        await Match.deleteMany({});
        await Team.deleteMany({});
        await Player.deleteMany({});
        // Keep settings generally, or wipe specific parts? 
        // User's 'resetData' function in context cleared everything.
        // Let's reset settings to defaults but keep key
        await Settings.findOneAndUpdate({ key: 'global' }, {
            tournamentTitle: { name: 'Revenue Premier League', season: 'S2' },
            stadiums: ['Indoor Stadium, Pramdom', 'Turf, Pathanamthitta'],
            oversOptions: ['6 Over', '8 Over', '10 Over'],
            liveStreamUrl: '',
            liveStreamUrl2: ''
        });

        res.json({ message: 'All data wiped' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
